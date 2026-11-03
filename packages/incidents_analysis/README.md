# incidents_analysis

Paquete para interpretar CSV de incidencias de Brasaland, validar registros y calcular métricas reutilizables desde una API.

Funciones disponibles:

- `parse_csv_text(text)`: convierte texto CSV en registros.
- `validate_record(record)`: devuelve las reglas de invalidez de un registro.
- `calculate_metrics(records)`: calcula métricas de los registros.
- `build_export_rows(metrics)`: construye filas para exportación con las columnas `metric`, `value` y `percentage`.
