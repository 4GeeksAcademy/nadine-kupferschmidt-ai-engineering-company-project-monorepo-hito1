from pathlib import Path

from tinydb import TinyDB

# Guarda la base de datos junto a este archivo.
DB_PATH = Path(__file__).resolve().parent / "db.json"

# Inicializa la conexión y la tabla de proveedores.
db = TinyDB(DB_PATH, indent=2, ensure_ascii=False)
suppliers = db.table("suppliers")

# Guarda los datos de autenticación en una base separada.
AUTH_DB_PATH = Path(__file__).resolve().parent / "auth.json"

# Inicializa la conexión y las tablas de autenticación.
auth_db = TinyDB(AUTH_DB_PATH, indent=2, ensure_ascii=False)
users = auth_db.table("users")
profiles = auth_db.table("profiles")
