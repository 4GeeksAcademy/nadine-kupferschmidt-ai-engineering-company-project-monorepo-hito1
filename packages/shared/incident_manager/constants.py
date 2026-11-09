BRANCHES = {
    "central": "Central (Medellín / Miami)",
    "medellin_centro": "Medellín Centro",
    "medellin_laureles": "Medellín Laureles",
    "medellin_envigado": "Medellín Envigado",
    "medellin_bello": "Medellín Bello",
    "medellin_itagui": "Medellín Itagüí",
    "bogota_chapinero": "Bogotá Chapinero",
    "bogota_usaquen": "Bogotá Usaquén",
    "cali_granada": "Cali Granada",
    "barranquilla_norte": "Barranquilla Norte",
    "miami_doral": "Miami Doral",
    "miami_hialeah": "Miami Hialeah",
    "miami_kendall": "Miami Kendall",
    "orlando_international": "Orlando International Drive",
    "fort_lauderdale": "Fort Lauderdale",
}

CATEGORIES = [
    "equipment_failure",
    "supply_issue",
    "customer_complaint",
    "staff_issue",
    "facility_issue",
    "pos_system",
    "delivery_issue",
    "other",
]

STATUSES = ["open", "in_progress", "resolved", "discarded"]

STATUS_LABELS = {
    "open": "Abierta",
    "in_progress": "En curso",
    "resolved": "Resuelta",
    "discarded": "Descartada",
}

ORIGINS = ["customer", "branch", "internal"]

ALLOWED_TRANSITIONS = {
    "open": ["in_progress", "discarded"],
    "in_progress": ["resolved", "discarded"],
    "resolved": [],
    "discarded": [],
}
