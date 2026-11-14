from tinydb import Query

from auth.database import profiles, users


def test_register_creates_active_user_with_default_role_and_profile(client):
    """Camino feliz: el registro crea un usuario activo con rol user y su perfil."""
    response = client.post(
        "/users",
        json={"email": "beto@brasaland.com", "password": "clave-segura-2", "name": "Beto"},
    )

    assert response.status_code == 201

    user = users.get(Query().email == "beto@brasaland.com")
    assert user is not None
    assert user["role"] == "user"
    assert user["is_active"] is True
    # La contraseña se guarda cifrada, nunca en texto plano.
    assert user["hashed_password"] != "clave-segura-2"

    profile = profiles.get(Query().user_id == user["id"])
    assert profile is not None
    assert profile["name"] == "Beto"


def test_register_rejects_duplicate_email(client, seeded_user):
    """Caso límite: no se puede registrar dos veces el mismo email."""
    response = client.post(
        "/users",
        json={"email": "ana@brasaland.com", "password": "otra-clave-3"},
    )

    assert response.status_code == 409
    # Sigue habiendo un único usuario con ese email.
    assert len(users.search(Query().email == "ana@brasaland.com")) == 1


def test_register_rejects_invalid_email(client):
    """Modo de fallo: un email inválido se rechaza y no se guarda nada."""
    response = client.post(
        "/users",
        json={"email": "hola", "password": "clave-segura-4"},
    )

    assert response.status_code == 422
    assert users.all() == []


def test_register_rejects_short_password(client):
    """Modo de fallo: una contraseña de 7 caracteres se rechaza y no se guarda nada."""
    response = client.post(
        "/users",
        json={"email": "carla@brasaland.com", "password": "corta12"},
    )

    assert response.status_code == 422
    assert users.all() == []
