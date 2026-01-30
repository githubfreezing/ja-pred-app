#tomato_common.py
import pandas as pd
import numpy as np
import requests

from io import StringIO
from datetime import timedelta


# ============================================================
# 1. 新フォーマット JA CSV の読み込み
# ============================================================

def load_new_ja_file(path: str, product_keyword: str = "ミニトマト") -> pd.DataFrame:
    df = pd.read_csv(path, encoding="cp932")

    if "商品名" not in df.columns:
        raise ValueError("列 '商品名' が見つかりません")
    df = df[df["商品名"].astype(str).str.contains(product_keyword)]

    if "荷受日" not in df.columns:
        raise ValueError("列 '荷受日' が見つかりません")
    df["date"] = pd.to_datetime(df["荷受日"])

    def parse_weight_to_g(x):
        s = str(x).strip()
        s = s.replace("　", "").replace("Ｇ", "g").replace("ｇ", "g")
        s = s.replace("Ｋ", "k").replace("ｋ", "k")
        if "kg" in s:
            num = s.replace("kg", "").strip()
            try:
                return float(num) * 1000
            except Exception:
                return np.nan
        if "g" in s:
            num = s.replace("g", "").strip()
            try:
                return float(num)
            except Exception:
                return np.nan
        try:
            return float(s)
        except Exception:
            return 240.0

    if "量目" not in df.columns:
        raise ValueError("列 '量目' が見つかりません")
    df["weight_g"] = df["量目"].apply(parse_weight_to_g)

    if "数量" not in df.columns:
        raise ValueError("列 '数量' が見つかりません")
    df["pack_count"] = pd.to_numeric(df["数量"], errors="coerce").fillna(0)

    df["shipped_g"] = df["weight_g"] * df["pack_count"]

    daily = df.groupby("date")["shipped_g"].sum().to_frame()
    daily["shipped_kg"] = daily["shipped_g"] / 1000.0
    daily = daily[["shipped_kg"]].sort_index()
    daily.index.name = "date"
    return daily


# ============================================================
# 2. R7フォーマットの読み込み（共計名カナ→g換算）
# ============================================================

def add_date_and_grams_r7(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["date"] = pd.to_datetime(
        df["年"].astype(int).astype(str) + "-" +
        df["月"].astype(int).astype(str) + "-" +
        df["日"].astype(int).astype(str)
    )

    def grams_per_unit(name: str) -> int:
        s = str(name)
        if "5kg" in s:
            return 5000
        if "3kg" in s:
            return 3000
        if "280g" in s:
            return 280
        if "400g" in s:
            return 400
        return 240

    df["grams_per_unit"] = df["共計名カナ"].apply(grams_per_unit)
    df["shipped_g"] = df["売立数量"] * df["grams_per_unit"]
    return df


def load_and_aggregate_daily_r7(file_paths):
    dfs = []
    for path in file_paths:
        df = pd.read_excel(path)
        df = add_date_and_grams_r7(df)
        dfs.append(df)

    all_df = pd.concat(dfs, ignore_index=True)

    daily_g = (
        all_df.groupby("date")["shipped_g"]
        .sum()
        .rename("shipped_g")
        .sort_index()
    )

    daily = daily_g.to_frame()
    daily["shipped_kg"] = daily["shipped_g"] / 1000.0
    daily = daily[["shipped_kg"]]
    daily.index.name = "date"
    return daily


# ============================================================
# 3. 古い rev_marge データ（日次kg）
# ============================================================

def load_old_daily_from_rev_marge(path: str) -> pd.DataFrame:
    df = pd.read_excel(path)

    if "プール期間自日" not in df.columns:
        raise ValueError("列 'プール期間自日' が見つかりません")

    df["date"] = pd.to_datetime(df["プール期間自日"])

    daily_units = (
        df.groupby("date")["売立数量"]
        .sum()
        .rename("sold_units")
        .sort_index()
    )

    daily = daily_units.to_frame()
    daily["shipped_kg"] = daily["sold_units"] * 0.24
    daily = daily[["shipped_kg"]]
    daily.index.name = "date"
    return daily


# ============================================================
# 4. 全データをマージして連続日付化
# ============================================================

def build_full_daily_series(
    old_path: str,
    r7_paths: list,
    new_ja_path: str,
    new_cutoff: str = "2025-11-01"
) -> pd.DataFrame:
    daily_old = load_old_daily_from_rev_marge(old_path)
    daily_r7  = load_and_aggregate_daily_r7(r7_paths)
    daily_new_raw = load_new_ja_file(new_ja_path)

    cutoff = pd.to_datetime(new_cutoff)
    daily_new = daily_new_raw[daily_new_raw.index >= cutoff]

    overlap_idx = daily_old.index.intersection(daily_r7.index)
    if len(overlap_idx) > 0:
        daily_old = daily_old[~daily_old.index.isin(overlap_idx)]

    all_start = daily_old.index.min()
    all_end   = max(daily_r7.index.max(), daily_new.index.max())
    all_index = pd.date_range(all_start, all_end, freq="D")

    daily_all = (
        pd.concat([daily_old, daily_r7, daily_new])
        .groupby(level=0)
        .sum()
        .reindex(all_index, fill_value=0.0)
    )
    daily_all.index.name = "date"
    return daily_all


# ============================================================
# 5. JA休業日 & オフシーズン推定
# ============================================================

def detect_ja_holiday_and_offseason(
    daily_full: pd.DataFrame,
    short_zero_max: int,
    long_zero_min: int
) -> pd.DataFrame:
    df = daily_full.copy()

    df["is_zero"] = (df["shipped_kg"] == 0).astype(int)
    df["zero_group"] = (df["is_zero"].diff().ne(0)).cumsum()

    zero_lengths = (
        df.loc[df["is_zero"] == 1]
        .groupby("zero_group")
        .size()
    )

    df["zero_run_len"] = 0
    df.loc[df["is_zero"] == 1, "zero_run_len"] = (
        df.loc[df["is_zero"] == 1, "zero_group"].map(zero_lengths)
    )

    df["is_ja_holiday"] = (
        (df["is_zero"] == 1) &
        (df["zero_run_len"] <= short_zero_max)
    ).astype(int)

    df["is_offseason"] = (
        (df["is_zero"] == 1) &
        (df["zero_run_len"] >= long_zero_min)
    ).astype(int)

    df["after_ja_holiday"] = df["is_ja_holiday"].shift(1, fill_value=0).astype(int)
    df["before_ja_holiday"] = df["is_ja_holiday"].shift(-1, fill_value=0).astype(int)

    df.index.name = "date"
    return df


# ============================================================
# 6. 気象データ（気象庁 CSV）
# ============================================================

def load_weather_from_jma_csv(path: str) -> pd.DataFrame:
    with open(path, encoding="shift_jis", errors="ignore") as f:
        lines = f.readlines()

    header_row = None
    for i, line in enumerate(lines):
        if "年月日" in line:
            header_row = i
            break
    if header_row is None:
        raise ValueError("ヘッダー行（年月日を含む）が見つかりません。")

    csv_text = "".join(lines[header_row:])
    df = pd.read_csv(StringIO(csv_text))
    df = df.replace({"×": np.nan, "…": np.nan, "---": np.nan})

    col_date     = [c for c in df.columns if "年月日" in c][0]
    col_temp_avg = [c for c in df.columns if "平均気温" in c][0]
    col_temp_max = [c for c in df.columns if "最高気温" in c][0]
    col_temp_min = [c for c in df.columns if "最低気温" in c][0]

    df = df[[col_date, col_temp_avg, col_temp_max, col_temp_min]].copy()
    df.columns = ["date", "temp_avg", "temp_max", "temp_min"]

    for col in ["temp_avg", "temp_max", "temp_min"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"]).sort_values("date").reset_index(drop=True)
    return df


def merge_ship_and_weather(daily_base: pd.DataFrame, weather_daily: pd.DataFrame) -> pd.DataFrame:
    ship_start = daily_base.index.min()
    ship_end   = daily_base.index.max()
    w_start    = weather_daily["date"].min()
    w_end      = weather_daily["date"].max()

    common_start = max(ship_start, w_start)
    common_end   = min(ship_end, w_end)

    daily_base_cut = daily_base.loc[(daily_base.index >= common_start) & (daily_base.index <= common_end)]
    weather_cut = weather_daily[(weather_daily["date"] >= common_start) & (weather_daily["date"] <= common_end)]

    merged = (
        daily_base_cut.reset_index()
        .merge(weather_cut, on="date", how="left")
        .set_index("date")
    )

    if "temp_avg" in merged.columns:
        merged["temp_avg"] = merged["temp_avg"].ffill().fillna(0.0)

    return merged


# ============================================================
# 7. 特徴量生成 & ターゲット
# ============================================================

def add_lag_and_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().reset_index()
    if "date" not in df.columns:
        df = df.rename(columns={"index": "date"})

    df["weekday"] = df["date"].dt.weekday
    df["is_weekend"] = df["weekday"].isin([5, 6]).astype(int)
    df["month"] = df["date"].dt.month

    df["lag_1"] = df["shipped_kg"].shift(1)
    df["lag_2"] = df["shipped_kg"].shift(2)
    df["lag_3"] = df["shipped_kg"].shift(3)
    df["lag_7"] = df["shipped_kg"].shift(7)

    df["rolling_mean_7"]  = df["shipped_kg"].shift(1).rolling(7).mean()
    df["rolling_mean_14"] = df["shipped_kg"].shift(1).rolling(14).mean()
    df["rolling_sum_7"]   = df["shipped_kg"].shift(1).rolling(7).sum()
    df["rolling_std_7"]   = df["shipped_kg"].shift(1).rolling(7).std()

    if "temp_avg" in df.columns:
        df["temp_avg_7d_mean"] = df["temp_avg"].rolling(7).mean()
        df["temp_avg_lag30"] = df["temp_avg"].shift(30)
        df["temp_avg_30d_mean"] = df["temp_avg"].rolling(30).mean()
        df["temp_avg_30d_mean_lag30"] = df["temp_avg_30d_mean"].shift(30)
        df["gdd"] = (df["temp_avg"] - 10).clip(lower=0)
        df["gdd_45d"] = df["gdd"].rolling(45).sum()

    return df


def add_future_weather_features(df: pd.DataFrame, max_horizon: int = 14) -> pd.DataFrame:
    df = df.copy()
    if "temp_avg" not in df.columns:
        return df

    for h in range(1, max_horizon + 1):
        df[f"temp_avg_h{h}"] = df["temp_avg"].shift(-h)
    return df


def add_targets(df: pd.DataFrame, max_horizon: int = 14) -> pd.DataFrame:
    df = df.copy()
    for h in range(1, max_horizon + 1):
        df[f"target_{h}"] = df["shipped_kg"].shift(-h)
    return df


def get_feature_cols(use_weather: bool) -> list:
    base = [
        "shipped_kg",
        "lag_1", "lag_2", "lag_3", "lag_7",
        "rolling_mean_7", "rolling_mean_14",
        "rolling_sum_7", "rolling_std_7",
        "weekday", "is_weekend", "month",
        "is_ja_holiday", "is_offseason",
        "before_ja_holiday", "after_ja_holiday",
    ]
    if not use_weather:
        return base

    weather = base + [
        "temp_avg",
        "temp_avg_7d_mean",
        "temp_avg_lag30",
        "temp_avg_30d_mean_lag30",
        "gdd_45d",
    ] + [f"temp_avg_h{h}" for h in range(1, 15)]
    return weather


# ============================================================
# 8. OWM 予報
# ============================================================

def fetch_weather_forecast_from_owm(api_key: str, lat: float, lon: float, max_horizon: int = 7) -> dict:
    url = "https://api.openweathermap.org/data/3.0/onecall"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": api_key,
        "units": "metric",
        "exclude": "current,minutely,hourly,alerts"
    }
    res = requests.get(url, params=params, timeout=30)
    res.raise_for_status()
    data = res.json()

    fcst = {}
    daily_list = data.get("daily", [])
    for h in range(1, max_horizon + 1):
        if h >= len(daily_list):
            break
        d = daily_list[h]
        fcst[h] = float(d["temp"]["day"])
    return fcst


# ============================================================
# 9. 推論用：最新行の特徴量を作る
# ============================================================

def get_latest_feature_row(feat_df: pd.DataFrame, feature_cols: list):
    feat_df = feat_df.sort_values("date")
    latest_row = feat_df.iloc[[-1]].copy()
    base_date = latest_row["date"].iloc[0]
    X_latest = latest_row[feature_cols].ffill().fillna(0)
    return base_date, X_latest