# Talent Pipeline Tracker · Brasaland

Herramienta interna del equipo de **People & Talent de Brasaland** para gestionar las candidaturas del proceso de selección de **Asistente de Dirección** (sede corporativa, Medellín).

Reemplaza la hoja de cálculo compartida que usaba el equipo: permite ver todas las candidaturas de un vistazo, filtrarlas, acceder al detalle de cada una, actualizar su estado y etapa, y registrar notas internas después de cada llamada o entrevista.

## Funcionalidades

- **Listado de candidaturas** con nombre, puesto, estado y etapa, y contador de resultados.
- **Filtros por estado y etapa** y **búsqueda por nombre o email**, guardados en la URL (se pueden compartir o recargar sin perderlos).
- **Detalle de candidatura** con todos sus datos: email, teléfono, puesto, LinkedIn, CV, años de experiencia, estado, etapa y fecha de postulación.
- **Cambio de estado y etapa** desde el detalle, con una sola interacción.
- **Notas internas**: listar, agregar y eliminar (con ventana de confirmación).
- **Registro de nuevas candidaturas** y **edición de datos**, con validación de campos obligatorios.
- **Estados de carga, éxito y error** visibles en todas las operaciones con la API.

## Tecnologías

- [Next.js](https://nextjs.org/) (App Router)
- React
- TypeScript
- Tailwind CSS

No se usan librerías externas de gestión de estado: el estado se maneja con hooks de React a nivel de componente.

## Cómo correr el proyecto

1. Entra a la carpeta del proyecto:

```bash
   cd uis/talent-pipeline-tracker
```

2. Instala las dependencias:

```bash
   npm install
```

3. Crea el archivo `.env.local` a partir del ejemplo:

```bash
   cp .env.example .env.local
```

4. Arranca el servidor de desarrollo:

```bash
   npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API del tracker: `https://playground.4geeks.com/tracker/api/v1` |

## Estructura del proyecto

```
app/
├── page.tsx                  → Listado de candidaturas (/)
├── layout.tsx                → Estructura común: header, footer, colores y tipografía
├── icon.svg                  → Favicon de Brasaland
└── candidates/
    ├── [id]/page.tsx         → Detalle de una candidatura
    └── new/page.tsx          → Registro de nueva candidatura
components/                   → Componentes de la interfaz (tabla, filtros, formulario, notas…)
hooks/                        → Hooks que obtienen datos de la API y manejan los estados de carga y error
lib/
├── api.ts                    → Todas las llamadas a la API
└── labels.ts                 → Etiquetas y colores de estados y etapas
types/
└── candidate.ts              → Tipos TypeScript de los datos de la API
```

## Decisiones tomadas

- **Etiquetas legibles en toda la interfaz.** Los valores de la API (`in_progress`, `personal_interview`…) nunca se muestran. Se traducen en un único lugar (`lib/labels.ts`) a las etiquetas definidas por Brasaland ("En proceso", "Entrevista personal"…).
- **Filtros delegados a la API.** La API ya permite filtrar por `status`, `stage` y `search`, así que la app lee los filtros de la URL y se los pasa directamente.
- **Listado de 15 con opción "Ver todas".** Se obtienen hasta 100 candidaturas y se muestran 15 al principio para que el listado sea más fácil de recorrer.
- **Las notas se recargan después de agregar o eliminar.** Así la interfaz siempre muestra lo que realmente está guardado en la API.
- **No se pueden eliminar candidaturas.** En un proceso de selección, una candidatura que no sigue se marca como "Descartada" en lugar de borrarse: se conserva el historial y se evita perder datos por error (uno de los problemas que motivó esta herramienta).
- **Estado y etapa son independientes.** La etapa indica hasta dónde llegó la persona y el estado cómo está. Por ejemplo, "Descartada" en "Entrevista técnica" significa que se la descartó en esa etapa. La interfaz no bloquea combinaciones para dar flexibilidad al equipo.
- **Íconos dibujados con SVG.** No se instalaron librerías de íconos para mantener el proyecto solo con Next.js, React y TypeScript.

## Nota sobre la API

La API es compartida por todos los estudiantes del curso y se reinicia periódicamente a sus datos originales, por lo que los cambios de prueba pueden desaparecer con el tiempo.
