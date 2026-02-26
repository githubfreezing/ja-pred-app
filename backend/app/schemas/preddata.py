from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import date
from typing import List

# class PredDataRequest(BaseModel):
#     from_date: date = Field(..., description="開始日(yyyy-mm-dd)")
class PredDataRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    from_date: date = Field(..., description="開始日(yyyy-mm-dd)")

class PastDataRow(BaseModel):
    model_config = ConfigDict(json_encoders={Decimal: float})
    date: date
    quantity: Decimal

class PredDataRow(BaseModel):
    model_config = ConfigDict(json_encoders={Decimal: float})
    date: date
    quantity: Decimal

class PredDataResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={Decimal: float},
    )
    from_: date = Field(..., alias="from")
    to: date
    past_rows: List[PastDataRow]
    pred_rows: List[PredDataRow]