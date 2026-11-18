from itertools import cycle

from sqlmodel import Session, select

from auth.database import users
from inventory.database import create_db_and_tables, engine
from inventory.models import Ingredient, IngredientEntry, IngredientExit


INGREDIENTS_SEED = [
    {"name": "Falda de ternera", "sku": "BRS-BEEF-001", "unit": "kg", "category": "meat", "country": "CO"},
    {"name": "Costilla de cerdo", "sku": "BRS-PORK-001", "unit": "kg", "category": "meat", "country": "US"},
    {"name": "Chimichurri", "sku": "BRS-SAUCE-001", "unit": "litro", "category": "sauce", "country": "CO"},
    {"name": "Salsa BBQ de la casa", "sku": "BRS-SAUCE-002", "unit": "litro", "category": "sauce", "country": "US"},
    {"name": "Yuca", "sku": "BRS-PROD-001", "unit": "kg", "category": "produce", "country": "CO"},
    {"name": "Caja para llevar (M)", "sku": "BRS-PKG-001", "unit": "unidad", "category": "packaging", "country": "CO"},
]

# (sku, quantity, supplier_name, location_id)
ENTRIES_SEED = [
    ("BRS-BEEF-001", 50, "Carnes del Valle S.A.", 1),
    ("BRS-BEEF-001", 30, "Carnes del Valle S.A.", 2),
    ("BRS-PORK-001", 40, "MiamiMeat Co.", 10),
    ("BRS-SAUCE-001", 20, "Salsas Artesanales Ltda.", 1),
]

# (sku, quantity, reason, location_id)
EXITS_SEED = [
    ("BRS-BEEF-001", 25, "consumption", 1),
    ("BRS-BEEF-001", 3, "waste", 2),
    ("BRS-PORK-001", 15, "consumption", 10),
    ("BRS-SAUCE-001", 5, "consumption", 1),
]


def main() -> None:
    """Carga ingredientes, entradas y salidas de ejemplo en Supabase."""
    create_db_and_tables()

    # Reparte las órdenes entre los 2 primeros usuarios registrados en TinyDB
    registered = users.all()
    if not registered:
        print("No hay usuarios registrados. Registra uno primero y vuelve a ejecutar el seed.")
        return
    user_uuids = cycle([user["id"] for user in registered[:2]])

    with Session(engine) as session:
        # Evita duplicar datos si el inventario ya tiene ingredientes
        if session.exec(select(Ingredient)).first() is not None:
            print("El inventario ya tiene datos; no se cargaron semillas.")
            return

        session.add_all([Ingredient(**data) for data in INGREDIENTS_SEED])
        # flush asigna los id sin cerrar la transacción
        session.flush()

        # Busca el id de cada ingrediente por su SKU
        ids_by_sku = {
            ingredient.sku: ingredient.id
            for ingredient in session.exec(select(Ingredient)).all()
        }

        # Las entradas se crean antes que las salidas
        for sku, quantity, supplier_name, location_id in ENTRIES_SEED:
            session.add(
                IngredientEntry(
                    ingredient_id=ids_by_sku[sku],
                    quantity=quantity,
                    supplier_name=supplier_name,
                    location_id=location_id,
                    user_uuid=next(user_uuids),
                )
            )

        for sku, quantity, reason, location_id in EXITS_SEED:
            session.add(
                IngredientExit(
                    ingredient_id=ids_by_sku[sku],
                    quantity=quantity,
                    reason=reason,
                    location_id=location_id,
                    user_uuid=next(user_uuids),
                )
            )

        session.commit()

    # Stock esperado: entradas menos salidas por SKU (0 si no hay órdenes)
    stock = {ingredient["sku"]: 0 for ingredient in INGREDIENTS_SEED}
    for sku, quantity, _, _ in ENTRIES_SEED:
        stock[sku] += quantity
    for sku, quantity, _, _ in EXITS_SEED:
        stock[sku] -= quantity

    print(f"Semillas cargadas: {len(INGREDIENTS_SEED)} ingredientes, "
          f"{len(ENTRIES_SEED)} entradas y {len(EXITS_SEED)} salidas.")
    print("Stock esperado:")
    for sku, value in stock.items():
        print(f"  {sku}: {value:g}")


if __name__ == "__main__":
    main()
