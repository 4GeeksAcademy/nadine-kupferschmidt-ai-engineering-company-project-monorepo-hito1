from datetime import datetime, timezone


STATUS_MAP = {
    "OPEN": "open",
    "CLOSED": "resolved",
    "DISCARDED": "discarded",
}

CATEGORY_MAP = {
    "CUSTOMER_COMPLAINT": "customer_complaint",
    "EQUIPMENT": "equipment_failure",
    "SUPPLY": "supply_issue",
    "FOOD_QUALITY": "customer_complaint",
    "STAFF": "staff_issue",
}

LOCATION_TO_BRANCH = {
    "COL-01": "medellin_centro",
    "COL-02": "medellin_laureles",
    "COL-03": "medellin_envigado",
    "COL-04": "medellin_bello",
    "COL-05": "medellin_itagui",
    "COL-06": "bogota_chapinero",
    "COL-07": "bogota_usaquen",
    "COL-08": "cali_granada",
    "COL-09": "barranquilla_norte",
    "COL-10": "central",
    "FLA-01": "miami_doral",
    "FLA-02": "miami_hialeah",
    "FLA-03": "miami_kendall",
    "FLA-04": "orlando_international",
}


def transform_csv_row(row: dict) -> dict | None:
    description = row.get("description") or ""
    title = description[:120].strip()
    if not title:
        return None

    status = STATUS_MAP.get((row.get("status") or "").strip())
    category = CATEGORY_MAP.get((row.get("category") or "").strip())
    if status is None or category is None:
        return None

    try:
        created = datetime.strptime((row.get("date") or "").strip(), "%Y-%m-%d")
    except ValueError:
        return None
    created_at = created.replace(tzinfo=timezone.utc).isoformat()

    branch = LOCATION_TO_BRANCH.get((row.get("location_id") or "").strip(), "central")

    return {
        "title": title,
        "description": description,
        "status": status,
        "category": category,
        "branch": branch,
        "origin": "customer",
        "created_at": created_at,
        "updated_at": created_at,
    }
