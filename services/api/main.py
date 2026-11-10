from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes.auth import auth_router
from routes.incident_manager import router as incident_manager_router
from routes.incidents import router as incidents_router
from routes.profiles import profiles_router
from routes.suppliers import router as suppliers_router
from routes.users import users_router


app = FastAPI(title="API central de Brasaland")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)
app.include_router(incidents_router)
app.include_router(incident_manager_router)
app.include_router(suppliers_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(auth_router)


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"message": "Ocurrió un error inesperado. Inténtalo de nuevo más tarde."},
    )


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "La API está funcionando."}