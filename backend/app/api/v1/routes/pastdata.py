# app/api/v1/routes/pastdata.py
from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

class PastDataRequest(BaseModel):
    from_date: date = Field(..., description="開始日(yyyy-mm-dd)")
    to_date: date = Field(..., description="終了日(yyyy-mm-dd)")

class PastDataRow(BaseModel):
    date: date
    quantity: int

class PastDataResponse(BaseModel):
    from_: date = Field(..., alias="from")
    to: date
    rows: List[PastDataRow]

@router.post("/pastdata", response_model=PastDataResponse)
def get_pastdata(req: PastDataRequest):
    if req.from_date > req.to_date:
        raise HTTPException(status_code=400, detail="from_date must be <= to_date")

    days = (req.to_date - req.from_date).days + 1
    # 例として最大 366 日に制限（お好みで）
    if days > 366:
        raise HTTPException(status_code=400, detail="date range too large")

    rows: List[PastDataRow] = []
    d = req.from_date
    for i in range(days):
        # ダミー値（例：曜日やインデックスで変化）
        quantity = 100 + (i % 7) * 10
        rows.append(PastDataRow(date=d, quantity=quantity))
        d += timedelta(days=1)

    return PastDataResponse.model_validate(
        {"from": req.from_date, "to": req.to_date, "rows": rows}
    )