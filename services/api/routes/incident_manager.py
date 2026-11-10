import sys
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from database import incidents
from models import Incident, IncidentCreate, IncidentStatusUpdate

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "packages" / "shared"))

from incident_manager import (
    BRANCHES,
    CATEGORIES,
    ORIGINS,
    STATUS_LABELS,
    STATUSES,
    can_transition,
    validate_incident,
)


router = APIRouter(prefix="/api/incidents", tags=["incident-manager"])

FILTER_RULES = {
    "status": (STATUSES, "El estado no es válido."),
    "origin": (ORIGINS, "El origen no es válido."),
    "branch": (BRANCHES, "La sede no es válida."),
    "category": (CATEGORIES, "La categoría no es válida."),
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_incident(doc) -> dict:
    return {"id": doc.doc_id, **doc}


def _find(incident_id: str) -> dict | None:
    try:
        doc_id = int(incident_id)
    except ValueError:
        return None
    doc = incidents.get(doc_id=doc_id)
    return None if doc is None else _to_incident(doc)


def _bad_request(errors: list[dict]) -> JSONResponse:
    first = errors[0]
    return JSONResponse(
        status_code=400,
        content={"field": first["field"], "message": first["message"], "errors": errors},
    )


def _not_found() -> JSONResponse:
    return JSONResponse(status_code=404, content={"message": "La incidencia no existe."})


def _count_by(items: list, field: str, allowed) -> dict[str, int]:
    counts = dict.fromkeys(allowed, 0)
    for item in items:
        if item.get(field) in counts:
            counts[item[field]] += 1
    return counts


@router.get("/summary")
def get_summary() -> dict:
    items = incidents.all()
    return {
        "total": len(items),
        "by_status": _count_by(items, "status", STATUSES),
        "by_category": _count_by(items, "category", CATEGORIES),
        "by_origin": _count_by(items, "origin", ORIGINS),
        "by_branch": _count_by(items, "branch", BRANCHES),
    }


@router.get("", response_model=list[Incident])
def list_incidents(
    status: str | None = None,
    origin: str | None = None,
    branch: str | None = None,
    category: str | None = None,
):
    filters = {"status": status, "origin": origin, "branch": branch, "category": category}

    errors = []
    for field, value in filters.items():
        if value is not None and value not in FILTER_RULES[field][0]:
            errors.append({"field": field, "message": FILTER_RULES[field][1]})
    if errors:
        return _bad_request(errors)

    items = [
        _to_incident(doc)
        for doc in incidents.all()
        if all(value is None or doc[field] == value for field, value in filters.items())
    ]
    items.sort(
        key=lambda item: (datetime.fromisoformat(item["created_at"]), item["id"]),
        reverse=True,
    )
    return items


@router.post("", status_code=201, response_model=Incident)
def create_incident(payload: IncidentCreate):
    data = payload.model_dump()
    if data["status"] is None:
        data["status"] = "open"

    errors = validate_incident(data)
    if errors:
        return _bad_request(errors)

    now = _now()
    record = {
        "title": data["title"],
        "description": data["description"],
        "category": data["category"],
        "status": data["status"],
        "origin": data["origin"],
        "branch": data["branch"],
        "created_at": now,
        "updated_at": now,
    }
    doc_id = incidents.insert(record)
    return {"id": doc_id, **record}


@router.get("/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    incident = _find(incident_id)
    if incident is None:
        return _not_found()
    return incident


@router.patch("/{incident_id}/status", response_model=Incident)
def update_incident_status(incident_id: str, payload: IncidentStatusUpdate):
    incident = _find(incident_id)
    if incident is None:
        return _not_found()

    new_status = payload.status
    if new_status is None:
        return _bad_request([{"field": "status", "message": "El estado es obligatorio."}])
    if new_status not in STATUSES:
        return _bad_request([{"field": "status", "message": "El estado no es válido."}])

    current = incident["status"]
    if not can_transition(current, new_status):
        message = f"No se puede pasar de {STATUS_LABELS[current]} a {STATUS_LABELS[new_status]}."
        return _bad_request([{"field": "status", "message": message}])

    now = _now()
    incidents.update({"status": new_status, "updated_at": now}, doc_ids=[incident["id"]])
    incident.update(status=new_status, updated_at=now)
    return incident
