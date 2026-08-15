from fastapi import Request, Response
from app.core.config import settings


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.cookie_max_age,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        path="/",
    )


def get_token_from_cookie(request: Request) -> str | None:
    return request.cookies.get(settings.cookie_name)