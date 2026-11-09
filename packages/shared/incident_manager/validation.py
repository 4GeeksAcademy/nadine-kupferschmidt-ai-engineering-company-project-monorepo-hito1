from .constants import ALLOWED_TRANSITIONS, BRANCHES, CATEGORIES, ORIGINS, STATUSES


def _is_blank(value: object) -> bool:
    return not isinstance(value, str) or not value.strip()


def _check_choice(
    data: dict,
    field: str,
    allowed: list[str] | dict[str, str],
    required_message: str,
    invalid_message: str,
) -> dict | None:
    value = data.get(field)
    if _is_blank(value):
        return {"field": field, "message": required_message}
    if value not in allowed:
        return {"field": field, "message": invalid_message}
    return None


def validate_incident(data: dict) -> list[dict]:
    errors = []

    for field, message in (
        ("title", "El título es obligatorio."),
        ("description", "La descripción es obligatoria."),
    ):
        if _is_blank(data.get(field)):
            errors.append({"field": field, "message": message})

    checks = (
        ("category", CATEGORIES, "La categoría es obligatoria.", "La categoría no es válida."),
        ("origin", ORIGINS, "El origen es obligatorio.", "El origen no es válido."),
        ("branch", BRANCHES, "La sede es obligatoria.", "La sede no es válida."),
    )
    for field, allowed, required_message, invalid_message in checks:
        error = _check_choice(data, field, allowed, required_message, invalid_message)
        if error:
            errors.append(error)

    if data.get("status") is not None and data["status"] not in STATUSES:
        errors.append({"field": "status", "message": "El estado no es válido."})

    return errors


def can_transition(current: str, new: str) -> bool:
    return new in ALLOWED_TRANSITIONS.get(current, [])
