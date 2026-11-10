from pathlib import Path

from tinydb import TinyDB

# Guarda la base de datos junto a este archivo.
DB_PATH = Path(__file__).resolve().parent / "db.json"

# Inicializa la conexión y las tablas de proveedores e incidencias.
db = TinyDB(DB_PATH, indent=2, ensure_ascii=False)
suppliers = db.table("suppliers")
incidents = db.table("incidents")
