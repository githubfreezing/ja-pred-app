from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token

router = APIRouter()

DUMMY_EMAIL = "test@example.com"
DUMMY_PASSWORD = "password123"
@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    if payload.email.lower() != DUMMY_EMAIL or payload.password != DUMMY_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが違います。",
        )

    token = create_access_token(sub=payload.email.lower())
    return TokenResponse(access_token=token, token_type="bearer")

# # まずは「固定ユーザー」で動作確認（DB導入後に差し替え）
# DUMMY_USER = {
#     "email": "test@example.com",
#     # password: "password123" をハッシュ化したもの（下の補足参照）
#     "password_hash": "$2b$12$9r1h9J8TQGmY5v9hO.1X8eQwqfV7JmY7b2g1N0OQe7xQvQmR3y0mS",
# }


# @router.post("/auth/login", response_model=TokenResponse)
# def login(payload: LoginRequest):
#     # email照合
#     if payload.email.lower() != DUMMY_USER["email"]:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="メールアドレスまたはパスワードが違います。",
#         )

#     # password照合
#     if not verify_password(payload.password, DUMMY_USER["password_hash"]):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="メールアドレスまたはパスワードが違います。",
#         )

#     token = create_access_token(sub=payload.email.lower())
#     return TokenResponse(access_token=token, token_type="bearer")