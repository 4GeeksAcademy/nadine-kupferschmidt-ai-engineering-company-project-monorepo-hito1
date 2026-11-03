# Analizador de Incidencias de Brasaland

## Qué es

Herramienta interna solicitada por el CTO para que el equipo de Operaciones valide y resuma el registro de incidentes operativos de Brasaland antes de usarlo en su dashboard. Procesa incidentes de las 14 sedes, como fallas de equipos, problemas de abastecimiento, quejas de clientes, calidad de alimentos y situaciones relacionadas con personal.

## Estructura del proyecto

- [Briefing del proyecto](./brasaland-BRIEFING.md): contexto, formato CSV, reglas de validación y resultados esperados.
- [Script de análisis](../scripts/analyze.py): interfaz de línea de comandos para procesar un CSV.
- [Paquete compartido `incidents_analysis`](../packages/incidents_analysis/): lógica de lectura, validación y cálculo de métricas.
- [API](../services/api/): servicio para analizar y exportar resultados.
- [Backoffice](../uis/backoffice/): interfaz web interna para cargar CSV y consultar el análisis.

## Ejecutar el script

Desde la raíz del repositorio, ejecuta:

```bash
python scripts/analyze.py scripts/incidents-brasaland.csv
```

El script muestra un resumen y pregunta si deseas exportar los resultados a CSV: responde `s` para crear `scripts/results.csv` o `n` para terminar sin exportar.

## API y backoffice

Para levantar la API, desde `services/api` ejecuta `uv sync` y luego `uv run uvicorn main:app --reload --port 8000`. Para iniciar el backoffice, asegúrate de que la API esté disponible en el puerto 8000; desde `uis/backoffice`, ejecuta `npm install` y `npm run dev`. Consulta el [README de la API](../services/api/README.md) y el [README del backoffice](../uis/backoffice/README.md) para más detalles.

## Lógica compartida

El script y la API usan el mismo paquete `packages/incidents_analysis` para interpretar el CSV, validar los registros y calcular las métricas. Así se mantiene una sola implementación de las reglas, sin duplicar código.

## Resultados del CSV de prueba

Con el CSV de prueba, el análisis esperado es de **100 registros en total**, **96 válidos** y **4 inválidos**. Entre los registros válidos hay 29 quejas de clientes, 17 fallas de equipos, 22 problemas de abastecimiento, 19 incidentes de calidad de alimentos y 9 relacionados con personal; el puntaje promedio de satisfacción de los casos cerrados es **3.46/5**.
