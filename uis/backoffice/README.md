# Brasaland Backoffice

Aplicación interna con Next.js, App Router, TypeScript y Tailwind, sin librerías
adicionales. El menú lateral enlaza a cuatro módulos:

- `/incidencias` (Operaciones): permite cargar o arrastrar un CSV, analizarlo,
  consultar registros inválidos, categorías, estados y satisfacción, y descargar
  los resultados como CSV.
- **Gestor de Incidencias** (Operaciones): registro de nuevas incidencias, visualización en panel con filtros (estado, origen, rama, categoría), cambio de estado de incidencias y resumen estadístico.
- `/suppliers` (Compras, **Directorio de proveedores**): listado de proveedores,
  filtros por país y categoría, registro de proveedores, edición de tarifa,
  activar/suspender y eliminar con confirmación.
- `/inventory/products` (Operaciones, **Inventario de ingredientes**): stock actual de cada ingrediente, registro de entradas y salidas, y el historial de órdenes.

El diseño sigue la guía [`prompts/brasaland-backoffice-design-guide.md`](../../prompts/brasaland-backoffice-design-guide.md).

## Gestor de Incidencias

El módulo de Gestor de Incidencias permite registrar, consultar y gestionar el ciclo de vida de las incidencias de la empresa.

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/gestor-incidencias` | Panel principal con listado de incidencias, filtros y vista de detalles. |
| `/gestor-incidencias/nueva` | Formulario para registrar una nueva incidencia (título, descripción, estado, origen, rama, categoría, prioridad). |
| `/gestor-incidencias/resumen` | Resumen estadístico con gráficos: incidencias por estado, origen, rama y categoría. |

### Funcionalidades

- **Registrar**: crear una incidencia con todos los campos del dominio.
- **Listar y filtrar**: ver todas las incidencias con búsqueda por estado, origen, rama o categoría.
- **Ver detalles**: abrir una incidencia individual para consultar todos sus datos.
- **Cambiar estado**: actualizar el estado de una incidencia (transiciones validadas según las reglas del dominio).
- **Resumen**: visualizar estadísticas agregadas de incidencias.

Todas las operaciones requieren sesión autenticada.

## Inventario de ingredientes

El módulo de inventario permite registrar entradas y salidas de ingredientes y consultar su stock. El stock no se edita: la API lo calcula como suma de entradas menos suma de salidas.

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/inventory/products` | Tabla de ingredientes con stock actual, nivel de stock y botones para registrar entradas y salidas. |
| `/inventory/orders/inbound` | Formulario para registrar una entrada: entrega de ingredientes recibida de un proveedor. |
| `/inventory/orders/outbound` | Formulario para registrar una salida (consumo o merma), con el stock disponible en vivo. |
| `/inventory/orders` | Historial de entradas y salidas, de la más reciente a la más antigua. Solo lectura. |

### Piezas principales

- `lib/inventory.ts`: único módulo que llama a la API de inventario. Usa `apiFetch`, así que agrega el token y redirige a `/login` ante un 401. Si la respuesta no es correcta, lanza `InventoryApiError`, con `message` (texto para mostrar) y `status` (código HTTP).
- `types/inventory.ts`: tipos de ingredientes, entradas, salidas y órdenes que devuelve la API.
- `app/(authenticated)/inventory/constants.ts`: etiquetas, unidades, `formatQuantity`, locales y umbrales de stock.
- `app/(authenticated)/inventory/StockIndicator.tsx`: círculo de color del nivel de stock y `LEVEL_LEGEND`, la leyenda que se muestra sobre la tabla.

### Decisiones

- **Umbrales por unidad.** El nivel de stock depende de la unidad del ingrediente, porque 10 kg de carne no equivalen a 10 cajas para llevar. El stock es "Bajo" si es menor o igual al primer valor, "Atención" si es menor o igual al segundo, y "Bien" en otro caso.

| Unidad | Bajo (hasta) | Atención (hasta) |
|--------|--------------|------------------|
| kg | 10 | 25 |
| litro | 5 | 15 |
| unidad | 50 | 150 |

- **Indicador.** El nivel se muestra con un círculo de color (rojo para Bajo, ámbar para Atención, verde para Bien) y una leyenda sobre la tabla. El círculo tiene `title` para ver el nombre del nivel al pasar el mouse, y un texto oculto (`sr-only`) para lectores de pantalla.
- **Locales.** Se muestran como "Local 1" a "Local 14" (`LOCATION_IDS`). El briefing solo define los números, no los nombres de las sedes.
- **Stock en vivo en salidas.** El formulario de salida consulta el stock del ingrediente elegido y muestra una advertencia si la cantidad lo supera. La advertencia no bloquea el envío, porque la regla real la aplica la API. Si el usuario cambia de ingrediente antes de que llegue la respuesta anterior, se descarta esa respuesta vieja.
- **Errores.** Un 400 por stock insuficiente se muestra debajo de la cantidad con el texto exacto de la API. Ese texto está en inglés porque así lo exige el briefing del backend. Los errores 422 y 5xx se convierten en mensajes en español.
- **Suspense.** Los formularios usan `useSearchParams` (para `?ingredient={id}`) dentro de `<Suspense>`, porque el proyecto tiene `cacheComponents` activado.

## Ejecutar

Requiere Node.js compatible con Next.js 16 (20.9 o superior) y npm.
La API central (`services/api`) debe estar corriendo en el puerto **8000**.

Desde `uis/backoffice`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

La variable `NEXT_PUBLIC_INVENTORY_API_URL` indica la URL base de la API de inventario, sin barra final. Si no está definida, se usa `http://localhost:8000`. Como `next.config.ts` la lee al cargar la configuración, reinicia `npm run dev` después de cambiarla.

Abre http://localhost:3000 y elige una página en el menú.
Si el puerto está ocupado, Next.js indicará otro puerto en la terminal.

## Conexión con la API (rewrites)

El navegador usa solo rutas relativas que empiezan con `/api`. Los rewrites de
`next.config.ts` las envían a la API:

| Ruta en el navegador | Destino |
|----------------------|---------|
| `/api/suppliers` y `/api/suppliers/:path*` | `http://localhost:8000/suppliers` y `http://localhost:8000/suppliers/:path*` |
| `/api/inventory/:path*` | `{NEXT_PUBLIC_INVENTORY_API_URL}/inventory/:path*` (por defecto, `http://localhost:8000/inventory/:path*`) |
| `/api/:path*` (por ejemplo, incidencias) | `http://localhost:8000/api/:path*` |

Los rewrites de proveedores e inventario van antes de `/api/:path*` porque Next.js usa el primero que coincide.
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
| `/inventory/products`, `/inventory/orders`, `/inventory/orders/inbound`, `/inventory/orders/outbound` | Requieren sesión |

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

## Problemas conocidos

Pendientes de módulos anteriores al de inventario, para resolver en otra rama:

- Error de lint `react-hooks/set-state-in-effect` en `components/AuthGuard.tsx`.
- Warnings de lint en `app/(authenticated)/gestor-incidencias/resumen/page.tsx`, `lib/api.ts` y la carpeta `coverage/`.
- Actualización de seguridad de Next.js de 16.4.3 a 16.4.6.
- `next build` muestra un aviso por dos `package-lock.json`.
