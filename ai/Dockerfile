# GPUなし（CUDAなし）のベースイメージ
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    MODEL_PATH=/models/your_model

WORKDIR /app

# 必要に応じてOS依存パッケージを追加（例：ビルドが必要なPythonライブラリ用）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "8001"]

##########################################################################

# # CUDA ランタイム入りのベースイメージを使う
# FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

# ENV PYTHONUNBUFFERED=1 \
#     PYTHONDONTWRITEBYTECODE=1 \
#     MODEL_PATH=/models/your_model

# WORKDIR /app

# # Python と必要なツールをインストール
# RUN apt-get update && apt-get install -y \
#     python3 python3-pip python3-venv \
#     && rm -rf /var/lib/apt/lists/*

# COPY requirements.txt .
# # RUN pip install --no-cache-dir -r requirements.txt
# RUN pip install -r requirements.txt

# COPY . .

# # VOLUME ["/models"]

# EXPOSE 8001

# CMD ["uvicorn", "ai.main:app", "--host", "0.0.0.0", "--port", "8001"]