# API central de Brasaland

Una sola app **FastAPI** con dos módulos:

- **Análisis de incidencias**: valida y resume un CSV de incidencias.
- **Directorio de proveedores**: CRUD de proveedores con **TinyDB** y validación con **Pydantic**.

## Estructura

```text
services/api/
├── main.py                        # App, CORS y registro de los dos routers
├── models.py                      # Modelos Pydantic de proveedores
├── database.py                    # Conexión a TinyDB (db.json)
├── seed.py                        # Carga los proveedores del briefing
├── routes/
│   ├── incidents.py               # Endpoints de incidencias
│   └── suppliers.py               # Endpoints de proveedores
└── CONTEXT-supplier-directory.md  # Briefing del directorio de proveedores
```

## Cómo ejecutar

Requiere Python 3.10 o superior y [uv](https://docs.astral.sh/uv/). Desde `services/api`:

```bash
uv sync                      # instala las dependencias
uv run seed                  # carga los 15 proveedores del briefing (no duplica si se repite)
uv run fastapi dev main.py   # inicia la API en el puerto 8000
```

- Documentación interactiva (Swagger): http://localhost:8000/docs
- CORS permite peticiones desde http://localhost:3000.

## Endpoints

### Proveedores

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/suppliers` | Registra un proveedor (responde 201). |
| `GET` | `/suppliers` | Lista los proveedores. Filtros opcionales: `?country=` (`Colombia`, `USA`) y `?category=`. |
| `GET` | `/suppliers/{id}` | Devuelve un proveedor. |
| `PATCH` | `/suppliers/{id}/rate` | Cambia la tarifa y actualiza `updated_at`. |
| `PATCH` | `/suppliers/{id}/status` | Cambia el estado (`active` / `suspended`). |
| `DELETE` | `/suppliers/{id}` | Elimina un proveedor (solo para corregir datos cargados por error). |

### Incidencias

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/incidents/analyze` | Recibe un CSV (`multipart/form-data`, campo `file`) y devuelve `metrics` e `invalid_rules`. |
| `GET` | `/api/incidents/results/export` | Descarga `results.csv` con el último análisis (404 si no hay ninguno). |

El último análisis de incidencias se guarda solo en memoria y se pierde al reiniciar.
El módulo de incidencias importa el paquete desde `packages` del repositorio.

## Reglas de validación de proveedores

- Estado: `active` o `suspended`.
- `rate_per_unit` debe ser mayor que 0.
- Al menos una categoría, y todas deben ser válidas.
- La moneda depende del país: Colombia → `COP`, USA → `USD`.
- `updated_at` lo genera el sistema al crear el proveedor y al cambiar la tarifa.

Los datos inválidos se rechazan con **422** y los IDs inexistentes con **404**.

## Base de datos

Los proveedores se guardan en `db.json`:

- No se sube a Git (está en `.gitignore`).
- Se crea con `uv run seed`.
- Los datos persisten al reiniciar la API.
