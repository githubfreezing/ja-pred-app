# /app/tests/test_root.py
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app  # 実際のモジュールパスに合わせてください

@pytest.mark.asyncio
async def test_read_root():
    # httpx 0.28+ では app=... の代わりに ASGITransport を使う
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/")

    assert response.status_code == 200
    assert response.json() == {"message": "Hello from FastAPI root!"}