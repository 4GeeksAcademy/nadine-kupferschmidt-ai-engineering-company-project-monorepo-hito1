# Imagen base oficial de Python 3.13 (ligera, basada en Debian slim)
FROM python:3.13-slim

# Copia el binario de uv desde su imagen oficial
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Replica la estructura de carpetas del repo (/monorepo/services/api), porque routes/ busca packages/shared subiendo 3 niveles con parents[3]
WORKDIR /monorepo/services/api

# Copia solo requirements.txt para aprovechar la caché de capas de Docker
COPY api/requirements.txt .

# Instala las dependencias en el Python del sistema usando uv
RUN uv pip install --system -r requirements.txt

# Copia el resto del código de la API al directorio de trabajo
COPY api/ .

# Documenta que la API escucha en el puerto 8000
EXPOSE 8000

# Arranca Uvicorn en modo desarrollo (recarga automática) escuchando en todas las interfaces
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
