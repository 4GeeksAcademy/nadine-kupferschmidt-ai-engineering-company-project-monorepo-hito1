from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from auth import services
from auth.models import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    MeResponse,
    MessageResponse,
    ResetPasswordRequest,
    TokenResponse,
)
from auth.security import create_access_token, get_current_user, verify_password

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    """Valida las credenciales e inicia sesión."""
    user = services.get_user_by_email(form_data.username)
    if (
        user is None
        or not verify_password(form_data.password, user["hashed_password"])
        or user.get("is_active") is not True
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(access_token=create_access_token(user["id"]))


@auth_router.get("/me", response_model=MeResponse)
def get_current_user_profile(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> MeResponse:
    """Devuelve el usuario autenticado y su perfil."""
    return MeResponse(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        profile=services.get_profile_by_user_id(current_user["id"]),
    )


@auth_router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest) -> MessageResponse:
    """Envía un enlace de restablecimiento sin revelar si el email existe."""
    services.request_password_reset(data.email)
    return MessageResponse(
        message="Si esa dirección está registrada, recibirás un enlace en breve."
    )


@auth_router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest) -> MessageResponse:
    """Restablece la contraseña con un token válido."""
    if not services.reset_password(data.token, data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace es inválido, expiró o ya fue utilizado.",
        )
    return MessageResponse(message="Contraseña restablecida correctamente.")


@auth_router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> MessageResponse:
    """Cambia la contraseña del usuario autenticado."""
    if not services.change_password(
        current_user["id"], data.current_password, data.new_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta.",
        )
    return MessageResponse(message="Contraseña actualizada correctamente.")
