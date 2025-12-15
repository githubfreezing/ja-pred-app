FROM python:3.12-slim

WORKDIR /app

ENV PYTHONPATH=/app

# # システム依存関係のインストール（torchやopencv-pythonのビルドに必要なパッケージなど）
# RUN apt-get update && apt-get install -y \
#     libgl1-mesa-glx \
#     libglib2.0-0 \
#     gcc \
#     g++ \
#     libsm6 \
#     libxext6 \
#     libxrender-dev \
#     && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --timeout=600 -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]