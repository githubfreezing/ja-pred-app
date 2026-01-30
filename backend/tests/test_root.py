# # /app/tests/test_root.py
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app

@pytest.mark.asyncio
async def test_read_root():
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/")

    assert response.status_code == 200

    body = response.json()

    # message は完全一致ではなく、先頭一致などにする（拡張に強い）
    assert "message" in body
    assert body["message"].startswith("Hello from FastAPI root!")

    # もし ai_service_response を返す仕様なら存在チェックだけにする
    # （中身は環境によって変わりやすい）
    assert "ai_service_response" in body
