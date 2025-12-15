#app/api/v1/routes/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
from io import StringIO
import httpx

upload = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

AI_SERVICE_URL = "http://ai_service:8001/ai/pred"

@upload.post("/")
async def upload_shipment_csv(
    file: UploadFile = File(...)
):
    """
    出荷量CSVをアップロードするAPI
    想定：
    - JA担当者がCSVを手動アップロード
    - 中身をDataFrameに変換し、後続処理（DB保存など）へ渡す
    """
    print("upload_shipment_csv####################################")
    # ファイル形式チェック
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="CSVファイルのみアップロード可能です"
        )

    print("2####################################")

    try:
        # # CSV読み込み（Shift-JIS / UTF-8 両対応想定）
        # contents = await file.read()

        # try:
        #     df = pd.read_csv(StringIO(contents.decode("utf-8")))
        # except UnicodeDecodeError:
        #     df = pd.read_csv(StringIO(contents.decode("shift_jis")))

        # # ここで最低限のバリデーション（例）
        # if df.empty:
        #     raise HTTPException(
        #         status_code=400,
        #         detail="CSVにデータが存在しません"
        #     )

        ##################################################################

        async with httpx.AsyncClient() as client:
            r = await client.post(AI_SERVICE_URL)
            ai_response = r.json()
            print("ai_response##############################################")
            print(ai_response)

        print("3####################################")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "アップロードが完了しました",
                "filename": file.filename,
                # "rows": len(df)
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ファイル処理中にエラーが発生しました: {str(e)}"
        )