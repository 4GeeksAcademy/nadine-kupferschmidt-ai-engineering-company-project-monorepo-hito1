from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.incidents import router


app = FastAPI(title="API de incidencias de Brasaland")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(router)