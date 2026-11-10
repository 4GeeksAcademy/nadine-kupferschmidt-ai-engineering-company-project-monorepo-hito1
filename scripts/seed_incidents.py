import csv
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
        print(f"Error: el archivo CSV no existe: {csv_path.name}", file=sys.stderr)
        sys.exit(1)

    try:
        text = csv_path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError:
        print(f"Error: el archivo {csv_path.name} no está en UTF-8.", file=sys.stderr)
        sys.exit(1)
    except OSError:
        print(f"Error: no se pudo leer el archivo {csv_path.name}.", file=sys.stderr)
        sys.exit(1)

    if not text.strip():
        print(f"Error: el archivo {csv_path.name} está vacío.", file=sys.stderr)
        sys.exit(1)

    missing = find_missing_columns(text)
    if missing:
        print(f"Error: faltan columnas en {csv_path.name}: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    try:
        rows = parse_csv_text(text)
    except csv.Error:
        print(f"Error: el archivo {csv_path.name} no tiene un formato CSV válido.", file=sys.stderr)
        sys.exit(1)

    query = Query()
    inserted = 0
    skipped = 0
    invalid: list[tuple[int, str, str]] = []

    for line_number, row in enumerate(rows, start=2):
        incident_id = (row.get("incident_id") or "").strip()
        if not incident_id:
            invalid.append((line_number, "(sin id)", "Falta incident_id"))
            continue

        errors = validate_record(row)
        if errors:
            invalid.append((line_number, incident_id, "Campos inválidos: " + ", ".join(errors)))
            continue

        record = transform_csv_row(row)
        if record is None:
            invalid.append((line_number, incident_id, "no se pudo mapear"))
            continue

        if seed_imports.contains(query.incident_id == incident_id):
            skipped += 1
            continue

        incidents.insert(record)
        seed_imports.insert({"incident_id": incident_id})
        inserted += 1

    print(f"Insertadas: {inserted}; ya existentes (saltadas): {skipped}; inválidas: {len(invalid)}.")

    stored = incidents.all()
    print(f"\nTotal en la tabla incidents: {len(stored)}")
    print("Por status:")
    for status, count in sorted(Counter(doc["status"] for doc in stored).items()):
        print(f"- {status}: {count}")
    print("Por category:")
    for category, count in sorted(Counter(doc["category"] for doc in stored).items()):
        print(f"- {category}: {count}")

    if invalid:
        print("Filas omitidas:", file=sys.stderr)
        for line_number, incident_id, reason in invalid:
            print(f"- Fila {line_number} ({incident_id}): {reason}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
