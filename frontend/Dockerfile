# ファイル名: frontend/Dockerfile
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係を先にコピーしてインストール（レイヤーキャッシュを活かす）
COPY package*.json ./
RUN npm ci

# アプリケーションソースをすべてコピー
COPY . ./

# Vite のデフォルトポートを明示的に公開
EXPOSE 5173

# Docker 上でファイル変更を検知させるための設定
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=100

# Vite をホスト 0.0.0.0 で起動して、外部からアクセス可能に
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
