# API de incidencias

Requiere Python 3.10 o superior y [uv](https://docs.astral.sh/uv/).
Desde `services/api`, instala las dependencias y ejecuta:

```bash
uv sync
uv run uvicorn main:app --reload --port 8000
```

Documentacion interactiva: http://localhost:8000/docs.
CORS permite peticiones desde http://localhost:3000.

- `POST /api/incidents/analyze`: envia un CSV como `multipart/form-data`
  en el campo `file`. Devuelve `metrics` e `invalid_rules` (codigo y etiqueta).
- `GET /api/incidents/results/export`: descarga `results.csv` con las columnas
  `metric`, `value` y `percentage`. Devuelve 404 si no hay analisis previo.

El ultimo analisis se conserva solo en memoria del proceso; se pierde al reiniciar.
La API importa el paquete desde `packages` del repositorio.
