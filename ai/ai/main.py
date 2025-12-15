# ai/main.py

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import os
import torch
from typing import List

app = FastAPI(title="AI Inference API", version="1.0.0")

# MODEL_PATH = os.getenv("MODEL_PATH", "/models/your_model")


# @app.on_event("startup")
# def load_model():
#     """
#     アプリ起動時にモデルをロードする
#     """
#     global model

#     try:
#         # GPU が使えるか確認し、なければ CPU に fallback
#         device = "cuda" if torch.cuda.is_available() else "cpu"
#         print(f"Using device: {device}")

#         # torch.load で任意のモデルをロード
#         model = torch.load(MODEL_PATH, map_location=device)
#         model.eval()

#         print(f"Model loaded from: {MODEL_PATH}")

#     except Exception as e:
#         print("Model loading failed:", e)
#         model = None


@app.get("/health")
def health_check():
    return {"status": "ok", "device": "cuda" if torch.cuda.is_available() else "cpu"}

# @app.post("/ai/pred")
# def health_check():
#     return {"status": "ok", "device": "cuda" if torch.cuda.is_available() else "cpu"}

@app.post("/ai/pred")
def health_check():
    print("health_check#########################################")
    return {
        "status": "ok-20252111-2",
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }

# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):
#     """
#     ファイル（画像など）を受け取って推論するエンドポイント
#     """
#     if model is None:
#         return JSONResponse(
#             status_code=500, content={"error": "Model not loaded"}
#         )

#     try:
#         # 画像を読み込み
#         image_bytes = await file.read()
#         image_tensor = torch.tensor(list(image_bytes), dtype=torch.float32)

#         # ここはあなたのモデル仕様に合わせて書き換える部分
#         with torch.no_grad():
#             output = model(image_tensor.unsqueeze(0))

#         # 出力が Tensor なら Python リストに変換
#         result = output.tolist() if isinstance(output, torch.Tensor) else output

#         return {"result": result}

#     except Exception as e:
#         return JSONResponse(
#             status_code=500, 
#             content={"error": f"Prediction failed: {str(e)}"}
#         )