# Guía de diseño — Backoffice interno de Brasaland (versión 2)

Referencia visual para el backoffice interno de Brasaland. Usa estos valores exactos en los próximos prompts.

## 1. Estilo general

Moderno, limpio y profesional: fondo gris claro neutro, contenido en tarjetas blancas, el color solo donde suma.

## 2. Tipografía

- **Poppins** (Google Fonts, pesos 400, 500 y 600) para toda la interfaz.
- Logo **"Brasaland"** en **Fraunces 600** (serif), color `#D9862F`.

## 3. Colores

| Uso                                                | Valor                                                    |
| -------------------------------------------------- | -------------------------------------------------------- |
| Fondo de página                                    | `#F6F6F7`                                                |
| Superficies (navbar, menú, tarjetas, tabla)        | `#FFFFFF`                                                |
| Bordes                                             | `#ECECEF`                                                |
| Separadores entre filas                            | `#EFEFF2`                                                |
| Texto principal                                    | `#1F1F23`                                                |
| Texto secundario                                   | `#6B6B74`                                                |
| Texto de menú                                      | `#45454D`                                                |
| Acento principal (botones principales)             | Fondo `#F5B971`, texto `#2B1A06`                         |
| Acento suave (menú activo, tarjeta destacada, iniciales) | Fondo `#FCE6CC`, texto `#6E3C0B`                   |
| Éxito / Activo                                     | `#1E7B43`                                                |
| Alerta suave (tarjeta de suspendidos)              | Fondo `#FBE6E6`, texto `#6B3A3A`, número `#A61F1F`       |
| Suspendido (texto)                                 | `#A61F1F`                                                |
| Etiquetas de categoría                             | Fondo `#F1F1F4`, texto `#45454D`                         |
| Filas alternas de tablas                           | `#FFFFFF` y `#FAFAFB`                                    |
| Encabezado de tablas y fondo de buscador           | `#F6F6F7`                                                |

## 4. Componentes

### Navbar superior

Blanca, con borde inferior. Contiene:

- Logo + "Backoffice interno".
- Buscador redondeado.
- Botón de notificaciones redondo.
- Iniciales del usuario con nombre y área.

### Menú lateral

- Blanco, de **220 px como máximo**.
- Íconos SVG de trazo y textos de **14 px**.
- Ítem activo con fondo de acento suave, `rounded-[10px]` y `aria-current="page"`.

### Botones

- **Principal:** pastilla (`rounded-full`), fondo acento principal, alto mínimo **44 px**.
- **Secundario:** pastilla blanca con borde `#ECECEF`.

### Tarjetas

- Fondo blanco, borde `#ECECEF`, `rounded-[18px]`, padding **20 px**.

### Tarjetas de resumen (KPI)

- Etiqueta de **13 px** en texto secundario.
- Número de **30 px**, peso **600**.

### Filtros por país

- Pestañas tipo pastilla dentro de un contenedor `#F3F3F5`.
- La pestaña seleccionada lleva fondo `#1F1F23` y texto blanco.

### Tablas

- Dentro de una tarjeta `rounded-[20px]`.
- Encabezado de **12 px** en texto secundario.
- Filas alternas.
- Números alineados a la derecha con `tabular-nums`.

### Estado

- Switch: verde `#1E7B43` cuando está activo y gris `#D4D4DA` cuando está suspendido.
- Texto "Activo" o "Suspendido" al lado del switch.

### Íconos

- SVG de trazo (`stroke` 2), **nunca emojis**.

## 5. Reglas

- Solo clases de Tailwind, sin CSS propio, salvo los colores registrados en `globals.css`.
- Mantener la accesibilidad:
  - Textos con contraste **4.5:1**.
  - `aria-label` en botones con solo ícono.
  - Áreas de clic de al menos **44 px**.
