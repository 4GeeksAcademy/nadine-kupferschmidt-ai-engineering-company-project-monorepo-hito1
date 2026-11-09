import sys
from collections import Counter
from pathlib import Path

from tinydb import Query

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "shared"))
sys.path.insert(0, str(ROOT / "services" / "api"))

from database import db, incidents  # noqa: E402
from incident_manager import transform_csv_row  # noqa: E402
from incidents_analysis import find_missing_columns, parse_csv_text, validate_record  # noqa: E402

DEFAULT_CSV_PATH = ROOT / "scripts" / "incidents-brasaland.csv"
seed_imports = db.table("seed_imports")


def main() -> None:
    """Carga las incidencias del CSV en la tabla incidents, sin duplicar."""
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV_PATH
    if not csv_path.is_file():
        sys.exit(f"El archivo CSV no existe: {csv_path}")

    text = csv_path.read_text(encoding="utf-8-sig")
    missing = find_missing_columns(text)
    if missing:
        sys.exit(f"Faltan columnas en el CSV: {', '.join(missing)}")

    query = Query()
    inserted = 0
    skipped = 0
    invalid: list[tuple[str, str]] = []

    for row in parse_csv_text(text):
        incident_id = (row.get("incident_id") or "").strip()
        if not incident_id:
            invalid.append(("(sin id)", "Falta incident_id"))
            continue

        errors = validate_record(row)
        if errors:
            invalid.append((incident_id, "Campos inválidos: " + ", ".join(errors)))
            continue

        record = transform_csv_row(row)
        if record is None:
            invalid.append((incident_id, "no se pudo mapear"))
            continue

        if seed_imports.contains(query.incident_id == incident_id):
            skipped += 1
            continue

        incidents.insert(record)
        seed_imports.insert({"incident_id": incident_id})
        inserted += 1

    print(f"Insertadas: {inserted}; ya existentes (saltadas): {skipped}; inválidas: {len(invalid)}.")

    if invalid:
        print("\nIncidencias inválidas:")
        for incident_id, reason in invalid:
            print(f"- {incident_id}: {reason}")

    stored = incidents.all()
    print(f"\nTotal en la tabla incidents: {len(stored)}")
    print("Por status:")
    for status, count in sorted(Counter(doc["status"] for doc in stored).items()):
        print(f"- {status}: {count}")
    print("Por category:")
    for category, count in sorted(Counter(doc["category"] for doc in stored).items()):
        print(f"- {category}: {count}")


if __name__ == "__main__":
    main()
