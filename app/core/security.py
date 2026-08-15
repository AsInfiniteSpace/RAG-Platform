from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.core.config import settings
from typing import Any

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


"""def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)"""

def create_access_token(data: dict[str, Any]) -> str:
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.jwt_expire_minutes
    )

    payload["exp"] = expire

    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )