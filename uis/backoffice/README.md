# Brasaland Backoffice

Aplicación interna con Next.js, App Router, TypeScript y Tailwind, sin librerías
adicionales. El menú lateral enlaza a dos páginas:

- `/incidencias` (Operaciones): permite cargar o arrastrar un CSV, analizarlo,
  consultar registros inválidos, categorías, estados y satisfacción, y descargar
  los resultados como CSV.
- `/suppliers` (Compras, **Directorio de proveedores**): listado de proveedores,
  filtros por país y categoría, registro de proveedores, edición de tarifa,
  activar/suspender y eliminar con confirmación.

El diseño sigue la guía [`prompts/brasaland-backoffice-design-guide.md`](../../prompts/brasaland-backoffice-design-guide.md).

## Ejecutar

Requiere Node.js compatible con Next.js 16 (20.9 o superior) y npm.
La API central (`services/api`) debe estar corriendo en el puerto **8000**.

Desde `uis/backoffice`:

```bash
npm install
npm run dev
```

Abre http://localhost:3000 y elige una página en el menú.
Si el puerto está ocupado, Next.js indicará otro puerto en la terminal.

## Conexión con la API (rewrites)

El navegador usa solo rutas relativas que empiezan con `/api`. Los rewrites de
`next.config.ts` las envían a la API:

| Ruta en el navegador | Destino |
|----------------------|---------|
| `/api/suppliers` y `/api/suppliers/:path*` | `http://localhost:8000/suppliers` y `http://localhost:8000/suppliers/:path*` |
| `/api/:path*` (por ejemplo, incidencias) | `http://localhost:8000/api/:path*` |

Los rewrites de proveedores van primero porque Next.js usa el primero que coincide.
No hace falta configurar CORS en el navegador. Reinicia Next.js si cambias esta configuración.

Los mensajes de error de la API se muestran en pantalla. El último análisis
exportable se guarda en memoria en la API, es compartido entre usuarios y se
pierde al reiniciar el proceso. Las cifras se calculan exclusivamente en la API.

## Consejo: cambios de colores que no se ven

Si cambias colores en `app/globals.css` y no se ven en el navegador:

1. Apaga el servidor (`Ctrl + C`).
2. Borra la carpeta `.next`.
3. Vuelve a ejecutar `npm run dev`.

## Comprobaciones

```bash
npx tsc --noEmit
npm run lint
```
