# PROMPT — Landing Page (index.html) — Brasaland

## Instrucción principal

Vas a construir `index.html`, la landing page pública de Brasaland. Toda la información de contenido (textos, nombres, cifras, horarios, datos de contacto, estructura de secciones) debe tomarse **exacta y literalmente** del `CONTEXT.md` del proyecto, que ya tienes disponible en el repositorio. No agregues información que no esté en el CONTEXT.md, no quites nada de lo que pide, y no parafrasees ni "mejores" los textos que ya están escritos ahí — cópialos tal cual. Si necesitas un dato que el CONTEXT.md no provee, no lo inventes: usa un placeholder claro (ej. `[PENDIENTE]`) en vez de rellenar con contenido genérico.

No es un ejercicio de creatividad de contenido: es un ejercicio de fidelidad. La landing debe reflejar exactamente lo que Brasaland es y ofrece según el documento, ni más ni menos.

## Qué debe incluir (todo definido en el CONTEXT.md)

Toma del CONTEXT.md, en el orden que ahí se especifica:
- Header (nombre de la empresa, navegación, selector de idioma si aplica)
- Sección Hero (titular, subtítulo, call to action)
- Sección "Nuestra Historia"
- Sección "Lo que nos hace únicos" (las tres columnas)
- Sección "Nuestras Ubicaciones" (las dos columnas, con horarios y cantidad de restaurantes por país)
- Sección "Brasa Points" destacada
- Sección de Contacto (email y teléfonos)
- Footer

No modifiques el orden de las secciones ni el contenido textual de cada una — usa exactamente lo que indica el CONTEXT.md.

## Requisitos técnicos (de la consigna del bootcamp, sección Landing Page)

- HTML5 semántico: usar `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` en lugar de `<div>` genéricos.
- Header con logo/nombre de la empresa y navegación clara.
- Sección hero que explique qué hace la empresa y por qué elegirla.
- Al menos dos secciones adicionales destacando características o beneficios (basadas en lo que dice el CONTEXT.md, no inventadas).
- Footer profesional con información de contacto.
- Un enlace o botón visible que dirija al formulario de aplicación/registro (`application.html`).
- Estilos exclusivamente con clases utilitarias de Tailwind CSS — evitar CSS personalizado salvo que sea absolutamente necesario (y en ese caso, solo en `styles.css`).
- Diseño responsive con breakpoints `sm:`, `md:`, `lg:` de Tailwind, mobile-first.
- Todas las imágenes con atributos `alt` descriptivos.
- Atributos ARIA donde sea apropiado (`aria-label`, `role`, etc.).
- Marcado Schema.org con la información de la empresa, usando exactamente los datos del CONTEXT.md (tipo `Restaurant`, con los campos de dirección, teléfono, `sameAs`, etc. tal como están especificados ahí). Si el sitio se entrega en un solo idioma, ajustar `availableLanguage` a ese único idioma.
- El proyecto debe poder ejecutarse localmente con un comando `npx` compatible con Codespaces (ej. `npx http-server . -p 3000 -a 0.0.0.0`).
- El sitio debe poder exponerse en una URL pública de Codespaces (port forwarding → Public) para poder auditarse desde fuera.

## Restricciones de idioma

Usar el idioma base ya definido para el proyecto en todo el sitio, sin mezclar idiomas. Si se implementa un segundo idioma, debe ser una capa adicional (selector ES|EN) que no reduzca la completitud del idioma base.

## Criterios de evaluación que debe cumplir

- HTML semántico correcto y jerárquico, sin `<div>` innecesarios.
- Todas las imágenes con `alt` descriptivo.
- Schema.org presente y correctamente implementado.
- Completamente responsive (móvil, tablet, escritorio), mobile-first.
- 100% de los estilos en clases utilitarias de Tailwind, breakpoints usados apropiadamente, sin CSS innecesario.
- Diseño visualmente coherente y profesional.
- Rendimiento ≥ 80 en PageSpeed Insights / Lighthouse (ideal >90).
- Elementos interactivos accesibles por teclado, ARIA usado donde mejora la accesibilidad, contraste de color adecuado, navegación lógica y predecible.
- El contenido refleja fielmente el tipo de empresa y sector especificado en el CONTEXT.md, presentando su experiencia y ventajas competitivas sin desviarse del texto fuente.

## Dirección visual

Aplicar la siguiente dirección de arte a la implementación de estas secciones (esto sí es dirección de estilo, no de contenido — el contenido sigue siendo el del CONTEXT.md):

- Estética elegante, cálida, sofisticada, gastronómica, editorial, artesanal, moderna sin ser excesivamente tecnológica, premium pero accesible. El sitio debe sentirse como una revista gastronómica contemporánea, no como una plantilla genérica de restaurante.
- Composición editorial con protagonismo visual: alternar fotografías full-width, secciones de fondo claro, composiciones a dos columnas, bloques de imágenes, espacios amplios. Ritmo dinámico (imagen → espacio en blanco → contenido → imagen → espacio en blanco → contenido). Evitar que todas las secciones tengan la misma estructura; permitir asimetría sutil.
- Fotografía como elemento protagonista (no decorativo): temática de carne a la brasa, fuego, parrilla, humo, ingredientes, platos, ambiente del restaurante. Imágenes cálidas, oscuras, contrastadas y apetitosas, grandes, nunca pequeñas dentro de tarjetas.
- Paleta de colores: blanco cálido/marfil, beige, crema, carbón, negro, marrón oscuro, tonos tierra, con dorado/ocre cálido como acento sutil (solo en detalles, títulos decorativos, líneas o elementos destacados). Evitar colores saturados y evitar la estética típica "roja" de restaurante.
- Alternar fondos claros (blanco, marfil, crema) para contenido con fondos oscuros (negro carbón, marrón muy oscuro, fotografías oscuras) para dar contraste y profundidad. El footer puede llevar el tono más oscuro de toda la página.
- Tipografía: combinación sans-serif (limpia, moderna, ligera — navegación, textos, botones, títulos principales) + serif elegante (decorativa, en palabras o partes destacadas de títulos). Títulos en mayúsculas, con buen letter-spacing, pesos moderados, jerarquía clara. No abusar de la tipografía decorativa.
- Espacio en blanco generoso: padding y márgenes amplios, separación clara entre elementos, line-height cómodo, espacio alrededor de fotografías.
- Elementos UI simples, elegantes y discretos: botones rectangulares o ligeramente redondeados, tipografía limpia, colores sólidos. Evitar botones muy grandes, sombras fuertes, gradientes, bordes muy redondeados, tarjetas genéricas y efectos visuales innecesarios.
- Sensación de marca a transmitir: fuego + sabor + calidad + calidez + tradición + elegancia.
- Responsive mobile-first, pero manteniendo la misma dirección artística que en desktop: conservar jerarquía visual, protagonismo fotográfico, espacio en blanco, elegancia y contraste entre secciones claras/oscuras — no una versión reducida del desktop.

## Recordatorio final

El contenido textual, los datos y la estructura de secciones vienen del CONTEXT.md y deben copiarse exactamente. La dirección visual de arriba define cómo se ve, no qué dice. No mezclar ambas cosas ni dejar que el estilo visual te lleve a alterar el texto fuente.
