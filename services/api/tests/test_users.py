from tinydb import Query

from auth import services
from auth.database import profiles, users
from auth.models import UserCreate
from auth.security import create_access_token


def create_user_with_headers(email: str, role: str = "user") -> tuple[dict, dict]:
    """Crea un usuario con el rol indicado y devuelve el usuario y sus cabeceras de autorización."""
    user = services.create_user(UserCreate(email=email, password="clave-segura-9"))
    if role != "user":
        users.update({"role": role}, Query().id == user["id"])
    token = create_access_token(user["id"])
    return user, {"Authorization": f"Bearer {token}"}


# GET

def test_list_and_get_users_when_logged_in(client, seeded_user, auth_headers):
    """Camino feliz: un usuario autenticado puede listar usuarios y ver uno por su ID."""
    list_response = client.get("/users", headers=auth_headers)
    assert list_response.status_code == 200
    assert "ana@brasaland.com" in [item["email"] for item in list_response.json()]

    get_response = client.get(f"/users/{seeded_user['id']}", headers=auth_headers)
    assert get_response.status_code == 200
    assert get_response.json()["id"] == seeded_user["id"]


def test_get_unknown_user_returns_404(client, auth_headers):
    """Caso límite: pedir un ID que no existe devuelve 404."""
    response = client.get("/users/id-que-no-existe", headers=auth_headers)

    assert response.status_code == 404


def test_users_responses_never_include_hashed_password(client, seeded_user, auth_headers):
    """Caso límite: la contraseña cifrada nunca debe salir de la API."""
    # La contraseña cifrada nunca debe salir de la API.
    list_response = client.get("/users", headers=auth_headers)
    for item in list_response.json():
        assert "hashed_password" not in item

    get_response = client.get(f"/users/{seeded_user['id']}", headers=auth_headers)
    assert "hashed_password" not in get_response.json()


def test_list_users_without_token(client):
    """Modo de fallo: GET /users sin token devuelve 401."""
    response = client.get("/users")

    assert response.status_code == 401


# PUT

def test_user_can_update_own_email(client, seeded_user, auth_headers):
    """Camino feliz: un usuario puede cambiar su propio email."""
    response = client.put(
        f"/users/{seeded_user['id']}",
        headers=auth_headers,
        json={"email": "ana.nueva@brasaland.com"},
    )

    assert response.status_code == 200
    user = users.get(Query().id == seeded_user["id"])
    assert user["email"] == "ana.nueva@brasaland.com"


def test_regular_user_cannot_make_themselves_admin(client, seeded_user, auth_headers):
    """Caso límite: un usuario normal no puede darse el rol admin."""
    response = client.put(
        f"/users/{seeded_user['id']}",
        headers=auth_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 403
    user = users.get(Query().id == seeded_user["id"])
    assert user["role"] == "user"


def test_cannot_use_email_of_another_user(client, seeded_user, auth_headers):
    """Caso límite: no se puede usar el email de otro usuario."""
    create_user_with_headers("beto@brasaland.com")

    response = client.put(
        f"/users/{seeded_user['id']}",
        headers=auth_headers,
        json={"email": "beto@brasaland.com"},
    )

    assert response.status_code == 409
    user = users.get(Query().id == seeded_user["id"])
    assert user["email"] == "ana@brasaland.com"


def test_update_rejects_invalid_email(client, seeded_user, auth_headers):
    """Modo de fallo: un email con formato inválido se rechaza."""
    # Cubre el bug corregido en PUT /users.
    response = client.put(
        f"/users/{seeded_user['id']}",
        headers=auth_headers,
        json={"email": "hola"},
    )

    assert response.status_code == 422
    user = users.get(Query().id == seeded_user["id"])
    assert user["email"] == "ana@brasaland.com"


def test_user_cannot_update_another_user(client, seeded_user, auth_headers):
    """Modo de fallo: un usuario no puede modificar a otro."""
    beto, _ = create_user_with_headers("beto@brasaland.com")

    response = client.put(
        f"/users/{beto['id']}",
        headers=auth_headers,
        json={"email": "intruso@brasaland.com"},
    )

    assert response.status_code == 403
    user = users.get(Query().id == beto["id"])
    assert user["email"] == "beto@brasaland.com"


# DELETE

def test_user_can_delete_own_account(client, seeded_user, auth_headers):
    """Camino feliz: un usuario puede borrar su propia cuenta."""
    response = client.delete(f"/users/{seeded_user['id']}", headers=auth_headers)

    assert response.status_code == 204
    # Se borran los dos: el usuario y su perfil.
    assert users.get(Query().id == seeded_user["id"]) is None
    assert profiles.get(Query().user_id == seeded_user["id"]) is None


def test_admin_can_delete_another_user(client, seeded_user):
    """Caso límite: un administrador puede borrar a otro usuario."""
    _, admin_headers = create_user_with_headers("admin@brasaland.com", role="admin")

    response = client.delete(f"/users/{seeded_user['id']}", headers=admin_headers)

    assert response.status_code == 204
    assert users.get(Query().id == seeded_user["id"]) is None


def test_user_cannot_delete_another_user(client, seeded_user, auth_headers):
    """Modo de fallo: un usuario normal no puede borrar a otro."""
    beto, _ = create_user_with_headers("beto@brasaland.com")

    response = client.delete(f"/users/{beto['id']}", headers=auth_headers)

    assert response.status_code == 403
    assert users.get(Query().id == beto["id"]) is not None
