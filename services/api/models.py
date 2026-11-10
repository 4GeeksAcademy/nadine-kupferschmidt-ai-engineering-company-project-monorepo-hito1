from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, model_validator


class Status(str, Enum):
    """Estados permitidos para un proveedor."""

    active = "active"
    suspended = "suspended"


class Country(str, Enum):
    """Países donde operan los proveedores."""

    Colombia = "Colombia"
    USA = "USA"


class Currency(str, Enum):
    """Monedas permitidas para las tarifas."""

    COP = "COP"
    USD = "USD"


class Category(str, Enum):
    """Categorías de productos que puede suministrar un proveedor."""

    carne = "carne"
    verduras_y_hortalizas = "verduras_y_hortalizas"
    salsas_y_condimentos = "salsas_y_condimentos"
    bebidas = "bebidas"
    packaging = "packaging"
    productos_limpieza = "productos_limpieza"
    lacteos = "lacteos"
    carbon_y_combustible = "carbon_y_combustible"


class SupplierCreate(BaseModel):
    """Datos que debe enviar el cliente para crear un proveedor."""

    name: str = Field(min_length=1)
    country: Country
    categories: list[Category] = Field(min_length=1)
    rate_per_unit: float = Field(gt=0)
    currency: Currency
    status: Status
    contact_email: str | None = None
    notes: str | None = None

    @model_validator(mode="after")
    def validate_currency_by_country(self) -> "SupplierCreate":
        """Rechaza monedas que no correspondan al país del proveedor."""
        expected_currency = {
            Country.Colombia: Currency.COP,
            Country.USA: Currency.USD,
        }[self.country]
        if self.currency != expected_currency:
            raise ValueError(
                f"La moneda para {self.country.value} debe ser {expected_currency.value}."
            )
        return self


class SupplierResponse(SupplierCreate):
    """Datos completos del proveedor devueltos por la API."""

    id: int
    updated_at: datetime


class RateUpdate(BaseModel):
    """Nueva tarifa para actualizar un proveedor existente."""

    rate_per_unit: float = Field(gt=0)


class StatusUpdate(BaseModel):
    """Nuevo estado para activar o suspender un proveedor."""

    status: Status


class IncidentCreate(BaseModel):
    """Datos de entrada para crear una incidencia; la validación la hace validate_incident."""

    title: str | None = None
    description: str | None = None
    category: str | None = None
    origin: str | None = None
    branch: str | None = None
    status: str | None = None


class IncidentStatusUpdate(BaseModel):
    """Nuevo estado para una incidencia; la validación la hace can_transition."""

    status: str | None = None


class Incident(BaseModel):
    """Incidencia devuelta por la API."""

    id: int
    title: str
    description: str
    category: str
    status: str
    origin: str
    branch: str
    created_at: str
    updated_at: str
