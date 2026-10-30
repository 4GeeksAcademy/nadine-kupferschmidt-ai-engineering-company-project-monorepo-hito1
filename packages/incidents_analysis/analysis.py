import csv
import io
from collections import Counter
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


def parse_csv_text(text: str) -> List[Dict[str, Optional[str]]]:
    return list(csv.DictReader(io.StringIO(text)))


def find_missing_columns(text: str) -> List[str]:
    expected_columns = (
        "incident_id",
        "date",
        "location_id",
        "category",
        "description",
        "status",
        "customer_id",
        "satisfaction_score",
        "reporter_id",
    )
    columns = csv.DictReader(io.StringIO(text)).fieldnames or []
    return [column for column in expected_columns if column not in columns]


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


def build_export_rows(metrics: Dict[str, object]) -> List[Tuple[str, object, str]]:
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

    return rows


def _percentage(value: int, denominator: int) -> str:
    return f"{value / denominator * 100:.1f}" if denominator else "0.0"
