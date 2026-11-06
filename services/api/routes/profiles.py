from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from auth import services
from auth.models import ProfileResponse, ProfileUpdate
from auth.security import get_current_user

profiles_router = APIRouter(prefix="/profiles", tags=["profiles"])


@profiles_router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> ProfileResponse:
    """Devuelve el perfil del usuario autenticado."""
    profile = services.get_profile_by_user_id(current_user["id"])
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado.",
        )
    return profile


@profiles_router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    data: ProfileUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> ProfileResponse:
    """Actualiza el perfil del usuario autenticado."""
    profile = services.update_profile(current_user["id"], data)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado.",
        )
    return profile
