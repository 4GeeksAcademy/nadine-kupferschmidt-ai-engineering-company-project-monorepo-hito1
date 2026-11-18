from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


def _utc_now() -> datetime:
    """Devuelve la fecha y hora actual en UTC."""
    return datetime.now(timezone.utc)


class Ingredient(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    # SKU único e indexado para búsquedas rápidas
    sku: str = Field(unique=True, index=True)
    # "kg", "litro" o "unidad"
    unit: str
    # "meat", "produce", "sauce", "beverage", "packaging" o "cleaning"
    category: str
    # "CO" o "US"
    country: str

    # El stock no se guarda: se calcula sumando entradas y restando salidas
    entries: list["IngredientEntry"] = Relationship(back_populates="ingredient")
    exits: list["IngredientExit"] = Relationship(back_populates="ingredient")


class IngredientEntry(SQLModel, table=True):
    """Entrega de un proveedor que suma stock."""

    id: int | None = Field(default=None, primary_key=True)
    ingredient_id: int = Field(foreign_key="ingredient.id")
    quantity: float
    supplier_name: str
    # Local de 1 a 14; no es clave foránea
    location_id: int
    created_at: datetime = Field(default_factory=_utc_now)
    # UUID del usuario de TinyDB; no es clave foránea
    user_uuid: str

    # lazy="selectin" carga todos los ingredientes de una lista en una sola consulta (evita N+1)
    ingredient: Ingredient | None = Relationship(
        back_populates="entries",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class IngredientExit(SQLModel, table=True):
    """Consumo o merma que resta stock."""

    id: int | None = Field(default=None, primary_key=True)
    ingredient_id: int = Field(foreign_key="ingredient.id")
    quantity: float
    # "consumption" o "waste"
    reason: str
    # Local de 1 a 14; no es clave foránea
    location_id: int
    created_at: datetime = Field(default_factory=_utc_now)
    # UUID del usuario de TinyDB; no es clave foránea
    user_uuid: str

    # lazy="selectin" carga todos los ingredientes de una lista en una sola consulta (evita N+1)
    ingredient: Ingredient | None = Relationship(
        back_populates="exits",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
