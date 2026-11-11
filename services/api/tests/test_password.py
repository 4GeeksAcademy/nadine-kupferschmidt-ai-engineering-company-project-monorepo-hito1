from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt
from tinydb import Query

from auth import services
from auth.database import users
from auth.security import ALGORITHM, SECRET_KEY, create_access_token, create_reset_token


def login_status(client, email, password):
    """Devuelve el código de respuesta del login con esas credenciales."""
    response = client.post("/auth/login", data={"username": email, "password": password})
    return response.status_code


@pytest.fixture
def sent_emails(monkeypatch):
    """Reemplaza el envío de correo por una lista para no mandar correos reales."""
    sent = []

    def fake(email, token):
        sent.append(email)

    # Permite comprobar si la API decidió enviar el correo.
    monkeypatch.setattr(services, "send_password_reset_email", fake)
    return sent


def test_forgot_password_sends_email_to_active_user(client, seeded_user, sent_emails):
    """Camino feliz: un usuario activo recibe el correo de restablecimiento."""
    response = client.post("/auth/forgot-password", json={"email": seeded_user["email"]})

    assert response.status_code == 200
    assert sent_emails == [seeded_user["email"]]


def test_forgot_password_unknown_email_sends_nothing_and_same_message(client, seeded_user, sent_emails):
    """Caso límite: un email no registrado no envía nada y responde igual que uno registrado."""
    unknown = client.post("/auth/forgot-password", json={"email": "nadie@brasaland.com"})
    known = client.post("/auth/forgot-password", json={"email": seeded_user["email"]})

    assert unknown.status_code == 200
    assert sent_emails == [seeded_user["email"]]
    # Mismo mensaje en ambos casos: no revela qué emails existen.
    assert unknown.json()["message"] == known.json()["message"]


def test_forgot_password_inactive_user_sends_nothing(client, seeded_user, sent_emails):
    """Modo de fallo: un usuario desactivado no recibe correo de restablecimiento."""
    users.update({"is_active": False}, Query().id == seeded_user["id"])

    response = client.post("/auth/forgot-password", json={"email": seeded_user["email"]})

    assert response.status_code == 200
    assert sent_emails == []


def test_reset_password_with_valid_code_changes_password(client, seeded_user):
    """Camino feliz: un código válido cambia la contraseña."""
    token = create_reset_token(seeded_user["id"])

    response = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "nueva-clave-123"},
    )

    assert response.status_code == 200
    assert login_status(client, seeded_user["email"], "nueva-clave-123") == 200
    assert login_status(client, seeded_user["email"], seeded_user["password"]) == 401


def test_reset_password_code_cannot_be_used_twice(client, seeded_user):
    """Caso límite: el mismo código de reset no sirve dos veces."""
    token = create_reset_token(seeded_user["id"])

    first = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "primera-clave-1"},
    )
    second = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "segunda-clave-2"},
    )

    assert first.status_code == 200
    assert second.status_code == 400
    # Solo funciona la contraseña del primer uso.
    assert login_status(client, seeded_user["email"], "primera-clave-1") == 200
    assert login_status(client, seeded_user["email"], "segunda-clave-2") == 401


def test_reset_password_rejects_expired_or_invented_code(client, seeded_user):
    """Modo de fallo: un código vencido o inventado da 400 y no cambia la contraseña."""
    now = datetime.now(timezone.utc)
    expired_token = jwt.encode(
        {
            "sub": seeded_user["id"],
            "type": "password_reset",
            "iat": int((now - timedelta(hours=2)).timestamp()),
            "exp": now - timedelta(hours=1),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    expired = client.post(
        "/auth/reset-password",
        json={"token": expired_token, "new_password": "clave-vencida-1"},
    )
    invented = client.post(
        "/auth/reset-password",
        json={"token": "codigo-inventado", "new_password": "clave-inventada-1"},
    )

    assert expired.status_code == 400
    assert invented.status_code == 400
    assert login_status(client, seeded_user["email"], seeded_user["password"]) == 200


def test_change_password_with_correct_current_password(client, seeded_user, auth_headers):
    """Camino feliz: con la contraseña actual correcta, la nueva funciona y la vieja no."""
    response = client.post(
        "/auth/change-password",
        headers=auth_headers,
        json={"current_password": seeded_user["password"], "new_password": "nueva-clave-123"},
    )

    assert response.status_code == 200
    assert login_status(client, seeded_user["email"], "nueva-clave-123") == 200
    assert login_status(client, seeded_user["email"], seeded_user["password"]) == 401


def test_change_password_rejects_short_new_password(client, seeded_user, auth_headers):
    """Caso límite: una nueva contraseña de 7 caracteres se rechaza y la vieja sigue sirviendo."""
    response = client.post(
        "/auth/change-password",
        headers=auth_headers,
        json={"current_password": seeded_user["password"], "new_password": "corta12"},
    )

    assert response.status_code == 422
    assert login_status(client, seeded_user["email"], seeded_user["password"]) == 200


def test_change_password_rejects_wrong_current_password(client, seeded_user, auth_headers):
    """Modo de fallo: con una contraseña actual incorrecta no cambia nada."""
    response = client.post(
        "/auth/change-password",
        headers=auth_headers,
        json={"current_password": "clave-incorrecta", "new_password": "nueva-clave-123"},
    )

    assert response.status_code == 400
    assert login_status(client, seeded_user["email"], seeded_user["password"]) == 200


def test_reset_password_rejects_session_token(client, seeded_user):
    """Modo de fallo: un token de sesión no sirve como código de restablecimiento."""
    session_token = create_access_token(seeded_user["id"])

    response = client.post(
        "/auth/reset-password",
        json={"token": session_token, "new_password": "nueva-clave-123"},
    )

    # Un token de sesión no debe servir como código de restablecimiento.
    assert response.status_code == 400
    assert login_status(client, seeded_user["email"], seeded_user["password"]) == 200


def test_forgot_password_mail_failure_keeps_same_message(client, seeded_user, monkeypatch):
    """Caso límite: si el correo falla, la respuesta sigue igual para emails existentes o no."""
    def broken(email, token):
        raise Exception("Servidor de correo caído")

    monkeypatch.setattr(services, "send_password_reset_email", broken)

    known = client.post("/auth/forgot-password", json={"email": seeded_user["email"]})
    unknown = client.post("/auth/forgot-password", json={"email": "nadie@brasaland.com"})

    assert known.status_code == 200
    assert unknown.status_code == 200
    # Si el correo falla, la respuesta no debe revelar qué emails existen.
    assert known.json()["message"] == unknown.json()["message"]


def test_reset_password_rejects_inactive_user(client, seeded_user):
    """Caso límite: un usuario desactivado no puede usar un código pedido antes."""
    token = create_reset_token(seeded_user["id"])
    hash_before = users.get(Query().id == seeded_user["id"])["hashed_password"]
    users.update({"is_active": False}, Query().id == seeded_user["id"])

    response = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "nueva-clave-123"},
    )

    # Un usuario desactivado no puede usar un código pedido antes de ser desactivado.
    assert response.status_code == 400
    assert users.get(Query().id == seeded_user["id"])["hashed_password"] == hash_before
