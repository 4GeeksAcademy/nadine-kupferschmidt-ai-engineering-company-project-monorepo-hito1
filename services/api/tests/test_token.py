from datetime import datetime, timedelta, timezone

from jose import jwt
from tinydb import Query

from auth.database import users
from auth.security import ALGORITHM, SECRET_KEY, create_reset_token


def make_access_token(user_id: str, minutes: int) -> str:
    """Crea un token de sesión que vence dentro de `minutes` (negativo para un token ya vencido)."""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode(
        {"sub": user_id, "type": "access", "exp": expires_at},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def test_me_returns_the_token_owner(client, seeded_user, auth_headers):
    """Camino feliz: /auth/me devuelve el usuario y el perfil de quien tiene el token."""
    response = client.get("/auth/me", headers=auth_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == seeded_user["id"]
    assert body["email"] == seeded_user["email"]
    assert body["profile"]["name"] == "Ana"


def test_me_accepts_token_about_to_expire(client, seeded_user):
    """Caso límite: un token a 1 minuto de vencer todavía sirve."""
    token = make_access_token(seeded_user["id"], 1)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["id"] == seeded_user["id"]


def test_me_rejects_password_reset_token(client, seeded_user):
    """Caso límite: un código de reset no sirve como sesión aunque tenga firma válida."""
    # El tipo del token ("password_reset") no es "access", por eso se rechaza.
    token = create_reset_token(seeded_user["id"])

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_me_rejects_expired_token(client, seeded_user):
    """Modo de fallo: un token vencido no devuelve datos del usuario."""
    token = make_access_token(seeded_user["id"], -1)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert seeded_user["email"] not in response.text


def test_me_rejects_malformed_token(client):
    """Modo de fallo: un token mal formado se rechaza."""
    response = client.get(
        "/auth/me", headers={"Authorization": "Bearer esto-no-es-un-token"}
    )

    assert response.status_code == 401


def test_me_rejects_request_without_token(client):
    """Modo de fallo: sin token no hay acceso."""
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_rejects_token_of_deleted_user(client, seeded_user, auth_headers):
    """Modo de fallo: un token de una cuenta borrada deja de servir."""
    deleted = client.delete(f"/users/{seeded_user['id']}", headers=auth_headers)
    assert deleted.status_code == 204

    # El token todavía no venció, pero si la cuenta ya no existe la sesión deja de servir.
    response = client.get("/auth/me", headers=auth_headers)

    assert response.status_code == 401


def test_me_rejects_token_of_deactivated_user(client, seeded_user, auth_headers):
    """Modo de fallo: un token de una cuenta desactivada deja de servir."""
    users.update({"is_active": False}, Query().id == seeded_user["id"])

    response = client.get("/auth/me", headers=auth_headers)

    assert response.status_code == 401
