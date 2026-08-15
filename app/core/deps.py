from fastapi import Depends, HTTPException, Request
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.auth import get_token_from_cookie
from app.models.user import User


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:

    credentials_error = HTTPException(
        status_code=401,
        detail="Not authenticated",
    )

    token = get_token_from_cookie(request)

    if not token:
        raise credentials_error

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_error

    except JWTError:
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active:
        raise credentials_error

    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user