import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.hash import bcrypt
from tinydb import Query

from auth.database import users


load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY debe estar definida en services/api/.env.")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))
ALGORITHM = "HS256"

ACCESS_TOKEN_TYPE = "access"
RESET_TOKEN_TYPE = "password_reset"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    """Cifra una contraseña con bcrypt."""
    return bcrypt.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash."""
    try:
        return bcrypt.verify(password, hashed_password)
    except (TypeError, ValueError):
        return False


def create_access_token(user_id: str) -> str:
    """Crea un token JWT de sesión con el ID del usuario y su vencimiento."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": user_id, "type": ACCESS_TOKEN_TYPE, "exp": expires_at},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_reset_token(user_id: str) -> str:
    """Crea un token JWT de corta duración para restablecer la contraseña."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {
            "sub": user_id,
            "type": RESET_TOKEN_TYPE,
            "iat": int(now.timestamp()),
            "exp": expires_at,
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_reset_token(token: str) -> dict[str, Any] | None:
    """Valida firma, vencimiento y tipo de un token de restablecimiento.

    Devuelve el contenido del token, o None si no es válido.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

    if payload.get("type") != RESET_TOKEN_TYPE:
        return None
    if not isinstance(payload.get("sub"), str) or not isinstance(
        payload.get("iat"), int
    ):
        return None

    return payload


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict[str, Any]:
    """Valida el token de sesión y devuelve el usuario activo correspondiente."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="No se pudieron validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise credentials_exception from None

    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise credentials_exception

    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise credentials_exception

    user = users.get(Query().id == user_id)
    if user is None or user.get("is_active") is not True:
        raise credentials_exception

    return user
