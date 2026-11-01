from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from tinydb.table import Document

from database import suppliers
from models import (
    Category,
    Country,
    RateUpdate,
    StatusUpdate,
    SupplierCreate,
    SupplierResponse,
)

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


def document_to_supplier(doc: Document) -> SupplierResponse:
    """Convierte un documento de TinyDB al modelo de respuesta."""
    return SupplierResponse(id=doc.doc_id, **dict(doc))


@router.post("", response_model=SupplierResponse, status_code=201)
def create_supplier(supplier: SupplierCreate) -> SupplierResponse:
    """Crea un proveedor con su fecha de actualización."""
    record = supplier.model_dump(mode="json")
    record["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc_id = suppliers.insert(record)
    return document_to_supplier(suppliers.get(doc_id=doc_id))


@router.get("", response_model=list[SupplierResponse])
def list_suppliers(
    country: Country | None = None,
    category: Category | None = None,
) -> list[SupplierResponse]:
    """Lista proveedores aplicando los filtros opcionales."""
    documents = suppliers.all()

    if country is not None:
        documents = [doc for doc in documents if doc["country"] == country.value]
    if category is not None:
        documents = [
            doc for doc in documents if category.value in doc["categories"]
        ]

    return [document_to_supplier(doc) for doc in documents]


@router.get("/{id}", response_model=SupplierResponse)
def get_supplier(id: int) -> SupplierResponse:
    """Obtiene un proveedor por su identificador."""
    doc = suppliers.get(doc_id=id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado.")
    return document_to_supplier(doc)


@router.patch("/{id}/rate", response_model=SupplierResponse)
def update_supplier_rate(id: int, update: RateUpdate) -> SupplierResponse:
    """Actualiza la tarifa y su fecha de modificación."""
    doc = suppliers.get(doc_id=id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

    suppliers.update(
        {
            "rate_per_unit": update.rate_per_unit,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        doc_ids=[id],
    )
    return document_to_supplier(suppliers.get(doc_id=id))


@router.patch("/{id}/status", response_model=SupplierResponse)
def update_supplier_status(id: int, update: StatusUpdate) -> SupplierResponse:
    """Actualiza solo el estado del proveedor."""
    doc = suppliers.get(doc_id=id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

    suppliers.update(
        {"status": update.model_dump(mode="json")["status"]},
        doc_ids=[id],
    )
    return document_to_supplier(suppliers.get(doc_id=id))


@router.delete("/{id}")
def delete_supplier(id: int) -> dict[str, str]:
    """Elimina el proveedor indicado."""
    doc = suppliers.get(doc_id=id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

    suppliers.remove(doc_ids=[id])
    return {"message": "Proveedor eliminado correctamente."}
