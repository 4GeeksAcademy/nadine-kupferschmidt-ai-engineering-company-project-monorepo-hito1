import logging
from pathlib import Path

from tinydb import TinyDB

logger = logging.getLogger(__name__)

# Guarda la base de datos junto a este archivo.
DB_PATH = Path(__file__).resolve().parent / "db.json"

# Inicializa la conexión y las tablas de proveedores e incidencias.
try:
    db = TinyDB(DB_PATH, indent=2, ensure_ascii=False)
    db.tables()  # Lee el archivo para detectar datos dañados al arrancar.
except (OSError, ValueError) as error:
    logger.error("No se pudo abrir la base de datos %s.", DB_PATH, exc_info=error)
    raise RuntimeError(
        f"No se pudo abrir la base de datos {DB_PATH.name}. "
        "Revisa que exista, tenga permisos de lectura y sea JSON válido."
    ) from error
suppliers = db.table("suppliers")
incidents = db.table("incidents")
