---
name: mantenimiento-docker
description: Usa esta skill cuando se agrega o cambia una dependencia (npm o Python), una variable de entorno, una app en uis/, un puerto, o una URL que conecta las apps con la API, o cuando se modifica algún archivo de Docker del monorepo (docker-compose.yml, Dockerfile, .dockerignore, uis/start.sh).
---

# Mantenimiento de Docker

## 1. Contexto

- [docker-compose.yml](../../../docker-compose.yml) levanta dos servicios:
  - `uis`: el sitio público `website` (puerto 3000, HTML estático), y las apps Next.js `backoffice` (puerto 3001) y `talent-pipeline-tracker` (puerto 3002). Arranca con [uis/start.sh](../../../uis/start.sh).
  - `services`: la API FastAPI en el puerto 8000, construida desde `services/`.
- La guía para personas del equipo está en [docs/DOCKER.md](../../../docs/DOCKER.md).
- Antes de proponer cualquier cambio, lee `docker-compose.yml`, los Dockerfile ([uis/Dockerfile](../../../uis/Dockerfile) y [services/Dockerfile](../../../services/Dockerfile)) y [uis/start.sh](../../../uis/start.sh).

## 2. Reglas que nunca se rompen

- [ ] Entre contenedores se usa el nombre del servicio, por ejemplo `API_URL=http://services:8000`. Nunca `localhost`, porque dentro de un contenedor apunta a sí mismo. Desde el navegador sí se usa `localhost` con los puertos publicados.
- [ ] Ningún secreto en `docker-compose.yml` ni en los Dockerfile. Todo llega con `env_file: .env`.
- [ ] `.env` nunca se sube a Git. `.env.example` lleva los nombres de las variables, sin valores secretos.
- [ ] No cambies la estructura `/monorepo/services/api` del contenedor de la API. `routes/` busca `packages/shared` subiendo tres niveles con `parents[3]`.
- [ ] No pongas valores reales de variables en ningún archivo, ni en la documentación ni en la respuesta.

## 3. Checklist por caso

### Dependencia de Node

- [ ] Agrégala con npm dentro de la app de `uis/` correspondiente, para que se actualicen `package.json` y `package-lock.json`.
- [ ] Verifica que el `package-lock.json` esté incluido en el commit. El Dockerfile instala con `npm ci`, que falla si no coincide con `package.json`.
- [ ] Reconstruye: `docker compose up --build`.

### Dependencia de Python

- [ ] Agrégala con uv dentro de `services/api`: `uv add nombre-del-paquete`.
- [ ] Regenera `services/api/requirements.txt`, que es lo que lee la imagen:
  ```bash
  cd services/api && uv export --format requirements-txt --no-hashes --no-dev --no-emit-project -o requirements.txt
  ```
- [ ] Reconstruye: `docker compose up --build`.

### Variable de entorno nueva

- [ ] Agrégala a `.env` con su valor real.
- [ ] Agrega solo el nombre a `.env.example`, sin valor secreto.
- [ ] Si la usa una app de `uis/` o la API, documenta en [docs/DOCKER.md](../../../docs/DOCKER.md) qué hace.
- [ ] Usa `docker compose up` y no solo `restart`, porque `restart` no vuelve a leer `.env`.

### App nueva en `uis/`

- [ ] [uis/start.sh](../../../uis/start.sh): agrega una línea que arranque la app en un puerto libre, con `-H 0.0.0.0` (o `-a 0.0.0.0` si usa http-server), igual que las otras.
- [ ] [uis/Dockerfile](../../../uis/Dockerfile): copia su `package.json` y `package-lock.json`, ejecuta `npm ci` y agrega su puerto a `EXPOSE`.
- [ ] [docker-compose.yml](../../../docker-compose.yml), servicio `uis`: agrega el puerto en `ports`, y un volumen anónimo para `node_modules`. Si la app es Next.js, agrega también un volumen anónimo para `.next`.
- [ ] Revisa [uis/.dockerignore](../../../uis/.dockerignore) para confirmar que no excluye ni incluye nada de la app por error.

### Nueva llamada a la API desde una app

- [ ] Las apps no llaman a la API directamente desde el navegador. Usan rutas relativas (`/api/...`) y un rewrite en el `next.config.ts` de la app que apunta a `${API_URL}`, igual que los rewrites que ya existen.
- [ ] En `next.config.ts`, `API_URL` se lee con `process.env.API_URL ?? "http://localhost:8000"`. Con Docker vale `http://services:8000` y viene del `.env` de la raíz.
- [ ] Revisa que el servicio `uis` sigue con `depends_on: services`.

## 4. Al terminar cualquier cambio

- [ ] Actualiza [docs/DOCKER.md](../../../docs/DOCKER.md) si cambió algo de lo que explica: servicios, puertos, pasos de primer uso, comandos, variables o la sección 5.
- [ ] Recuerda al usuario ejecutar `docker compose up --build` para comprobar el cambio. No lo ejecutes tú como parte de esta skill salvo que el usuario lo pida.
