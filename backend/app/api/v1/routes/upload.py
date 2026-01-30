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
