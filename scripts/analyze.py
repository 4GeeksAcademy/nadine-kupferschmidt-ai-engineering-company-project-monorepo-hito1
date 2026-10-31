import csv
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "packages"))

from incidents_analysis import (
    CATEGORIES,
    INVALID_RULES,
    STATUSES,
    build_export_rows,
    calculate_metrics,
    parse_csv_text,
)


def read_arguments(argv: List[str]) -> Tuple[Optional[Path], Optional[str]]:
    if len(argv) < 2:
        return None, "Falta la ruta del archivo CSV. Uso: python scripts/analyze.py <archivo-csv>"

    csv_path = Path(argv[1])
    if not csv_path.is_file():
        return None, f"El archivo CSV no existe o no es un archivo: {csv_path}"

    return csv_path, None


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
    with output_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(("metric", "value", "percentage"))
        writer.writerows(build_export_rows(metrics))


def main() -> None:
    csv_path, argument_error = read_arguments(sys.argv)
    if argument_error:
        print(f"Error: {argument_error}")
        return

    try:
        with csv_path.open("r", encoding="utf-8", newline="") as csv_file:
            records = parse_csv_text(csv_file.read())
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
