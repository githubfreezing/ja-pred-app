#app.api.v1.routes.compareactualandforecast.py
from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.services.pastdata_service import get_pastdata_rows
from app.services.preddata_service import get_preddata_rows
from app.schemas.pastdata import PastDataRequest, PastDataResponse
from app.schemas.preddata import PredDataRequest, PredDataResponse

from app.models.models import ShipmentActual
from app.models.models import ShipmentPred

router = APIRouter()

# @router.post("/compareactualandforecast")
# def get_compareactualandforecast(req: PredDataRequest, db: Session = Depends(get_db)):
    # past_rows = get_pastdata_rows(db=db, from_date=req.from_date)
    # pred_rows = get_preddata_rows(db=db, from_date=req.from_date)

    # if not past_rows or not pred_rows:
    #     raise HTTPException(status_code=404, detail="No shipment actual data found")

    # print("past_rows########################################################################################################")
    # print(past_rows)
    # print("pred_rows########################################################################################################")
    # print(pred_rows)

    # # return PredDataResponse.model_validate({"from": req.from_date, "to": req.to_date, "past_rows": past_rows, "pred_rows": pred_rows})
    # return PredDataResponse(
    #     from_=req.from_date,   # alias="from" なので from_ を使う
    #     to=req.to_date,
    #     past_rows=past_rows,
    #     pred_rows=pred_rows,
    # )



@router.post("/compareactualandforecast")
def get_compareactualandforecast(req: PredDataRequest, db: Session = Depends(get_db)):
    from_date = req.from_date

    # 対象日: from_date+1 〜 from_date+14
    target_dates = [from_date + timedelta(days=i) for i in range(1, 15)]

    # ----------------------------
    # 1) 実績: shipment_actuals からまとめて取得
    # ----------------------------
    actual_rows = (
        db.query(ShipmentActual)
        .filter(ShipmentActual.record_date.in_(target_dates))
        .all()
    )

    # 日付 -> 出荷量 の辞書にする（存在しない日付は抜ける）
    actual_map = {r.record_date: r.actual_quantity for r in actual_rows}

    # ----------------------------
    # 2) 予測: shipment_pred から取得（run_date が from_date の行を使う想定）
    # ----------------------------
    pred_row = (
        db.query(ShipmentPred)
        .filter(ShipmentPred.run_date == from_date)
        .first()
    )

    print("pred_row##########################################################################################")
    print(pred_row)

    if not pred_row:
        raise HTTPException(status_code=404, detail="No prediction data found for run_date=from_date")

    # pred_series は長さ14固定（CHECK制約あり）
    pred_series = pred_row.pred_series

    if pred_series is None or len(pred_series) != 14:
        raise HTTPException(status_code=500, detail="pred_series must be length 14")

    # ----------------------------
    # 3) 日付ごとに実績と予測を並べて返す
    #    pred_series[0] -> from_date+1
    #    pred_series[13] -> from_date+14
    # ----------------------------
    results = []
    for i, d in enumerate(target_dates):  # i=0..13
        actual_q = actual_map.get(d)  # Decimal or None
        pred_q = pred_series[i]       # numeric(10,2)

        results.append({
            "date": d.isoformat(),
            "actual_quantity": float(actual_q) if actual_q is not None else None,
            "pred_quantity": float(pred_q) if pred_q is not None else None,
        })

    print("from_date.isoformat()##########################################################################################")
    print(from_date.isoformat())
    print("pred_row.run_date.isoformat()##########################################################################################")
    print(pred_row.run_date.isoformat())
    print("results##########################################################################################")
    print(results)

    return {
        "from_date": from_date.isoformat(),
        "run_date": pred_row.run_date.isoformat(),
        "results": results,
    }




# @router.post("/compareactualandforecast")
# def get_compareactualandforecast(req: PredDataRequest, db: Session = Depends(get_db)):
#     from_date = req.from_date

#     # 対象日: from_date+1 〜 from_date+14
#     target_dates = [from_date + timedelta(days=i) for i in range(1, 15)]

#     # ----------------------------
#     # 1) 実績: shipment_actuals からまとめて取得
#     # ----------------------------
#     actual_rows = (
#         db.query(ShipmentActuals)
#         .filter(ShipmentActuals.record_date.in_(target_dates))
#         .all()
#     )

#     # 日付 -> 出荷量 の辞書にする（存在しない日付は抜ける）
#     actual_map = {r.record_date: r.actual_quantity for r in actual_rows}

#     # ----------------------------
#     # 2) 予測: shipment_pred から取得（run_date が from_date の行を使う想定）
#     # ----------------------------
#     pred_row = (
#         db.query(ShipmentPred)
#         .filter(ShipmentPred.run_date == from_date)
#         .first()
#     )

#     if not pred_row:
#         raise HTTPException(status_code=404, detail="No prediction data found for run_date=from_date")

#     # pred_series は長さ14固定（CHECK制約あり）
#     pred_series = pred_row.pred_series

#     if pred_series is None or len(pred_series) != 14:
#         raise HTTPException(status_code=500, detail="pred_series must be length 14")

#     # ----------------------------
#     # 3) 日付ごとに実績と予測を並べて返す
#     #    pred_series[0] -> from_date+1
#     #    pred_series[13] -> from_date+14
#     # ----------------------------
#     results = []
#     for i, d in enumerate(target_dates):  # i=0..13
#         actual_q = actual_map.get(d)  # Decimal or None
#         pred_q = pred_series[i]       # numeric(10,2)

#         results.append({
#             "date": d.isoformat(),
#             "actual_quantity": float(actual_q) if actual_q is not None else None,
#             "pred_quantity": float(pred_q) if pred_q is not None else None,
#         })

#     return {
#         "from_date": from_date.isoformat(),
#         "run_date": pred_row.run_date.isoformat(),
#         "results": results,
#     }
