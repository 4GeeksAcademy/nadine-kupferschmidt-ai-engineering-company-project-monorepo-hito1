# Guía de Docker para el monorepo

Esta guía explica cómo levantar el monorepo con Docker en modo desarrollo. Está pensada para alguien que acaba de unirse al equipo.

---

## 1. Qué levanta Docker

Docker levanta dos servicios definidos en [docker-compose.yml](../docker-compose.yml):

| Servicio (nombre en compose) | Qué contiene | Puerto |
|---|---|---|
| `uis` | El sitio público `website` (HTML estático), y las apps Next.js `backoffice` y `talent-pipeline-tracker` | `3000` (website), `3001` (backoffice) y `3002` (tracker) |
| `services` | La API FastAPI, con código en `services/api` | `8000` |

Cuando los abras en el navegador:

- Website: http://localhost:3000
- Backoffice: http://localhost:3001
- Talent Pipeline Tracker: http://localhost:3002
- API: http://localhost:8000

---

## 2. Primer uso

1. En la raíz del repo, copia `.env.example` como `.env`:

   ```bash
   cp .env.example .env
   ```

2. Abre `.env` y completa los valores que estén vacíos. Si no sabes cuál usar, pregúntale al equipo. **No subas `.env` a git.**

3. Construye y arranca todo:

   ```bash
   docker compose up --build
   ```

La primera vez tarda bastante, porque descarga las imágenes e instala las dependencias.

---

## 3. Uso diario

- Para arrancar: `docker compose up`
- Para apagar, en la misma terminal: `Ctrl+C`
- Para apagar y quitar los contenedores: `docker compose down`

Si ya construiste las imágenes antes, `docker compose up` basta. Solo necesitas `--build` cuando cambian las dependencias (ver la sección 5).

---

## 4. Cómo se comunican los servicios

Dentro de Docker, cada servicio se encuentra por su nombre. Por eso la URL de la API se escribe así:

```
API_URL=http://services:8000
```

y **no** así:

```
API_URL=http://localhost:8000
```

Motivo: dentro del contenedor de `uis`, `localhost` apunta al propio contenedor, no al de la API.

El navegador es distinto: corre en tu máquina, fuera de Docker. Por eso, para abrir las páginas y para lo que el navegador llama directamente, usa `localhost` con los puertos publicados (`3000`, `3001`, `3002`, `8000`).

---

## 5. Qué hacer cuando

### Agregas una dependencia de Node

Las dependencias se instalan dentro de la imagen, no en tu carpeta. Reconstruye:

```bash
docker compose up --build
```

### Agregas una dependencia de Python

1. Agrégala con uv, dentro de `services/api`:

   ```bash
   uv add nombre-del-paquete
   ```

2. Regenera `services/api/requirements.txt`, que es lo que lee la imagen:

   ```bash
   cd services/api && uv export --format requirements-txt --no-hashes --no-dev --no-emit-project -o requirements.txt
   ```

3. Reconstruye:

   ```bash
   docker compose up --build
   ```

### Agregas una variable de entorno

1. Agrégala a `.env` con su valor real.
2. Agrégala también a `.env.example`, pero **sin valor secreto**. Así el resto del equipo sabe que existe.
3. Vuelve a arrancar con `docker compose up`. Usa `up` y no solo `restart`, porque `restart` no vuelve a leer `.env`.

### Agregas una app nueva en `uis/`

Hay que tocar cuatro lugares:

1. [uis/start.sh](../uis/start.sh): agrega una línea que arranque la app en un puerto libre. Usa `-H 0.0.0.0` para Next.js o `-a 0.0.0.0` para http-server.
2. [uis/Dockerfile](../uis/Dockerfile): copia el `package.json` y `package-lock.json` de la app, ejecuta `npm ci` y agrega su puerto a `EXPOSE`.
3. [docker-compose.yml](../docker-compose.yml), en `uis`:
   - agrega el puerto en `ports`;
   - agrega un volumen anónimo para `node_modules`. Si la app es Next.js, agrega también uno para `.next`.
4. Reconstruye con `docker compose up --build`.

**Nota:** el `website` es HTML estático servido con http-server (no Next.js), así que no tiene volumen anónimo para `.next`.

---

## 6. Decisiones de diseño

**¿Por qué el código de la API vive en `/monorepo/services/api` dentro del contenedor?**
La API importa código de `packages/shared` (por ejemplo, `routes/incidents.py` y `routes/incident_manager.py`). En el código, `routes/` busca `packages/shared` subiendo tres niveles con `parents[3]`. Para que esa ruta funcione, el contenedor replica la misma estructura del repo: `/monorepo/services/api` y, a su lado, `/monorepo/packages/shared`. Por eso el compose monta `packages/shared` como volumen. Si cambias la estructura de carpetas, la API dejará de encontrar esos módulos.

**¿Por qué no hay contenedor de base de datos?**
- La base de datos de Supabase está en la nube, así que la API se conecta a ella desde fuera.
- TinyDB guarda sus datos en archivos dentro de `services/api`. Como esa carpeta está montada, los datos quedan en tu máquina y no se pierden al apagar los contenedores.

**¿Por qué los `.dockerignore` excluyen `.env`?**
Así los secretos no entran en la imagen. Las variables llegan a los contenedores en el momento de arrancar, desde `.env`.
