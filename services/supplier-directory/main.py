from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.suppliers import router as suppliers_router

app = FastAPI(title="Brasaland - Directorio de Proveedores")

# En producción, limita los orígenes permitidos.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(suppliers_router)


@app.get("/")
def health_check() -> dict[str, str]:
    """Indica que la API está funcionando."""
    return {"message": "La API está funcionando."}
