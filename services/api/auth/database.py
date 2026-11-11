import logging
import os
from pathlib import Path

from tinydb import TinyDB

logger = logging.getLogger(__name__)

# Permite usar otro archivo (por ejemplo, en los tests) con la variable AUTH_DB_PATH.
AUTH_DB_PATH = Path(os.getenv("AUTH_DB_PATH", Path(__file__).resolve().parent / "auth.json"))

# Inicializa la conexión y las tablas de autenticación.
try:
    auth_db = TinyDB(AUTH_DB_PATH, indent=2, ensure_ascii=False)
    auth_db.tables()  # Lee el archivo para detectar datos dañados al arrancar.
except (OSError, ValueError) as error:
    logger.error("No se pudo abrir la base de datos de autenticación %s.", AUTH_DB_PATH, exc_info=error)
    raise RuntimeError(
        f"No se pudo abrir la base de datos {AUTH_DB_PATH.name}. "
        "Revisa que exista, tenga permisos de lectura y sea JSON válido."
    ) from error
users = auth_db.table("users")
profiles = auth_db.table("profiles")
