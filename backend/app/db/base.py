# app/db/base.py
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# モデルをここで import（循環 import を避ける形で）
from app.models.models import User  # noqa
# 他のモデルも同様に