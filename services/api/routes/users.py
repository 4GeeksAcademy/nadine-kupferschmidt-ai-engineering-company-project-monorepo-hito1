from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from auth import services
from auth.models import UserCreate, UserResponse, UserUpdate
from auth.security import get_current_user

users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_route(data: UserCreate) -> UserResponse:
    """Registra un usuario y su perfil inicial."""
    if not services.is_valid_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El email no tiene un formato válido.",
        )
    try:
        return services.create_user(data)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@users_router.get("", response_model=list[UserResponse])
def list_users_route(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> list[UserResponse]:
    """Lista los usuarios registrados."""
    return services.list_users()


@users_router.get("/{user_id}", response_model=UserResponse)
def get_user_route(
    user_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserResponse:
    """Obtiene un usuario por su ID."""
    user = services.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return user


@users_router.put("/{user_id}", response_model=UserResponse)
def update_user_route(
    user_id: str,
    data: UserUpdate,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserResponse:
    """Actualiza el email o rol permitido del usuario."""
    user = services.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    is_admin = current_user.get("role") == "admin"
    if current_user.get("id") != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este usuario.",
        )
    if "role" in data.model_fields_set and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un administrador puede cambiar roles.",
        )
    if data.email is not None and not services.is_valid_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El email no tiene un formato válido.",
        )

    try:
        updated_user = services.update_user(user_id, data)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return updated_user


@users_router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_user_route(
    user_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> Response:
    """Elimina el usuario y su perfil si tiene permiso."""
    user = services.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    if current_user.get("id") != user_id and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este usuario.",
        )
    if not services.delete_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
