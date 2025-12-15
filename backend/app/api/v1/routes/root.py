# # app/api/v1/routes/root.py
# from fastapi import APIRouter, Depends
# from fastapi.responses import JSONResponse

# router = APIRouter(tags=["root"])

# # ルートエンドポイント
# @router.get("/", summary="ルート（ユーザー一覧の簡易出力）")
# async def read_root():
#     print("###20251127###")
#     return {"message": "read_root"}

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["root"])

# @router.get("/", summary="ルート（通信テスト用）")
# async def read_root():
#     return JSONResponse(content={"message": "Hello from FastAPI root!"})

AI_SERVICE_URL = "http://ai_service:8001/ai/pred"

@router.get("/", summary="ルート（通信テスト用）")
async def read_root():
    # ai_service に POST を送る
    async with httpx.AsyncClient() as client:
        r = await client.post(AI_SERVICE_URL)
        ai_response = r.json()

    return JSONResponse(
        content={
            "message": "Hello from FastAPI root!-20251211",
            "ai_service_response": ai_response
        }
    )