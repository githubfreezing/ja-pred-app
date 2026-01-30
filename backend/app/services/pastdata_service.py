from datetime import date
from typing import List
from sqlalchemy.orm import Session

from app.models.models import ShipmentActual
from app.schemas.pastdata import PastDataRow

def get_pastdata_rows(db: Session, from_date: date, to_date: date) -> List[PastDataRow]:
    records = (
        db.query(ShipmentActual)
        .filter(ShipmentActual.record_date >= from_date)
        .filter(ShipmentActual.record_date <= to_date)
        .order_by(ShipmentActual.record_date)
        .all()
    )
    return [PastDataRow(date=r.record_date, quantity=r.actual_quantity) for r in records]