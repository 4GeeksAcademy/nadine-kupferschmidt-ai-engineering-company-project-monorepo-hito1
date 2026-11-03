# Guía de diseño — Brasaland

Guía visual común para los proyectos frontend de Brasaland (Hito 2, Hito 3, Backoffice).

## 1. Paleta de colores

| Nombre                     | Hex     | Clase Tailwind  | Para qué se usa                                                  |
| -------------------------- | ------- | --------------- | ---------------------------------------------------------------- |
| Ivory (marfil)             | #FDF8F0 | brand-ivory     | Fondo del favicon y hover de las filas de tabla                  |
| Beige                      | #F5EDE0 | brand-beige     | Bordes de tarjetas, header, footer, inputs y botones secundarios |
| Charcoal (carbón)          | #2A2A2A | brand-charcoal  | Texto principal                                                  |
| Dark brown (marrón oscuro) | #1A1410 | brand-darkbrown | Títulos, enlaces y texto de los botones naranjas                 |
| Ochre (naranja)            | #F2A65A | brand-ochre     | Acento principal: logo, botones principales, hover de enlaces    |
| Warm gray (gris cálido)    | #6B6258 | brand-warmgray  | Texto secundario: subtítulos, labels, fechas                     |

Fondos: la página en `bg-gray-50`; header, footer y tarjetas en `bg-white`; encabezado de tablas en `bg-gray-200`.

## 2. Cómo registrar los colores

En Next.js con Tailwind (`app/globals.css`):

```css
@import "tailwindcss";

@theme {
  --color-brand-ivory: #fdf8f0;
  --color-brand-beige: #f5ede0;
  --color-brand-charcoal: #2a2a2a;
  --color-brand-darkbrown: #1a1410;
  --color-brand-ochre: #f2a65a;
  --color-brand-warmgray: #6b6258;
}
```

Y en el `<body>` del `layout.tsx`: `bg-gray-50 text-brand-charcoal`.

En HTML con Tailwind por CDN (como el Hito 2):

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          brand: {
            ivory: "#FDF8F0",
            beige: "#F5EDE0",
            charcoal: "#2A2A2A",
            darkbrown: "#1A1410",
            ochre: "#F2A65A",
            warmgray: "#6B6258",
          },
        },
        fontFamily: { sans: ["Geist", "sans-serif"] },
      },
    },
  };
</script>
```

## 3. Tipografía

Geist para todo, y serif solo en el logo. En Next.js viene incluida. En HTML se carga desde Google Fonts con un `<link>` en el `<head>`.

## 4. Logo

No es una imagen: es texto con estilo.

```html
<span class="font-serif text-xl font-semibold tracking-wide text-brand-ochre"
  >Brasaland</span
>
```

Al lado o debajo va el nombre del área, en `text-sm text-brand-warmgray`: "People & Talent" en el Hito 3, "Operaciones" en el Hito 2 y en el Backoffice de incidencias. En React se escribe `className` en lugar de `class`.

El logo puede quedar en naranja aunque tenga poco contraste, porque las pautas de accesibilidad excluyen los logos.

## 5. Favicon (la "B")

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#FDF8F0"/><text x="32" y="47" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="600" fill="#F2A65A">B</text></svg>
```

- Next.js: guardalo como `app/icon.svg` y borrá `app/favicon.ico`. Next lo toma solo.
- HTML: guardalo como `icon.svg` y agregá `<link rel="icon" type="image/svg+xml" href="icon.svg">` en el `<head>`.

## 6. Pastillas de estado

Base: `inline-block rounded-full border px-2 py-0 text-xs font-medium`, más el color:

| Significado          | Clases                             | Ejemplo                   |
| -------------------- | ---------------------------------- | ------------------------- |
| Nuevo / informativo  | border-blue-600 text-blue-700      | Recibida                  |
| En movimiento        | border-brand-ochre text-orange-700 | En proceso, En renovación |
| Éxito                | border-green-600 text-green-700    | Seleccionada, Activa      |
| Negativo / terminado | border-red-600 text-red-700        | Descartada, Cerrada temp. |

En "En movimiento" la letra va en `text-orange-700`, no en el naranja de la marca, para que se lea bien.

## 7. Botones

Base: `rounded px-4 py-2 text-sm`, más el color:

| Tipo                                 | Clases                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Principal                            | bg-brand-ochre text-brand-darkbrown hover:opacity-90                             |
| Principal suave (versión del Hito 2) | bg-brand-ochre/80 text-brand-darkbrown hover:bg-brand-ochre                      |
| Secundario                           | border border-brand-beige bg-white text-brand-darkbrown hover:border-brand-ochre |
| Peligro (eliminar)                   | bg-red-600 text-white                                                            |

## 8. Otros elementos

| Elemento           | Clases                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Tarjetas           | rounded-md border border-brand-beige bg-white p-6                 |
| Títulos de página  | text-2xl font-semibold text-brand-darkbrown                       |
| Títulos de sección | text-sm font-semibold uppercase tracking-wide text-brand-warmgray |
| Labels             | text-sm text-brand-warmgray                                       |
| Inputs y selects   | rounded border border-brand-beige bg-white px-3 py-2              |
| Enlaces            | text-brand-darkbrown underline hover:text-brand-ochre             |
| Mensaje de éxito   | text-sm text-green-700                                            |
| Mensaje de error   | text-sm text-red-600                                              |

**Regla general:** solo clases de Tailwind, sin CSS propio ni atributos `style`.
