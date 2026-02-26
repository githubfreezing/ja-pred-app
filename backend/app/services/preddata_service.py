from datetime import date, timedelta
from typing import List
from sqlalchemy.orm import Session

from app.models.models import ShipmentActual, ShipmentPred
from app.schemas.pastdata import PastDataRow


def get_preddata_rows(db: Session, from_date):

    actuals = (
        db.query(ShipmentActual)
        .filter(ShipmentActual.record_date.between(from_date, to_date))
        .order_by(ShipmentActual.record_date)
        .all()
    )

    results = []

    for actual in actuals:

        # 該当record_dateを予測対象に含むrun_dateを探す
        pred = (
            db.query(ShipmentPred)
            .filter(
                ShipmentPred.run_date < actual.record_date,
                ShipmentPred.run_date >= actual.record_date - timedelta(days=14)
            )
            .order_by(ShipmentPred.run_date.desc())
            .first()
        )

        if pred:
            # 何日後かを計算
            diff_days = (actual.record_date - pred.run_date).days

            if 1 <= diff_days <= 14:
                predicted_value = pred.pred_series[diff_days - 1]
            else:
                predicted_value = None
        else:
            predicted_value = None

        results.append(
            PastDataRow(
                date=actual.record_date,
                quantity=float(actual.actual_quantity),
                predicted_quantity=float(predicted_value) if predicted_value else None
            )
        )

    print("results##########################################################################")
    print(results)

    return results