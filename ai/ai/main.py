# ai/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import torch
from typing import List
import tempfile

app = FastAPI(title="AI Inference API", version="1.0.0")

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "ok", "device": "cuda" if torch.cuda.is_available() else "cpu"}

###############################################################################################
import joblib
import pandas as pd
from datetime import timedelta
import re
from pathlib import Path

from .tomato_common import (
    load_new_ja_file,                 # ★追加：CSVのみ読み込み
    detect_ja_holiday_and_offseason,
    load_weather_from_jma_csv,
    merge_ship_and_weather,
    add_lag_and_calendar_features,
    add_future_weather_features,
    get_latest_feature_row,
    fetch_weather_forecast_from_owm
)

# ===== 設定 =====
# ★使うのはこれだけ
# /models は Dockerfile で VOLUME 宣言済み（永続化前提）
BASE_DIR = Path(__file__).resolve().parent        # /app/ai
PROJECT_ROOT = BASE_DIR.parent

MODEL_PATH = PROJECT_ROOT / "ai_artifacts" / "models" / "models_bundle_without_WR.joblib"
WEATHER_CSV_PATH = PROJECT_ROOT / "ai_artifacts" / "models" / "data (1).csv"

# OpenWeatherMap
OWM_API_KEY = "bdfd03661d11ced41c19dffd70d79a36"
OWM_LAT = 35.118
OWM_LON = 138.918
###############################################################################################
def make_daily_series_from_new_csv(csv_path: str) -> pd.DataFrame:
    """
    日付の抜けを 0 で埋めた連続日次系列にする。
    """
    daily = load_new_ja_file(csv_path)  # index=date, column=shipped_kg
    if daily.empty:
        raise ValueError(f"CSVから有効なデータが作れませんでした: {csv_path}")

    start = daily.index.min()
    end = daily.index.max()
    all_index = pd.date_range(start, end, freq="D")

    daily_full = daily.reindex(all_index, fill_value=0.0)
    daily_full.index.name = "date"
    return daily_full

def _get_feature_row_by_date(feat: pd.DataFrame, feature_cols: list, base_date) -> pd.DataFrame | None:
    """
    feat から base_date に対応する 1行（特徴量）を取り出す。
    feat の日付が index でも column でも動くようにする。
    """
    bd = pd.to_datetime(base_date).normalize()

    # 1) index が datetime の場合
    if isinstance(feat.index, pd.DatetimeIndex):
        if bd in feat.index:
            x = feat.loc[[bd], feature_cols].copy()
            return x
        return None

    # 2) 日付カラム候補を探す
    date_col_candidates = ["date", "ds", "target_date", "base_date", "日付"]
    date_col = next((c for c in date_col_candidates if c in feat.columns), None)

    if date_col is None:
        # どこにも日付が見つからない
        return None

    tmp = feat.copy()
    tmp[date_col] = pd.to_datetime(tmp[date_col]).dt.normalize()
    hit = tmp[tmp[date_col] == bd]
    if hit.empty:
        return None

    # 複数ヒットする可能性があるので最後の1行を採用
    x = hit.tail(1)[feature_cols].copy()
    return x

def wide_row_to_forecast_list(wide_df: pd.DataFrame) -> pd.DataFrame:
    """
    wide_df の先頭1行を使って、pred_result 形式の DataFrame を作成する。
    列例: base_date, 1日後, 2日後, ... 14日後

    Returns:
        DataFrame:
            horizon_days | target_date | forecast_kg
    """
    if wide_df.empty:
        return pd.DataFrame(columns=["horizon_days", "target_date", "forecast_kg"])

    row = wide_df.iloc[0]

    # base_date を datetime に（date / string 両対応）
    base = pd.to_datetime(row["base_date"])

    records = []

    for col in wide_df.columns:
        if col == "base_date":
            continue

        # "1日後" -> 1
        m = re.match(r"^(\d+)日後$", str(col))
        if not m:
            continue

        horizon = int(m.group(1))
        target_date = (base + pd.Timedelta(days=horizon)).date()  # ← 日付のみ
        forecast_kg = float(row[col])

        records.append(
            {
                "horizon_days": horizon,
                "target_date": target_date,
                "forecast_kg": forecast_kg,
            }
        )

    # DataFrame 化 & 並び替え
    pred_result = (
        pd.DataFrame(records)
        .sort_values("horizon_days")
        .reset_index(drop=True)
    )

    return pred_result

def main(new_ja_csv_path: str):
    bundle = joblib.load(MODEL_PATH)
    models = bundle["models"]
    feature_cols = bundle["feature_cols"]

    use_weather = bool(bundle.get("use_weather", False))

    short_zero_max = bundle["short_zero_max"]
    long_zero_min = bundle["long_zero_min"]
    new_cutoff = bundle["new_cutoff"]

    daily_all = make_daily_series_from_new_csv(new_ja_csv_path)

    daily_base = detect_ja_holiday_and_offseason(
        daily_full=daily_all,
        short_zero_max=short_zero_max,
        long_zero_min=long_zero_min
    )

    base_for_feat = daily_base

    feat = add_lag_and_calendar_features(base_for_feat)
    feat = add_future_weather_features(feat, max_horizon=14)

    # 最新日を取得（既存関数を流用）
    latest_base_date, _ = get_latest_feature_row(feat, feature_cols)
    latest_base_date = pd.to_datetime(latest_base_date).normalize()

    # 2) OWM予報（1〜7日）：これは「未来の温度」に対するものなので、過去base_dateに対しては基本使わない想定
    #    ※「最新日（今日）だけ予報で差し替え」などしたいなら下のロジックを拡張してください

    # 3) 最新日から過去375日分の base_date について予測（横持ち）
    SAVE_INTERVAL_80 = False  # 必要なら True

    rows = []
    skipped = 0

    # 「最新日から375日前まで」= 0..375 の 376日分
    for back in range(0, 1):
        base_date = latest_base_date - pd.Timedelta(days=back)

        X_base = _get_feature_row_by_date(feat, feature_cols, base_date)
        if X_base is None:
            skipped += 1
            continue

        row = {"base_date": base_date.date()}  # CSVで見やすいよう date にしておく（TimestampでもOK）

        for h in range(1, 15):
            model_h = models[h]
            X_h = X_base.copy()

            # OWM予報の差し替えは「最新日（latest_base_date）だけ」に限定（必要なら変更してください）
            col_name = f"temp_avg_h{h}"

            pred = float(model_h.predict(X_h)[0])
            row[f"{h}日後"] = pred

            if SAVE_INTERVAL_80:
                m = bundle.get("metrics", {}).get(h, {})
                err_p80 = float(m.get("err_p80", 0.0))
                lower_80 = max(0.0, pred - err_p80)
                upper_80 = pred + err_p80
                row[f"{h}日後_lower80"] = lower_80
                row[f"{h}日後_upper80"] = upper_80

        rows.append(row)

    wide_df = pd.DataFrame(rows)

    # カラム順を整える
    base_cols = ["base_date"] + [f"{i}日後" for i in range(1, 15)]
    if SAVE_INTERVAL_80:
        interval_cols = []
        for i in range(1, 15):
            interval_cols += [f"{i}日後_lower80", f"{i}日後_upper80"]
        ordered_cols = base_cols + interval_cols
    else:
        ordered_cols = base_cols

    ordered_cols = [c for c in ordered_cols if c in wide_df.columns]
    wide_df = wide_df[ordered_cols]

    # base_date の昇順に並べ替え（見やすさ）
    wide_df["base_date"] = pd.to_datetime(wide_df["base_date"])
    wide_df = wide_df.sort_values("base_date").reset_index(drop=True)
    wide_df["base_date"] = wide_df["base_date"].dt.date
    
    forecast_list = wide_row_to_forecast_list(wide_df)

    print("forecast_list#################################################")
    print(forecast_list)

    return forecast_list

# ★ 既存の関数名 health_check と被っていたので、pred に変更
@app.post("/ai/pred")
async def pred(file: UploadFile = File(...)):
    # 拡張子チェック（任意）
    if file.filename and not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSVファイルのみ対応しています")

    # UploadFile を一時ファイルに保存して pandas が読めるようにする
    suffix = Path(file.filename).suffix if file.filename else ".csv"

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            content = await file.read()
            tmp.write(content)

        pred_result = main(tmp_path)

        print("pred_result#################################################")
        print(pred_result)

        return {
            "status": "ok",
            "device": "cuda" if torch.cuda.is_available() else "cpu",
            "result": pred_result.to_json(orient="records", date_format="iso")
        }

    except ValueError as e:
        # CSVからデータ作れない等
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推論処理に失敗しました: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)