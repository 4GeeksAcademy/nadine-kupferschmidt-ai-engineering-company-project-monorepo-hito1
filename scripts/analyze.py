import csv
import sys
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Tuple


CATEGORIES = (
    "CUSTOMER_COMPLAINT",
    "EQUIPMENT",
    "SUPPLY",
    "FOOD_QUALITY",
    "STAFF",
)
STATUSES = ("OPEN", "CLOSED", "DISCARDED")
LOCATION_IDS = {f"COL-{number:02d}" for number in range(1, 11)} | {
    f"FLA-{number:02d}" for number in range(1, 5)
}
INVALID_RULES = (
    ("location_id", "Falta location_id"),
    ("category", "Categoría inválida o vacía"),
    ("description", "Descripción vacía"),
    ("reporter_id", "Falta reporter_id"),
    ("closed_without_score", "Caso cerrado sin puntaje"),
    ("score_out_of_range", "Puntaje fuera de rango"),
    ("status", "Estado no válido o faltante"),
)


def read_arguments(argv: List[str]) -> Tuple[Optional[Path], Optional[str]]:
    if len(argv) < 2:
        return None, "Falta la ruta del archivo CSV. Uso: python scripts/analyze.py <archivo-csv>"

    csv_path = Path(argv[1])
    if not csv_path.is_file():
        return None, f"El archivo CSV no existe o no es un archivo: {csv_path}"

    return csv_path, None


def load_csv(csv_path: Path) -> List[Dict[str, Optional[str]]]:
    with csv_path.open("r", encoding="utf-8", newline="") as csv_file:
        return list(csv.DictReader(csv_file))


def validate_record(record: Dict[str, Optional[str]]) -> List[str]:
    def value(field: str) -> str:
        return (record.get(field) or "").strip()

    errors = []
    location_id = value("location_id")
    category = value("category")
    description = value("description")
    reporter_id = value("reporter_id")
    status = value("status")
    score = value("satisfaction_score")

    if location_id not in LOCATION_IDS:
        errors.append("location_id")
    if category not in CATEGORIES:
        errors.append("category")
    if len(description) < 5:
        errors.append("description")
    if not reporter_id:
        errors.append("reporter_id")
    if status not in STATUSES:
        errors.append("status")

    if status == "CLOSED" and not score:
        errors.append("closed_without_score")
    if score:
        try:
            numeric_score = int(score)
        except ValueError:
            errors.append("score_out_of_range")
        else:
            if numeric_score < 1 or numeric_score > 5:
                errors.append("score_out_of_range")

    return errors


def calculate_metrics(records: List[Dict[str, Optional[str]]]) -> Dict[str, object]:
    invalid_counts = Counter({rule: 0 for rule, _ in INVALID_RULES})
    valid_records = []

    for record in records:
        errors = validate_record(record)
        if errors:
            invalid_counts.update(errors)
        else:
            valid_records.append(record)

    category_counts = Counter((record.get("category") or "").strip() for record in valid_records)
    status_counts = Counter((record.get("status") or "").strip() for record in valid_records)
    closed_records = [
        record for record in valid_records if (record.get("status") or "").strip() == "CLOSED"
    ]
    satisfaction_scores = [
        int((record.get("satisfaction_score") or "").strip())
        for record in closed_records
        if (record.get("satisfaction_score") or "").strip()
    ]
    score_counts = Counter(satisfaction_scores)

    def percentages(counts: Counter, denominator: int, labels: Tuple[str, ...]) -> Dict[str, float]:
        return {
            label: (counts[label] / denominator * 100 if denominator else 0.0)
            for label in labels
        }

    average_score = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0.0
    return {
        "total": len(records),
        "valid": len(valid_records),
        "invalid": len(records) - len(valid_records),
        "invalid_counts": dict(invalid_counts),
        "category_counts": {category: category_counts[category] for category in CATEGORIES},
        "category_percentages": percentages(category_counts, len(valid_records), CATEGORIES),
        "status_counts": {status: status_counts[status] for status in STATUSES},
        "status_percentages": percentages(status_counts, len(valid_records), STATUSES),
        "closed_cases": len(closed_records),
        "scored_cases": len(satisfaction_scores),
        "average_score": average_score,
        "score_counts": {score: score_counts[score] for score in range(1, 6)},
    }


def format_breakdown(
    label: str,
    count: int,
    percentage: Optional[float] = None,
    branch: str = "├─",
) -> str:
    dots = "." * max(0, 31 - len(label) - 1)
    line = f"  {branch} {label} {dots} {count:>2}"
    if percentage is not None:
        line += f"  ({percentage:.1f}%)"
    return line


def print_summary(metrics: Dict[str, object], source_file: str) -> None:
    print("=" * 60)
    print("  BRASALAND — ANÁLISIS DE INFORMES DE INCIDENTES")
    print(f"  Archivo fuente: {source_file}")
    print("=" * 60)
    print()
    print(f"TOTAL DE REGISTROS ............ {metrics['total']}")
    print(f"  ├─ Registros válidos ............. {metrics['valid']}")
    print(f"  └─ Inválidos / incompletos ....... {metrics['invalid']}")
    print()
    print("DESGLOSE DE REGISTROS INVÁLIDOS")
    for index, (rule, label) in enumerate(INVALID_RULES):
        branch = "└─" if index == len(INVALID_RULES) - 1 else "├─"
        print(format_breakdown(label, metrics["invalid_counts"][rule], branch=branch))
    print()
    print("DESGLOSE POR CATEGORÍA (registros válidos)")
    for index, category in enumerate(CATEGORIES):
        branch = "└─" if index == len(CATEGORIES) - 1 else "├─"
        print(
            format_breakdown(
                category,
                metrics["category_counts"][category],
                metrics["category_percentages"][category],
                branch,
            )
        )
    print()
    print("DESGLOSE POR ESTADO (registros válidos)")
    for index, status in enumerate(STATUSES):
        branch = "└─" if index == len(STATUSES) - 1 else "├─"
        print(
            format_breakdown(
                status,
                metrics["status_counts"][status],
                metrics["status_percentages"][status],
                branch,
            )
        )
    print()
    print("ÍNDICE DE SATISFACCIÓN (casos CLOSED)")
    print(f"  Casos con puntaje: {metrics['scored_cases']} de {metrics['closed_cases']}")
    print(f"  Puntaje promedio: {metrics['average_score']:.2f} / 5.00")
    score_labels = (
        "Muy insatisfecho",
        "Insatisfecho",
        "Neutral",
        "Satisfecho",
        "Muy satisfecho",
    )
    for score, label in enumerate(score_labels, start=1):
        branch = "└─" if score == len(score_labels) else "├─"
        print(format_breakdown(f"Puntaje {score} ({label})", metrics["score_counts"][score], branch=branch))
    print()
    print("=" * 60)


def export_to_csv(metrics: Dict[str, object], output_path: Path) -> None:
    rows = [
        ("total_records", metrics["total"], ""),
        ("valid_records", metrics["valid"], _percentage(metrics["valid"], metrics["total"])),
        ("invalid_records", metrics["invalid"], _percentage(metrics["invalid"], metrics["total"])),
    ]
    for rule, label in INVALID_RULES:
        rows.append((f"invalid_{rule}", metrics["invalid_counts"][rule], ""))
    for category in CATEGORIES:
        rows.append(
            (
                f"category_{category}",
                metrics["category_counts"][category],
                f"{metrics['category_percentages'][category]:.1f}",
            )
        )
    for status in STATUSES:
        rows.append(
            (
                f"status_{status}",
                metrics["status_counts"][status],
                f"{metrics['status_percentages'][status]:.1f}",
            )
        )
    rows.extend(
        [
            ("closed_cases", metrics["closed_cases"], ""),
            ("scored_cases", metrics["scored_cases"], ""),
            ("average_satisfaction_score", f"{metrics['average_score']:.2f}", ""),
        ]
    )
    for score in range(1, 6):
        rows.append(
            (
                f"satisfaction_score_{score}",
                metrics["score_counts"][score],
                _percentage(metrics["score_counts"][score], metrics["scored_cases"]),
            )
        )

    with output_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(("metric", "value", "percentage"))
        writer.writerows(rows)


def _percentage(value: int, denominator: int) -> str:
    return f"{value / denominator * 100:.1f}" if denominator else "0.0"


def main() -> None:
    csv_path, argument_error = read_arguments(sys.argv)
    if argument_error:
        print(f"Error: {argument_error}")
        return

    try:
        records = load_csv(csv_path)
    except (OSError, UnicodeError, csv.Error) as error:
        print(f"Error al leer el archivo CSV: {error}")
        return

    metrics = calculate_metrics(records)
    print_summary(metrics, csv_path.name)

    if input("¿Deseas exportar los resultados a CSV? [s / n]: ").strip().lower() == "s":
        output_path = Path(__file__).resolve().with_name("results.csv")
        try:
            export_to_csv(metrics, output_path)
        except OSError as error:
            print(f"Error al exportar los resultados a CSV: {error}")
        else:
            print(f"Resultados exportados a {output_path}")


if __name__ == "__main__":
    main()
