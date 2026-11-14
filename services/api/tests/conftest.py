import os
import tempfile

# Debe ir antes de importar la app para que nunca se use el auth.json real.
os.environ["AUTH_DB_PATH"] = os.path.join(tempfile.mkdtemp(), "auth_test.json")
os.environ.setdefault("SECRET_KEY", "clave-solo-para-tests")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402
from auth.database import profiles, users  # noqa: E402
from auth import services  # noqa: E402
from auth.models import UserCreate  # noqa: E402
from auth.security import create_access_token  # noqa: E402


@pytest.fixture(autouse=True)
def clean_db():
    """Vacía las tablas de usuarios y perfiles antes y después de cada test."""
    users.truncate()
    profiles.truncate()
    yield
    users.truncate()
    profiles.truncate()


@pytest.fixture
def client():
    """Cliente HTTP de pruebas para la app."""
    return TestClient(app)


@pytest.fixture
def seeded_user():
    """Crea un usuario de prueba y devuelve sus datos con la contraseña en texto plano."""
    user = services.create_user(
        UserCreate(email="ana@brasaland.com", password="clave-segura-1", name="Ana")
    )
    return {**user, "password": "clave-segura-1"}


@pytest.fixture
def auth_headers(seeded_user):
    """Devuelve las cabeceras de autorización con un token de sesión del usuario de prueba."""
    token = create_access_token(seeded_user["id"])
    return {"Authorization": f"Bearer {token}"}
