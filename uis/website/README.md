# Website

Sitio público de Brasaland (Hito 1). HTML estático servido con [http-server](https://www.npmjs.com/package/http-server).

## Con Docker

Desde la raíz del repo:

```bash
docker compose up --build
```

El sitio queda en http://localhost:3000. La guía completa está en [docs/DOCKER.md](../../docs/DOCKER.md).

## Sin Docker

1. Entra a la carpeta:

```bash
cd uis/website
```

2. Instala las dependencias:

```bash
npm install
```

3. Arranca el servidor:

```bash
npm run dev -- -p 3000
```

4. Abre http://localhost:3000.
