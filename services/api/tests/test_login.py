from jose import jwt
from tinydb import Query

from auth.database import users
from auth.security import ALGORITHM, SECRET_KEY


def test_login_returns_token_for_correct_user(client, seeded_user):
    """Camino feliz: credenciales correctas devuelven un token de sesión de ese usuario."""
    response = client.post(
        "/auth/login",
        data={"username": seeded_user["email"], "password": seeded_user["password"]},
    )

    assert response.status_code == 200
    payload = jwt.decode(response.json()["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == seeded_user["id"]
    assert payload["type"] == "access"


def test_login_rejects_inactive_user(client, seeded_user):
    """Caso límite: un usuario desactivado no puede iniciar sesión, aunque su contraseña sea correcta."""
    users.update({"is_active": False}, Query().id == seeded_user["id"])

    response = client.post(
        "/auth/login",
        data={"username": seeded_user["email"], "password": seeded_user["password"]},
    )

    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_login_rejects_wrong_password(client, seeded_user):
    """Modo de fallo: una contraseña incorrecta no devuelve token."""
    response = client.post(
        "/auth/login",
        data={"username": seeded_user["email"], "password": "clave-incorrecta"},
    )

    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_login_unknown_email_gets_same_message_as_wrong_password(client, seeded_user):
    """Modo de fallo: email inexistente y contraseña incorrecta responden igual."""
    wrong_password = client.post(
        "/auth/login",
        data={"username": seeded_user["email"], "password": "clave-incorrecta"},
    )
    unknown_email = client.post(
        "/auth/login",
        data={"username": "nadie@brasaland.com", "password": "clave-incorrecta"},
    )

    assert wrong_password.status_code == 401
    assert unknown_email.status_code == 401
    # Mismo mensaje en ambos casos: la API no revela qué emails están registrados.
    assert wrong_password.json()["detail"] == unknown_email.json()["detail"]
