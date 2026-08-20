# PROMPT — Formulario de Aplicación/Registro (application.html + validation.js) — Brasaland

## Instrucción principal

Vas a construir `application.html` (el formulario de registro del programa de fidelización Brasa Points) y `validation.js` (su lógica de validación). Todos los campos, opciones, valores de dominio, reglas de validación, mensajes de error y mensaje de éxito deben tomarse **exacta y literalmente** del `CONTEXT.md` del proyecto, que ya tienes disponible en el repositorio. No agregues campos ni opciones que no estén ahí, no quites ninguno de los que pide, y no reformules los textos de mensajes de error o del mensaje de éxito — cópialos tal cual, palabra por palabra. Si algo no está definido explícitamente en el CONTEXT.md, no lo inventes: márcalo como `[PENDIENTE]` en vez de rellenar con un valor genérico.

Este formulario es específico del dominio de Brasaland: no es un formulario de reservas ni de pedidos en línea, es exclusivamente para el registro al programa Brasa Points.

## Campos del formulario (tomar exactamente del CONTEXT.md)

Implementa los 11 campos especificados en el CONTEXT.md, con su tipo, obligatoriedad y validación exactos: nombre completo, email, teléfono, país, ciudad, ubicación favorita, preferencias alimentarias, cómo nos conociste, fecha de nacimiento, aceptación de términos del programa, y suscripción opcional a ofertas por email.

Para cada campo, usar el tipo de input HTML apropiado según lo indicado (text, email, tel, select, checkbox, date), y respetar exactamente cuáles son obligatorios y cuáles no, tal como los define el CONTEXT.md.

## Lógica de campos dependientes (tomar exactamente del CONTEXT.md)

- El campo Ciudad debe poblarse dinámicamente según el País seleccionado, con las opciones exactas que define el CONTEXT.md para cada país.
- El campo Ubicación favorita debe poblarse dinámicamente según la combinación de País + Ciudad seleccionados, con la lista exacta de restaurantes que el CONTEXT.md asigna a cada ciudad — sin agregar ni quitar ninguna sede de la lista.

## Mensajes de error y mensaje de éxito

Usar exactamente los mensajes de error definidos en el CONTEXT.md para cada validación fallida (nombre completo, email, teléfono, país, ciudad, cómo nos conociste, fecha de nacimiento, términos del programa), sin cambiar una palabra.

Usar exactamente el mensaje de éxito definido en el CONTEXT.md cuando el formulario se valide correctamente (simulación de envío, sin conexión real a backend).

## Restricción específica de negocio

Incluir, de forma visible en la página, el aviso exacto que indica el CONTEXT.md: "¿Quieres hacer un pedido? Llama a tu ubicación favorita o visítanos directamente. ¡Pronto tendremos pedidos en línea!" — este formulario es solo para el programa de fidelización, no para pedidos.

## Requisitos técnicos (de la consigna del bootcamp, sección Formulario)

- Crear `application.html` con un formulario estructurado.
- Incluir exactamente los campos especificados en el CONTEXT.md, ni más ni menos.
- Usar tipos de input apropiados para cada campo (email, tel, date, checkbox, select, etc.).
- Cada input debe tener un `<label>` correctamente asociado mediante el atributo `for`.
- Agrupar campos relacionados usando `<fieldset>` y `<legend>` donde sea apropiado.
- Marcar los campos obligatorios con el atributo `required`, exactamente los que el CONTEXT.md indica como obligatorios.
- Diseño responsive del formulario, mobile-first.
- Estilos del formulario con Tailwind CSS (espaciado, tamaños, estados de foco) — sin CSS personalizado salvo necesidad real.
- Botón de envío y botón secundario para limpiar el formulario.
- Crear `validation.js` que valide todos los campos del formulario según las reglas del CONTEXT.md.
- Validación en tiempo real (mientras el usuario escribe o al perder el foco).
- Mostrar los mensajes de error específicos definidos en el CONTEXT.md para cada tipo de validación fallida.
- Estilizar los mensajes de error de forma clara y visible.
- Prevenir el envío del formulario mientras existan errores de validación.
- Mostrar el mensaje de éxito exacto del CONTEXT.md cuando la validación sea correcta (envío simulado).

## Criterios de evaluación que debe cumplir

- Todos los campos especificados en el CONTEXT.md están presentes, con los nombres, tipos y opciones exactos.
- La validación con JavaScript funciona correctamente para cada campo.
- Los mensajes de error son los específicos del CONTEXT.md (no genéricos tipo "campo inválido").
- La validación previene efectivamente el envío de datos incorrectos.
- Los estados visuales del formulario son claros (foco, error, éxito).
- El botón de limpiar formulario funciona correctamente.
- `<label>` correctamente asociados con sus inputs mediante `for`.
- Los campos del formulario coinciden exactamente con los requeridos en el CONTEXT.md.
- Cualquier regla de validación específica del dominio (formato de teléfono con código de país, mayoría de edad, checkbox de términos obligatorio, dependencia país→ciudad→ubicación) está implementada tal como se especifica.
- Elementos interactivos accesibles por teclado; mensajes de error anunciados de forma accesible.

## Dirección visual

Aplicar la siguiente dirección de arte a la implementación visual del formulario (esto define cómo se ve, no qué campos, opciones o textos contiene — esos vienen del CONTEXT.md):

- Estética elegante, cálida, sofisticada, gastronómica, editorial, artesanal, moderna sin ser excesivamente tecnológica, premium pero accesible.
- Paleta de colores: blanco cálido/marfil, beige, crema, carbón, negro, marrón oscuro, tonos tierra, con dorado/ocre cálido como acento sutil (por ejemplo, en estados de foco, líneas divisorias entre grupos de campos, o el botón principal). Evitar colores saturados y la estética típica "roja" de restaurante.
- Tipografía: combinación sans-serif limpia y moderna (para labels, inputs, botones, mensajes) con algún acento en serif elegante reservado para el título del formulario o encabezados de sección, sin abusar de lo decorativo.
- Espacio en blanco generoso entre grupos de campos; el formulario debe sentirse ordenado y respirado, no denso.
- Elementos UI simples, elegantes y discretos: inputs y botones rectangulares o ligeramente redondeados, sin sombras fuertes, gradientes ni bordes muy redondeados. Estados de foco visibles pero sutiles, coherentes con el acento dorado/ocre de la marca.
- Mensajes de error visibles y claros, pero integrados con la estética general (sin colores estridentes fuera de la paleta funcional necesaria para indicar error).
- Responsive mobile-first, manteniendo la misma elegancia y jerarquía visual que en desktop.

## Recordatorio final

Los campos, opciones, textos de error y mensaje de éxito vienen del CONTEXT.md y deben copiarse exactamente, sin agregar, quitar ni reformular nada. La dirección visual de arriba define únicamente el estilo del formulario, no su contenido ni su estructura de datos.