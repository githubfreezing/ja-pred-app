import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["root"])

from app.core.config import settings
AI_SERVICE_URL = settings.AI_SERVICE_URL

@router.get("/", summary="ルート（通信テスト用）")
async def read_root():
    # ai_service に POST を送る
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{AI_SERVICE_URL}/pred")
        ai_response = r.json()

    return JSONResponse(
        content={
            "message": "Hello from FastAPI root!-20251222",
            "ai_service_response": ai_response
        }
    )