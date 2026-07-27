"""
routes/auth.py
POST /api/auth/register  — create account
POST /api/auth/login     — get JWT token
GET  /api/auth/me        — current user (requires token)
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from schemas import AdminRegister, Token, UserLogin, UserOut, UserRegister, UserUpdate, MessageResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── Security config ────────────────────────────────────────────
SECRET_KEY  = os.getenv("SECRET_KEY", "madhav-fashion-change-in-production")
ALGORITHM   = "HS256"
TOKEN_EXPIRE_HOURS = int(os.getenv("TOKEN_EXPIRE_HOURS", "1"))

if os.getenv("APP_ENV", "development").lower() in {"production", "prod"} and SECRET_KEY == "madhav-fashion-change-in-production":
    raise RuntimeError("SECRET_KEY must be configured in production")

pwd_ctx    = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/form")


# ── Helpers ────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
) -> User:
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not isinstance(user_id, str) or not user_id.isdigit():
            raise creds_exc
    except JWTError:
        raise creds_exc

    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        raise creds_exc
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_admin_or_seller(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.admin, UserRole.seller):
        raise HTTPException(status_code=403, detail="Seller or admin access required")
    return current_user


# ── Endpoints ──────────────────────────────────────────────────
@router.post("/register", response_model=Token, status_code=201)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Create a new customer account and return a JWT token."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.customer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return Token(
        access_token=create_access_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/admin/register", response_model=Token, status_code=201)
def register_admin(payload: AdminRegister, db: Session = Depends(get_db)):
    """Create a shop-holder account using the server-side setup key."""
    setup_key = os.getenv("ADMIN_SIGNUP_KEY", "madhav-shop-holder-setup")
    if payload.setup_key != setup_key:
        raise HTTPException(status_code=403, detail="Invalid shop-holder setup key")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.seller,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(
        access_token=create_access_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return a JWT token (JSON body)."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    return Token(
        access_token=create_access_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/login/form", response_model=Token, include_in_schema=False)
def login_form(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """OAuth2 form login — used by Swagger UI's Authorize button."""
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    return Token(
        access_token=create_access_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.email and payload.email != current_user.email and db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout():
    """Client-side logout — just confirms. Token invalidation is client responsibility."""
    return {"message": "Logged out successfully"}
