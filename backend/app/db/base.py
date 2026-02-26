# # app/db/base.py
# from sqlalchemy.ext.declarative import declarative_base

# Base = declarative_base()

# from app.db.base_class import Base

# モデルをここで import（循環 import を避ける形で）
from app.db.base_class import Base
# from app.models.models import User, ShipmentActual
from app.models import models