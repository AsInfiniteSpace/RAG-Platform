from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import clear_auth_cookie, set_auth_cookie
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    LoginRequest,
    UserResponse,
)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register", response_model=UserResponse)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )

    db.add(user)

    try:
        db.commit()

    except IntegrityError:

        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    db.refresh(user)

    return user


@router.post("/login", response_model=UserResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not verify_password(
        login_data.password,
        user.hashed_password,
    ):

        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not user.is_active:

        raise HTTPException(
            status_code=403,
            detail="Your account has been suspended. Please contact the owner to resume your account.",
        )
        
    token = create_access_token(
        {
            "sub": str(user.id),
            "type": "access",
        }
    )

    set_auth_cookie(response, token)

    return user


@router.post("/logout")
def logout(response: Response):

    clear_auth_cookie(response)

    return {
        "message": "Logged out successfully",
    }


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user