from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import auth_router
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
app.include_router(suppliers_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(auth_router)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "La API está funcionando."}