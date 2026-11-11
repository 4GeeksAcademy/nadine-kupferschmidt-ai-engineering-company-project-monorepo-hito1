import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from tinydb import Query

from auth.database import profiles, users
from auth.mailer import send_password_reset_email
from auth.models import ProfileUpdate, UserCreate, UserUpdate
from auth.security import (
    create_reset_token,
    decode_reset_token,
    hash_password,
    verify_password,
)

logger = logging.getLogger(__name__)


def is_valid_email(email: str) -> bool:
    """Revisa que el email tenga un formato básico: texto@dominio.ext, sin espacios."""
    if " " in email or email.count("@") != 1:
        return False
    local_part, domain = email.split("@")
    return (
        bool(local_part)
        and "." in domain
        and not domain.startswith(".")
        and not domain.endswith(".")
    )


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


def _save_password(user_id: str, new_password: str) -> None:
    """Guarda una nueva contraseña y registra el momento del cambio."""
    users.update(
        {
            "hashed_password": hash_password(new_password),
            "password_changed_at": datetime.now(timezone.utc).timestamp(),
        },
        Query().id == user_id,
    )


def request_password_reset(email: str) -> None:
    """Envía un enlace de restablecimiento si el email pertenece a un usuario activo."""
    user = get_user_by_email(email)
    if user is None or user.get("is_active") is not True:
        return

    token = create_reset_token(user["id"])
    try:
        send_password_reset_email(user["email"], token)
    except Exception:
        logger.exception("No se pudo enviar el correo de restablecimiento.")


def reset_password(token: str, new_password: str) -> bool:
    """Restablece la contraseña con un token válido y no usado."""
    payload = decode_reset_token(token)
    if payload is None:
        return False

    user = get_user_by_id(payload["sub"])
    if user is None or user.get("is_active") is not True:
        return False

    changed_at = user.get("password_changed_at")
    if changed_at is not None and payload["iat"] < changed_at:
        return False

    _save_password(user["id"], new_password)
    return True


def change_password(user_id: str, current_password: str, new_password: str) -> bool:
    """Cambia la contraseña si la actual es correcta."""
    user = get_user_by_id(user_id)
    if user is None or not verify_password(current_password, user["hashed_password"]):
        return False

    _save_password(user_id, new_password)
    return True
