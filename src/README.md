# Brasaland — Hito 2: Utilidades de procesamiento de datos

Funciones TypeScript para el sistema de operaciones de Brasaland (14 locales en Colombia y Florida): filtrar, ordenar, buscar, calcular métricas financieras, puntuar locales y validar datos. Incluye una página interna con Tailwind para usar todas las funciones.

El contexto completo de este hito está en [`CONTEXT.md`](./CONTEXT.md).

## Estructura

```
src/
├── CONTEXT.md             Contexto del Hito 2
├── README.md              Este archivo
├── types/
│   └── models.ts          Interfaces y tipos (MenuItem, SaleTransaction, Location, WasteRecord, CountryMetrics)
├── utils/
│   ├── collections.ts     Filtros y ordenamientos
│   ├── search.ts          Búsqueda lineal y binaria
│   ├── transformations.ts Cálculos financieros, puntaje de locales y reportes
│   └── validations.ts     Validaciones de negocio
├── tests.ts               Pruebas
├── browser-entry.ts       Datos de ejemplo y conexión de las funciones con la página
├── bundle.js              Código armado para el navegador (se genera con npm run build)
├── index.html             Panel interno de Brasaland
└── icon.svg               Favicon
```

## Antes de empezar: instalar Node en Codespaces

Si al correr `npm` aparece `npm: command not found`, el Codespace no tiene Node. Para instalarlo:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
```

Después, desde la raíz del repositorio:

```bash
npm install
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run typecheck` | Revisa los tipos de TypeScript sin generar archivos |
| `npm test` | Corre las pruebas de `src/tests.ts` |
| `npm run build` | Arma `src/bundle.js` a partir de `src/browser-entry.ts` |
| `npm start` | Levanta la página en el puerto 3000 |

Para ver la página: `npm run build` y después `npm start`. En Codespaces, abrí el puerto **3000** desde la pestaña **Ports**.

## La página

| Sección | Qué permite hacer |
|---|---|
| Dashboard | Resumen: mejor local, ubicaciones activas, ítem más vendido, métodos de pago, ranking y comparación Colombia vs USA |
| Ubicaciones | Filtrar por país y estado, ordenar por capacidad, buscar por ID (búsqueda lineal) y por capacidad exacta (búsqueda binaria) |
| Menú | Filtrar por categoría, ordenar por precio en USD o COP y buscar un ítem por nombre |
| Ventas | Ingreso del día según la zona horaria del local, ventas por rango de fechas con ticket promedio, y conversor de moneda |
| Reportes | Margen y desperdicio por local, ranking de performance, ítems más vendidos, ventas extremas, desperdicio por razón e ingresos extremos |
| Validaciones | Probar si un ítem, una venta o una locación cumplen las reglas de negocio |

## Decisiones técnicas

- **Funciones puras:** `scoreLocationPerformance` y `rankLocationsByPerformance` reciben la fecha como parámetro (`referenceDate`), y `validateLocation` recibe el año (`currentYear`). Así no dependen del reloj de la computadora y siempre dan el mismo resultado con los mismos datos. Quien las llama, como la página o las pruebas, decide la fecha.
- **Zonas horarias:** `calculateDailyRevenue` recibe la zona horaria del local (`timeZone`) y compara los días con `toLocaleDateString`. `getTimeZoneByCountry` devuelve `America/Bogota` para Colombia y `America/New_York` para Florida. Las fechas de los datos de ejemplo incluyen su diferencia horaria (`-05:00` o `-04:00`).
- **Valores nulos:** todas las funciones aceptan `null` en sus listas y objetos principales y devuelven una respuesta segura: `[]`, `null`, `-1`, `0` o un resultado de validación con error.
- **Sin mutaciones:** los ordenamientos copian la lista antes de ordenarla.
- **Moneda:** tasa fija de 1 USD = 4000 COP, como indica el contexto.
- **Página:** usa solo Tailwind (por CDN), sin CSS propio, con el mismo sistema de diseño que el Hito 3.