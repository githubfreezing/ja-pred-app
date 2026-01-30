# app/models/models.py
from sqlalchemy import Column, Integer, String, Date, Numeric
from app.db.base import Base

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