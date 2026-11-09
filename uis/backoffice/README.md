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

## Autenticación

El backoffice usa la API FastAPI de Brasaland (`services/api`) para iniciar sesión. El token JWT se guarda en `localStorage` (`access_token`) y se envía como `Authorization: Bearer <token>` en cada llamada protegida.

### Cómo correrlo
1. Levantar la API: `cd services/api && uv run uvicorn main:app --reload` (puerto 8000).
2. Levantar el backoffice: `cd uis/backoffice && npm run dev` (puerto 3000).

Las llamadas a `/api/auth/...`, `/api/users/...` y `/api/profiles/...` se reenvían a la API mediante los rewrites de `next.config.ts`.

### Vistas
| Ruta | Acceso |
|---|---|
| `/login`, `/register` | Públicas |
| `/forgot-password`, `/reset-password` | Públicas |
| `/`, `/suppliers`, `/incidencias`, `/account/profile`, `/account/change-password` | Requieren sesión |

### Piezas principales
- `lib/auth.ts`: guardar, leer y borrar el token.
- `lib/api.ts`: `apiFetch` agrega el token y, ante un 401, cierra la sesión y redirige a `/login`.
- `components/AuthGuard.tsx`: redirige a `/login` si no hay token. Se usa en `app/(authenticated)/layout.tsx`.
- `components/UserMenu.tsx` y `components/LogoutButton.tsx`: menú de usuario y cierre de sesión.
- `components/PasswordInput.tsx`: campo de contraseña con botón para mostrarla u ocultarla. Se usa en todos los formularios con contraseña.

### Recuperación y cambio de contraseña (AUTH-03)

| Página | Qué hace |
|---|---|
| `/login` | Tiene el enlace **"¿Olvidaste tu contraseña?"** hacia `/forgot-password`. Si llega con `?reset=success`, muestra que la contraseña se restableció. |
| `/forgot-password` | Pide el email y llama a `POST /auth/forgot-password`. Siempre muestra el mismo mensaje de confirmación, exista o no el email, para no revelar qué cuentas están registradas. Después de enviar, el formulario queda desactivado para evitar envíos duplicados. |
| `/reset-password` | Lee el `token` de la dirección (`?token=...`), pide la nueva contraseña y su confirmación, y llama a `POST /auth/reset-password`. Si sale bien, redirige a `/login?reset=success`. Si el enlace venció o ya se usó, muestra un error con un enlace para pedir uno nuevo. |
| `/account/change-password` | Pide la contraseña actual, la nueva y la confirmación. Comprueba que la nueva y la confirmación coincidan antes de llamar a `POST /auth/change-password`, y muestra el resultado. Se llega desde el enlace **"Cambiar contraseña"** en `/account/profile`. |

Las páginas públicas usan `fetch`; `/account/change-password` usa `apiFetch` porque necesita la sesión.

El enlace del correo apunta a la dirección configurada en `FRONTEND_URL` del `.env` de la API (ver `services/api/README.md`).