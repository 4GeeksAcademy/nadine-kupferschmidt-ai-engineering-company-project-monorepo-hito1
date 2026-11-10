# incident_manager

Paquete con la lógica de dominio para la gestión centralizada de incidencias. Proporciona constantes, validación y reglas de transición de estados.

## Módulos

### `constants.py`

Define todas las constantes del dominio:

- **Estados**: `open`, `in_progress`, `resolved`, `closed`
- **Prioridades**: `low`, `medium`, `high`, `critical`
- **Orígenes**: `web`, `api`, `manual`, `automated`
- **Ramas**: `main`, `develop`, `staging`, `production`
- **Categorías**: `bug`, `feature`, `improvement`, `documentation`, `infrastructure`, `security`

### `validation.py`

Funciones de validación y reglas de dominio:

- `validate_incident(data)`: valida un diccionario de incidencia. Devuelve `(is_valid, errors)` donde `errors` es una lista de violaciones de reglas.
- `can_transition(current_status, new_status)`: valida si una transición de estado es permitida según las reglas del workflow.

### `csv_mapping.py`

Funciones para transformar datos CSV:

- `transform_csv_row(row)`: convierte una fila CSV en un diccionario de incidencia con los campos normalizados.

## Uso

Importar desde el paquete:

```python
from packages.shared.incident_manager import (
    STATUSES, PRIORITIES, ORIGINS, BRANCHES, CATEGORIES,
    validate_incident, can_transition, transform_csv_row
)
```

### Ejemplo: validar una nueva incidencia

```python
data = {
    'title': 'Fix login bug',
    'description': 'Users cannot login with OAuth',
    'status': 'open',
    'origin': 'web',
    'branch': 'main',
    'category': 'bug',
    'priority': 'high'
}

is_valid, errors = validate_incident(data)
if is_valid:
    # crear la incidencia en la BD
else:
    # mostrar errores al usuario
    for error in errors:
        print(f"- {error['rule']}: {error['detail']}")
```

### Ejemplo: cambiar el estado

```python
if can_transition('open', 'in_progress'):
    # actualizar incidencia en la BD
else:
    # transición no permitida
```

## Consumidores

- `services/api/routes/incident_manager.py`: endpoints del gestor de incidencias
- `scripts/seed_incidents.py`: validación de datos importados desde CSV
- `uis/backoffice/app/(authenticated)/gestor-incidencias/`: formularios y lógica del panel
