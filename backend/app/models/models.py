# app/models/models.py
from sqlalchemy import Column, Integer, String, Date, Numeric
# from app.db.base import Base
from app.db.base_class import Base

from sqlalchemy import DateTime, SmallInteger, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

class ShipmentActual(Base):
    __tablename__ = "shipment_actuals"

    id = Column(Integer, primary_key=True, index=True)

    # 実績が属する日付
    record_date = Column(Date, nullable=False, index=True)

    # 実績出荷量（過去データ）
    actual_quantity = Column(Numeric(10, 2), nullable=False)

class ShipmentPred(Base):
    __tablename__ = "shipment_pred"

    id = Column(Integer, primary_key=True, index=True)

    # 予測を作成した日（=予測実行日）
    run_date = Column(Date, nullable=False, index=True)

    # 1日後〜14日後の予測を配列で保持（長さ14を想定）
    # 例: pred_series[0] が +1日, pred_series[13] が +14日
    pred_series = Column(ARRAY(Numeric(10, 2)), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        # 14日分であることをDB側で強制（PostgreSQL関数 array_length）
        CheckConstraint("array_length(pred_series, 1) = 14", name="ck_shipment_pred_series_len_14"),
        Index("ix_shipment_pred_run_date", "run_date"),
    )