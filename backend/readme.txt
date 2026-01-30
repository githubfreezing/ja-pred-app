■マイグレーション
alembic revision --autogenerate -m "initial migration"
alembic upgrade head

■dockerコンテナ
docker exec -it fastapi_backend sh

■テスト
pytest tests
