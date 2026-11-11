from tinydb import Query

from auth import services
from auth.database import profiles, users
from auth.models import UserCreate
from auth.security import create_access_token


def test_get_my_profile_returns_owner_profile(client, seeded_user, auth_headers):
    """Camino feliz: devuelve el perfil de quien tiene el token."""
    response = client.get("/profiles/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["user_id"] == seeded_user["id"]
    assert response.json()["name"] == "Ana"


def test_get_my_profile_without_optional_data(client):
    """Caso límite: un usuario sin nombre ni teléfono tiene perfil con esos campos vacíos."""
    beto = services.create_user(UserCreate(email="beto@brasaland.com", password="clave-segura-2"))
    token = create_access_token(beto["id"])

    response = client.get("/profiles/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    # El endpoint devuelve el perfil de Beto, no el de otra persona.
    assert response.json()["user_id"] == beto["id"]
    profile = profiles.get(Query().user_id == beto["id"])
    assert profile is not None
    assert profile["name"] is None
    assert profile["phone"] is None


def test_get_my_profile_without_token(client):
    """Modo de fallo: sin token no se devuelve ningún perfil."""
    response = client.get("/profiles/me")

    assert response.status_code == 401


def test_update_my_profile_changes_name_only_in_profile(client, seeded_user, auth_headers):
    """Camino feliz: cambiar el nombre actualiza el perfil y no toca el email de la cuenta."""
    response = client.put("/profiles/me", headers=auth_headers, json={"name": "Ana María"})

    assert response.status_code == 200
    profile = profiles.get(Query().user_id == seeded_user["id"])
    assert profile["name"] == "Ana María"
    # Editar el perfil no toca los datos de la cuenta.
    user = users.get(Query().id == seeded_user["id"])
    assert user["email"] == "ana@brasaland.com"


def test_update_my_profile_with_only_phone_keeps_name(client, seeded_user, auth_headers):
    """Caso límite: enviar solo el teléfono mantiene el nombre."""
    response = client.put("/profiles/me", headers=auth_headers, json={"phone": "8888-8888"})

    assert response.status_code == 200
    profile = profiles.get(Query().user_id == seeded_user["id"])
    assert profile["phone"] == "8888-8888"
    # Solo se cambian los campos enviados.
    assert profile["name"] == "Ana"


def test_update_my_profile_without_token(client, seeded_user):
    """Modo de fallo: sin token no se puede modificar el perfil."""
    response = client.put("/profiles/me", json={"name": "Intruso"})

    assert response.status_code == 401
    profile = profiles.get(Query().user_id == seeded_user["id"])
    assert profile["name"] == "Ana"
