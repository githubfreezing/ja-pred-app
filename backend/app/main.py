# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.login import auth as auth_router
from app.core.config import settings

from app.api.v1.routes import root as root_router
from app.api.v1.routes import upload as upload_router
from app.api.v1.routes import pastdata as pastdata_router

app = FastAPI()

# フロントからのアクセスを許可するオリジン
# Vite 開発時: http://localhost:5173
# Docker で Nginx 配信時: http://localhost:3000
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://ja-pred-app-react-bucket.s3-website-ap-northeast-1.amazonaws.com",
    "https://ja-pred-app.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # 必要に応じて ["*"] にすれば全許可（開発用）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------
# root（/api/v1/ 直下のルート）を担当するルーター
# 主にユーザー一覧や /health などの最低限APIを提供
# prefix なし＝/api/v1/ の位置にマウントされる
# ---------------------------------------------
app.include_router(root_router.router, prefix=settings.api_v1_str)
app.include_router(upload_router.upload, prefix=settings.api_v1_str)
app.include_router(auth_router.router, prefix=settings.api_v1_str)
app.include_router(pastdata_router.router, prefix=settings.api_v1_str)

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import PlainTextResponse
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger("app")

from app.core.config import settings
AI_SERVICE_URL = settings.AI_SERVICE_URL

class SampleRequest(BaseModel):
    toDate: str  # "YYYY-MM-DD"

# @app.post("/sample")
# async def sample(req: SampleRequest):
#     try:
#         async with httpx.AsyncClient(timeout=10.0) as client:
#             r = await client.post(f"{AI_SERVICE_URL}/pred", json={})
#             r.raise_for_status()
#             ai_json = r.json()
#     except httpx.HTTPError as e:
#         raise HTTPException(status_code=502, detail=f"AI service error: {e}")

#     return {
#         "status": "ok",
#         "message": "sample API received the date successfully",
#         "ai_service": ai_json,              # ← AIの返却をそのまま載せる
#         "ai_status": ai_json.get("status")  # ← これで "ok-20252122-ai" が見える
#     }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from sqlalchemy import text
import os

@app.post("/sample")
async def sample(req: SampleRequest, db: Session = Depends(get_db)):
# async def sample(req: SampleRequest):
    DATABASE_URL = os.getenv("DATABASE_URL")
    print(f"DATABASE_URL#########{DATABASE_URL}")
    result = db.execute(text("SELECT 1")).scalar_one()
    print(f"データベース#####:{result}")

    ai_json = None  # 例外時でも参照事故を防ぐ

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(f"{AI_SERVICE_URL}/pred", json={})

            # ステータスと本文を先に取っておく（raise後だと取りづらいことがあるため）
            status_code = r.status_code
            body_text = r.text

            r.raise_for_status()

            # JSONで返ってこない場合もあるので保険
            try:
                ai_json = r.json()
            except Exception:
                ai_json = {"raw_text": body_text}

    except httpx.HTTPStatusError as e:
        # AIサービスが 4xx / 5xx を返した（422/400/500等）
        resp = e.response
        logger.exception(
            "AI returned error. url=%s status=%s body=%s",
            str(resp.url),
            resp.status_code,
            resp.text,
        )
        raise HTTPException(
            status_code=502,
            detail={
                "type": "AI_HTTPStatusError",
                "ai_url": str(resp.url),
                "ai_status_code": resp.status_code,
                "ai_body": resp.text,   # ← ここに422の詳細などが出る
            },
        )

    except httpx.RequestError as e:
        # 接続不可/DNS不可/タイムアウトなど（ネットワーク系）
        logger.exception("AI request failed. url=%s error=%r", f"{AI_SERVICE_URL}/pred", e)
        raise HTTPException(
            status_code=502,
            detail={
                "type": "AI_RequestError",
                "ai_url": f"{AI_SERVICE_URL}/pred",
                "error": repr(e),       # ← ConnectError / ReadTimeout などが分かる
            },
        )

    except Exception as e:
        # 想定外（JSONパースなどもここに来る可能性あり）
        logger.exception("Unexpected error in /sample: %r", e)
        raise HTTPException(
            status_code=500,
            detail={"type": "UnexpectedError", "error": repr(e)},
        )

    return {
        "status": "ok",
        "message": "sample API received the date successfully",
        "ai_service": ai_json,
        "ai_status": (ai_json.get("status") if isinstance(ai_json, dict) else None),
    }

# ① ルートを 200 で返す（ALB のデフォルト health check が "/" の場合に効く）
@app.get("/", response_class=PlainTextResponse)
def root():
    return "ok"

# ② 明示的なヘルスチェック（推奨：ALB 側の Health check path を "/health" にする）
@app.get("/health", response_class=PlainTextResponse)
def health():
    return "ok"