# API central de Brasaland

Una sola app **FastAPI** con tres módulos:

- **Análisis de incidencias**: valida y resume un CSV de incidencias.
- **Directorio de proveedores**: CRUD de proveedores con **TinyDB** y validación con **Pydantic**.
- **Autenticación**: usuarios, perfiles, inicio de sesión con JWT, y recuperación y cambio de contraseña con envío de correo.

## Estructura

```text
services/api/
├── main.py                        # App, CORS y registro de los routers
├── models.py                      # Modelos Pydantic de proveedores
├── database.py                    # Conexión a TinyDB (db.json)
├── seed.py                        # Carga los proveedores del briefing
├── .env.example                   # Variables de entorno necesarias (copiar como .env)
├── auth/
│   ├── models.py                  # Modelos Pydantic de usuarios, perfiles y contraseñas
│   ├── database.py                # Conexión a TinyDB propia (auth.json)
│   ├── security.py                # Hash de contraseñas, tokens JWT y get_current_user
│   ├── services.py                # Lógica de usuarios, perfiles y contraseñas
│   └── mailer.py                  # Envío del correo de restablecimiento con Resend
├── routes/
│   ├── incidents.py               # Endpoints de incidencias
│   ├── suppliers.py               # Endpoints de proveedores
│   ├── users.py                   # Endpoints de usuarios
│   ├── profiles.py                # Endpoints de perfiles
│   └── auth.py                    # Login, sesión y contraseñas
└── CONTEXT-supplier-directory.md  # Briefing del directorio de proveedores
```

## Cómo ejecutar

Requiere Python 3.10 o superior y [uv](https://docs.astral.sh/uv/). Desde `services/api`:

```bash
cp .env.example .env         # crea el archivo de variables y completá los valores
uv sync                      # instala las dependencias
uv run seed                  # carga los 15 proveedores del briefing (no duplica si se repite)
uv run fastapi dev main.py   # inicia la API en el puerto 8000
```

- Documentación interactiva (Swagger): http://localhost:8000/docs
- CORS permite peticiones desde http://localhost:3000.

## Variables de entorno

Se leen de `services/api/.env`, que **no se sube a Git**. Los nombres y valores de ejemplo están en `.env.example`.

| Variable | Para qué sirve | Ejemplo |
|----------|----------------|---------|
| `SECRET_KEY` | Firma los tokens JWT. Obligatoria. | un texto largo y secreto |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión. | `30` |
| `RESET_TOKEN_EXPIRE_MINUTES` | Duración del enlace de restablecimiento. | `30` |
| `FRONTEND_URL` | Dirección del backoffice, usada para armar el enlace del correo. Sin `/` al final. | `http://localhost:3000` |
| `RESEND_API_KEY` | API key de [Resend](https://resend.com) con permiso *Sending access*. Obligatoria para enviar correos. | `re_...` |
| `EMAIL_FROM` | Remitente del correo. Opcional. | `Brasaland <onboarding@resend.dev>` |

> **Nota sobre Resend:** con el remitente de prueba `onboarding@resend.dev` solo se pueden enviar correos al email de la cuenta de Resend. Para probar, registrá un usuario con ese mismo email.

> **Nota sobre Codespaces:** si el backoffice corre en GitHub Codespaces, `FRONTEND_URL` tiene que ser la dirección del puerto 3000 que aparece en la pestaña *Ports* (por ejemplo `https://nombre-3000.app.github.dev`), no `localhost`.

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

### Gestor de Incidencias

Endpoints para gestionar el ciclo de vida de incidencias (crear, listar, filtrar, cambiar estado, ver resumen).

| Método | Ruta | Sesión | Qué hace |
|--------|------|--------|----------|
| `POST` | `/api/incidents` | Sí | Crea una incidencia. Cuerpo: `{ title, description, status, origin, branch, category, priority }`. Devuelve 201 con la incidencia creada. |
| `GET` | `/api/incidents` | Sí | Lista incidencias con filtros opcionales: `?status=`, `?origin=`, `?branch=`, `?category=`. Devuelve lista de incidencias. |
| `GET` | `/api/incidents/{id}` | Sí | Obtiene una incidencia por ID. Devuelve 404 si no existe. |
| `PATCH` | `/api/incidents/{id}/status` | Sí | Cambia el estado de una incidencia. Cuerpo: `{ status }`. Valida la transición según las reglas del dominio. |
| `GET` | `/api/incidents/summary` | Sí | Devuelve un resumen estadístico de incidencias agrupadas por estado, origen, rama y categoría. |

#### Cargar datos históricos (seed)

El script `scripts/seed_incidents.py` carga la tabla `incidents` de forma idempotente desde el CSV histórico `scripts/incidents-brasaland.csv`.

**Qué hace:**
1. Lee registros del CSV.
2. Valida cada fila usando la lógica del analizador (`packages/shared/incidents_analysis`).
3. Transforma cada fila según el modelo del briefing (estado, categoría, título, fecha y sede) con `origin` configurado como `"customer"`.
4. Guarda las incidencias válidas en la tabla `incidents` llamando al endpoint `POST /api/incidents`.
5. Registra cada `incident_id` en la tabla `seed_imports` para garantizar idempotencia — ejecutar de nuevo no duplica registros.

**Comando:**

Desde la raíz del repositorio:
```bash
uv run --project services/api python scripts/seed_incidents.py
```

**Resultado esperado:**

```
Importing incidents from incidents-brasaland.csv
Processing 100 records...
✓ 96 imported
✗ 4 invalid (skipped)

Status distribution:
  open:     32
  resolved: 50
  discarded: 14
```

**Formato de errores:**

Todos los endpoints de incidencias devuelven errores con este formato:

```json
{
  "field": "status",
  "message": "Invalid status transition from 'open' to 'invalid_state'",
  "errors": [
    { "rule": "status_in_allowed_values", "detail": "status must be one of: open, in_progress, resolved, closed" }
  ]
}
```

- **400**: validación fallida (campo inválido, transición no permitida, etc.).
- **404**: incidencia no encontrada.
- **500**: error interno del servidor.

### Autenticación

| Método | Ruta | Sesión | Qué hace |
|--------|------|--------|----------|
| `POST` | `/users` | No | Registra un usuario y su perfil inicial (responde 201). |
| `POST` | `/auth/login` | No | Recibe un formulario (`username` = email, `password`) y devuelve un `access_token`. 401 si las credenciales son incorrectas. |
| `GET` | `/auth/me` | Sí | Devuelve el usuario autenticado y su perfil. |
| `POST` | `/auth/forgot-password` | No | Recibe `{ email }`. Si el usuario existe, envía el correo con el enlace. **Siempre responde 200.** |
| `POST` | `/auth/reset-password` | No | Recibe `{ token, new_password }`. Cambia la contraseña. 400 si el token es inválido, venció o ya se usó. |
| `POST` | `/auth/change-password` | Sí | Recibe `{ current_password, new_password }`. 400 si la contraseña actual es incorrecta. |

El resto de los endpoints de usuarios y perfiles se pueden ver en `/docs`. Las rutas que piden sesión necesitan la cabecera `Authorization: Bearer <access_token>`; sin ella responden 401.

## Recuperación y cambio de contraseña (AUTH-03)

### Cómo funciona

1. **Solicitud:** el usuario envía su email a `/auth/forgot-password`. Si existe, la API crea un token de restablecimiento y envía con Resend un correo con el enlace `FRONTEND_URL/reset-password?token=<token>`. El correo tiene versión HTML (legible en móvil) y versión en texto.
2. **Restablecimiento:** el usuario abre el enlace, escribe una nueva contraseña, y el backoffice envía el token y la contraseña a `/auth/reset-password`.
3. **Confirmación:** si sale bien, el backoffice lo lleva a `/login` y puede entrar con la nueva contraseña.

### Decisiones de seguridad

- **No revela qué emails existen:** `/auth/forgot-password` responde siempre lo mismo con 200, exista o no el email. Si el envío del correo falla, el error se registra en el log, pero la respuesta no cambia.
- **Tokens con tipo:** cada JWT indica para qué sirve (`"type": "access"` para la sesión y `"type": "password_reset"` para el correo). El enlace del correo no sirve para iniciar sesión, y un token de sesión no sirve para restablecer la contraseña.
- **Vencimiento:** el token del correo dura `RESET_TOKEN_EXPIRE_MINUTES` minutos (30 por defecto).
- **Un solo uso:** cada usuario guarda `password_changed_at`, el momento de su último cambio de contraseña, y cada token guarda `iat`, el momento en que se creó. Si el token se creó antes del último cambio, se rechaza. Por eso, apenas se usa, deja de funcionar. Cualquier otro enlace pedido antes también deja de servir, y lo mismo pasa al usar `/auth/change-password`.
- **Contraseñas cifradas:** se guardan con bcrypt; nunca en texto plano.
- **Sin secretos en el código:** la API key de Resend y la `SECRET_KEY` se leen solo del `.env`.

### Cómo probarlo en `/docs`

1. Registrá un usuario con `POST /users`, usando el email de tu cuenta de Resend.
2. `POST /auth/forgot-password` con ese email → 200 y llega el correo.
3. Copiá el token del enlace y usalo en `POST /auth/reset-password` → 200.
4. Repetí el mismo pedido → 400 (el token ya se usó).
5. Con **Authorize** iniciá sesión, y probá `POST /auth/change-password` con una contraseña actual incorrecta (400) y con la correcta (200).
6. Para probar el vencimiento, poné `RESET_TOKEN_EXPIRE_MINUTES=1`, reiniciá la API, pedí un enlace y esperá más de un minuto antes de usarlo → 400.

## Reglas de validación de proveedores

- Estado: `active` o `suspended`.
- `rate_per_unit` debe ser mayor que 0.
- Al menos una categoría, y todas deben ser válidas.
- La moneda depende del país: Colombia → `COP`, USA → `USD`.
- `updated_at` lo genera el sistema al crear el proveedor y al cambiar la tarifa.

Los datos inválidos se rechazan con **422** y los IDs inexistentes con **404**.

## Bases de datos

Los datos se guardan en archivos de TinyDB que **no se suben a Git** (están en `.gitignore`) y persisten al reiniciar la API:

- `db.json`: proveedores. Se crea con `uv run seed`.
- `auth/auth.json`: usuarios y perfiles. Se crea solo al registrar el primer usuario.