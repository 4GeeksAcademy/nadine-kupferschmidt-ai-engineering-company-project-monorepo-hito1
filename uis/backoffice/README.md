# Brasaland Backoffice

Aplicación interna con Next.js, App Router, TypeScript y Tailwind, sin librerías
adicionales. La página `/incidencias` permite cargar o arrastrar un CSV, analizarlo,
consultar registros inválidos, categorías, estados y satisfacción, y descargar
los resultados como CSV. La página de inicio y el menú enlazan al análisis.

## Ejecutar

Requiere Node.js compatible con Next.js 16 (20.9 o superior) y npm.
La API de FastAPI debe estar corriendo en el puerto **8000** antes de analizar.

Desde `uis/backoffice`:

```bash
npm install
npm run dev
```

Abre http://localhost:3000 e ingresa a **Análisis de incidencias**.
Si el puerto está ocupado, Next.js indicará otro puerto en la terminal.

El navegador usa exclusivamente rutas relativas `/api/incidents/...`.
El rewrite de Next.js redirige `/api/:path*` a `http://localhost:8000/api/:path*`;
no hace falta configurar CORS en el navegador para este flujo.
Reinicia Next.js si cambias la configuración del proxy.

Los mensajes de error de la API se muestran en pantalla. El último análisis
exportable se guarda en memoria en la API, es compartido entre usuarios y se
pierde al reiniciar el proceso. Las cifras se calculan exclusivamente en la API.

## Comprobaciones

```bash
npx tsc --noEmit
npm run lint
```
