from pathlib import Path

from tinydb import TinyDB

# Guarda la base de datos junto a este archivo.
DB_PATH = Path(__file__).resolve().parent / "db.json"

# Inicializa la conexión y la tabla de proveedores.
db = TinyDB(DB_PATH)
suppliers = db.table("suppliers")
