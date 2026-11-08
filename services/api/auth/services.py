from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from tinydb import Query

from auth.database import profiles, users
from auth.models import ProfileUpdate, UserCreate, UserUpdate
from auth.security import hash_password


def create_user(data: UserCreate) -> dict[str, Any]:
    """Crea un usuario y su perfil inicial."""
    if get_user_by_email(data.email) is not None:
        raise ValueError("Ya existe un usuario con ese email.")

    user = {
        "id": str(uuid4()),
        "email": data.email,
        "hashed_password": hash_password(data.password),
        "is_active": True,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    profile = {
        "id": str(uuid4()),
        "user_id": user["id"],
        "name": data.name,
        "phone": data.phone,
        "address": data.address,
    }

    users.insert(user)
    profiles.insert(profile)
    return user


def list_users() -> list[dict[str, Any]]:
    """Devuelve todos los usuarios."""
    return users.all()


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    """Busca un usuario por su ID."""
    return users.get(Query().id == user_id)


def get_user_by_email(email: str) -> dict[str, Any] | None:
    """Busca un usuario por su email."""
    return users.get(Query().email == email)


def update_user(user_id: str, data: UserUpdate) -> dict[str, Any] | None:
    """Actualiza el email o el rol de un usuario existente."""
    user = get_user_by_id(user_id)
    if user is None:
        return None

    updates = data.model_dump(mode="json", exclude_unset=True)
    if "email" in updates:
        existing_user = get_user_by_email(updates["email"])
        if existing_user is not None and existing_user["id"] != user_id:
            raise ValueError("Ya existe otro usuario con ese email.")

    if updates:
        users.update(updates, Query().id == user_id)
    return get_user_by_id(user_id)


def delete_user(user_id: str) -> bool:
    """Elimina un usuario y su perfil asociado."""
    if get_user_by_id(user_id) is None:
        return False

    users.remove(Query().id == user_id)
    profiles.remove(Query().user_id == user_id)
    return True


def get_profile_by_user_id(user_id: str) -> dict[str, Any] | None:
    """Busca el perfil asociado a un usuario."""
    return profiles.get(Query().user_id == user_id)


def update_profile(
    user_id: str, data: ProfileUpdate
) -> dict[str, Any] | None:
    """Actualiza los campos enviados del perfil de un usuario."""
    if get_profile_by_user_id(user_id) is None:
        return None

    updates = data.model_dump(exclude_unset=True)
    if updates:
        profiles.update(updates, Query().user_id == user_id)
    return get_profile_by_user_id(user_id)
