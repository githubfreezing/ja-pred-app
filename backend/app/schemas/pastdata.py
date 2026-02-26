from datetime import date
from typing import List
from pydantic import BaseModel, Field
from decimal import Decimal

class PastDataRequest(BaseModel):
    from_date: date = Field(..., description="開始日(yyyy-mm-dd)")
    to_date: date = Field(..., description="終了日(yyyy-mm-dd)")

class PastDataRow(BaseModel):
    date: date
    quantity: Decimal

class PastDataResponse(BaseModel):
    from_: date = Field(..., alias="from")
    to: date
    rows: List[PastDataRow]
