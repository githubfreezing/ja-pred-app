# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import root as root_router
from app.api.v1.login import auth as auth_router
from app.core.config import settings

app = FastAPI()

# フロントからのアクセスを許可するオリジン
# Vite 開発時: http://localhost:5173
# Docker で Nginx 配信時: http://localhost:3000
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # 必要に応じて ["*"] にすれば全許可（開発用）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/")
# def read_root():
#     return {"message": "Hello from FastAPI"}
# ---------------------------------------------
# root（/api/v1/ 直下のルート）を担当するルーター
# 主にユーザー一覧や /health などの最低限APIを提供
# prefix なし＝/api/v1/ の位置にマウントされる
# ---------------------------------------------
app.include_router(root_router.router, prefix=settings.api_v1_str)

app.include_router(auth_router.router, prefix=settings.api_v1_str)