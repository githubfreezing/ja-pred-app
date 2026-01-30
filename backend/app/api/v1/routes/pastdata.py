#app.services.pastdata_service
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.services.pastdata_service import get_pastdata_rows
from app.schemas.pastdata import PastDataRequest, PastDataResponse

router = APIRouter()

@router.post("/pastdata", response_model=PastDataResponse)
def get_pastdata(req: PastDataRequest, db: Session = Depends(get_db)):
    print("pastdata###################################")
    rows = get_pastdata_rows(db=db, from_date=req.from_date, to_date=req.to_date)
    print("rows###################################")
    print(rows)
    if not rows:
        raise HTTPException(status_code=404, detail="No shipment actual data found")
    return PastDataResponse.model_validate({"from": req.from_date, "to": req.to_date, "rows": rows})
