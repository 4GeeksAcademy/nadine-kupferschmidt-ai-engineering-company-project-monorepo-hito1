from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class Role(str, Enum):
    """Roles permitidos para los usuarios de la plataforma."""

    admin = "admin"
    manager = "manager"
    user = "user"


class UserCreate(BaseModel):
    """Datos para crear un usuario y su perfil inicial."""

    email: str
    password: str = Field(min_length=8)
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserUpdate(BaseModel):
    """Datos opcionales para actualizar un usuario."""

    email: str | None = None
    role: Role | None = None


class UserResponse(BaseModel):
    """Datos públicos de un usuario, sin credenciales."""

    id: str
    email: str
    is_active: bool
    role: Role = Role.user
    created_at: datetime


class ProfileUpdate(BaseModel):
    """Datos opcionales para actualizar un perfil."""

    name: str | None = None
    phone: str | None = None
    address: str | None = None


class ProfileResponse(BaseModel):
    """Datos del perfil asociado a un usuario."""

    id: str
    user_id: str
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class LoginRequest(BaseModel):
    """Credenciales para iniciar sesión."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """Token de acceso devuelto al iniciar sesión."""

    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    """Datos del usuario autenticado y su perfil, si existe."""

    id: str
    email: str
    role: Role = Role.user
    profile: ProfileResponse | None = None
