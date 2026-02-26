# app/api/v1/routes/predcomfirm.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.deps import get_db
from app.models.models import ShipmentPred

router = APIRouter(prefix="/predcomfirm", tags=["Predcomfirm"])


@router.post("/")
async def get_latest_prediction(db: Session = Depends(get_db)):
    # run_date が最新のレコードを1件取得
    latest_pred = (
        db.query(ShipmentPred)
        .order_by(desc(ShipmentPred.run_date))
        .first()
    )

    if not latest_pred:
        raise HTTPException(status_code=404, detail="予測データが存在しません")

    return {
        "id": latest_pred.id,
        "run_date": latest_pred.run_date,
        "pred_series": [float(x) for x in latest_pred.pred_series],
        "created_at": latest_pred.created_at,
    }