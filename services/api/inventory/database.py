import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine


# Cargar variables de entorno desde .env (mismo patrón que auth/security.py)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


# Leer y validar DATABASE_URL desde variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL debe estar definida en services/api/.env "
        "(conexión a Supabase PostgreSQL)."
    )

# Crear engine de SQLModel para PostgreSQL
# echo=False: no registra las sentencias SQL en logs
engine: Engine = create_engine(DATABASE_URL, echo=False)


def get_db() -> Generator[Session, None, None]:
    """Generador que proporciona una sesión de base de datos a cada request.
    
    Uso: @app.get(..., dependencies=[Depends(get_db)])
         o en rutas: async def mi_ruta(db: Session = Depends(get_db))
    
    Abre sesión, la cede al endpoint y la cierra automáticamente.
    """
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    """Crea todas las tablas en la base de datos.
    
    Debe llamarse una sola vez al iniciar la API.
    Importa los modelos de inventory.models para registrarlos en SQLModel.metadata.
    """
    # Importar modelos para que se registren en SQLModel.metadata
    import inventory.models  # noqa: F401
    
    # Crear todas las tablas definidas en los modelos
    SQLModel.metadata.create_all(engine)
