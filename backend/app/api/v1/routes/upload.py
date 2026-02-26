#app/api/v1/routes/upload.py

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import httpx
import logging
import json

from app.services.pastdata_service import get_pastdata_rows
from app.db.deps import get_db
from app.core.config import settings

from decimal import Decimal
from typing import List, Dict, Any

from decimal import Decimal, ROUND_HALF_UP
from app.models.models import ShipmentPred

upload = APIRouter(prefix="/upload", tags=["Upload"])

AI_SERVICE_URL = settings.AI_SERVICE_URL
logger = logging.getLogger("app")

@upload.post("")
async def upload_shipment_csv(file: UploadFile = File(...),
                              db: Session = Depends(get_db),):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSVファイルのみアップロード可能です")

    file_bytes = await file.read()
    timeout = httpx.Timeout(connect=5.0, read=120.0, write=60.0, pool=5.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
                f"{AI_SERVICE_URL}/pred",
                files={
                    "file": (
                        file.filename,
                        file_bytes,
                        "text/csv",
                    )
                },
            )
        ai_response = r.json()
        forecast_list = json.loads(ai_response["result"])

    first_forecast_date = datetime.fromisoformat(
        forecast_list[0]["target_date"]
    ).date()
    to_date = first_forecast_date - timedelta(days=1)
    from_date = to_date - timedelta(days=6)
    print("forecast_list###########################################################")
    print(type(forecast_list))
    print(forecast_list)

    ############################################################################
    #20260224
    ############################################################################
    # --- ShipmentPred に14日予測を保存 ---

    print("first_forecast_date###########################################################")
    print(type(first_forecast_date))
    print(first_forecast_date)

    run_date = first_forecast_date - timedelta(days=1)

    # horizon_days(1..14) の順に pred_series を構築（長さ14を必ず満たす）
    pred_series = [None] * 14
    for f in forecast_list:
        h = int(f["horizon_days"])  # 1..14想定
        if h < 1 or h > 14:
            raise HTTPException(status_code=500, detail=f"horizon_days が不正です: {h}")

        # Numeric(10,2) 想定なので Decimal にして小数2桁へ丸め
        kg = Decimal(str(f["forecast_kg"])).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        pred_series[h - 1] = kg

    if any(v is None for v in pred_series):
        raise HTTPException(status_code=500, detail="14日分の予測が揃っていません（pred_series の欠損）")

    pred_row = ShipmentPred(
        run_date=run_date,
        pred_series=pred_series,
    )
    db.add(pred_row)
    db.commit()
    db.refresh(pred_row)
    ############################################################################

    # ★ get_pastdata_rows を使用して実績7日分を取得
    pastdata_rows = get_pastdata_rows(db=db, from_date=from_date, to_date=to_date)
    print("pastdata_rows###########################################################")
    print(type(pastdata_rows))
    print(pastdata_rows)

    ############################################################################
    merged: List[Dict[str, Any]] = []

    # ① 過去実績（horizon_days = 0）
    for row in pastdata_rows:
        merged.append(
            {
                "target_date": row.date.isoformat(),
                "horizon_days": 0,
                "forecast_kg": float(row.quantity)
                if isinstance(row.quantity, Decimal)
                else row.quantity,
            }
        )

    # ② 予測データ
    for f in forecast_list:
        target_date = datetime.fromisoformat(f["target_date"]).date()

        merged.append(
            {
                "target_date": target_date.isoformat(),
                "horizon_days": f["horizon_days"],
                "forecast_kg": float(f["forecast_kg"]),
            }
        )

    print("merged###########################################################")
    print(type(merged))
    print(merged)
    ############################################################################

    return JSONResponse(
        status_code=200,
        content={
                 "message": "アップロードが完了しました",
                 "filename": file.filename, 
                #  "forecast": forecast_list
                "forecast": merged
                },
    )
