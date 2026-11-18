from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ============================================================================
# Ingredient (Ingrediente)
# ============================================================================


class IngredientCreate(BaseModel):
    """Datos para crear un ingrediente (POST /inventory/products)."""

    name: str = Field(min_length=1)
    sku: str = Field(min_length=1)
    unit: Literal["kg", "litro", "unidad"]
    category: Literal["meat", "produce", "sauce", "beverage", "packaging", "cleaning"]
    country: Literal["CO", "US"]


class IngredientRead(BaseModel):
    """Ingrediente devuelto por la API con stock calculado."""

    id: int
    name: str
    sku: str
    unit: str
    category: str
    country: str
    # El stock se calcula sumando entradas y restando salidas; no existe en la tabla
    current_stock: float


# ============================================================================
# IngredientEntry (Entradas de Ingredientes)
# ============================================================================


class IngredientEntryCreate(BaseModel):
    """Datos para registrar una entrega de proveedor (POST /inventory/orders/inbound)."""

    ingredient_id: int
    quantity: float = Field(gt=0)
    supplier_name: str = Field(min_length=1)
    location_id: int = Field(ge=1, le=14)


class IngredientEntryRead(BaseModel):
    """Entrada de ingrediente devuelta por la API."""

    id: int
    ingredient_id: int
    quantity: float
    supplier_name: str
    location_id: int
    created_at: datetime
    user_uuid: str


# ============================================================================
# IngredientExit (Salidas de Ingredientes)
# ============================================================================


class IngredientExitCreate(BaseModel):
    """Datos para registrar un consumo o merma (POST /inventory/orders/outbound)."""

    ingredient_id: int
    quantity: float = Field(gt=0)
    reason: Literal["consumption", "waste"]
    location_id: int = Field(ge=1, le=14)


class IngredientExitRead(BaseModel):
    """Salida de ingrediente devuelta por la API."""

    id: int
    ingredient_id: int
    quantity: float
    reason: str
    location_id: int
    created_at: datetime
    user_uuid: str


# ============================================================================
# Order (Órdenes mixtas de entrada y salida)
# ============================================================================


class OrderRead(BaseModel):
    """Orden de entrada o salida devuelta por GET /inventory/orders.
    
    Mezcla datos de IngredientEntry e IngredientExit con información
    del ingrediente asociado.
    """

    id: int
    order_type: Literal["inbound", "outbound"]
    ingredient_id: int
    ingredient_name: str
    ingredient_sku: str
    unit: str
    quantity: float
    location_id: int
    supplier_name: str | None  # Solo en inbound
    reason: str | None  # Solo en outbound
    user_uuid: str
    created_at: datetime
