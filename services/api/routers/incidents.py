import csv
import io
import sys
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response


sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "packages"))

from incidents_analysis import (
    INVALID_RULES,
    build_export_rows,
    calculate_metrics,
    find_missing_columns,
    parse_csv_text,
)


router = APIRouter(prefix="/api/incidents", tags=["incidents"])
last_analysis: Optional[dict[str, object]] = None


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)) -> dict[str, object]:
    global last_analysis

    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe terminar en .csv.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="El archivo est\u00e1 vac\u00edo.")

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400, detail="El archivo debe ser texto con codificaci\u00f3n UTF-8."
        ) from None

    if not text.strip():
        raise HTTPException(status_code=400, detail="El archivo est\u00e1 vac\u00edo.")

    try:
        missing_columns = find_missing_columns(text)
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas del CSV: {', '.join(missing_columns)}.",
            )
        records = parse_csv_text(text)
    except csv.Error:
        raise HTTPException(status_code=400, detail="El archivo CSV no es v\u00e1lido.") from None

    if not records:
        raise HTTPException(status_code=400, detail="El archivo CSV no contiene registros.")

    metrics = calculate_metrics(records)
    last_analysis = metrics
    return {
        "metrics": metrics,
        "invalid_rules": [
            {"code": code, "label": label} for code, label in INVALID_RULES
        ],
    }


@router.get("/results/export")
def export_results() -> Response:
    if last_analysis is None:
        raise HTTPException(
            status_code=404, detail="Todav\u00eda no hay ning\u00fan an\u00e1lisis para exportar."
        )

    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(("metric", "value", "percentage"))
    writer.writerows(build_export_rows(last_analysis))
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="results.csv"'},
    )