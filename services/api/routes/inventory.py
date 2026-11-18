from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from auth.security import get_current_user
from inventory.database import get_db
from inventory.models import Ingredient, IngredientEntry, IngredientExit
from inventory.schemas import (
    IngredientCreate,
    IngredientEntryCreate,
    IngredientEntryRead,
    IngredientExitCreate,
    IngredientExitRead,
    IngredientRead,
    OrderRead,
)

inventory_router = APIRouter(prefix="/inventory", tags=["inventory"])


def compute_stock(session: Session, ingredient_id: int) -> float:
    """Calcula el stock disponible de un ingrediente.
    
    stock = SUMA(entradas) - SUMA(salidas)
    
    Usa coalesce para retornar 0 si no hay órdenes.
    """
    # Suma de entradas para este ingrediente
    stmt_entries = select(func.coalesce(func.sum(IngredientEntry.quantity), 0)).where(
        IngredientEntry.ingredient_id == ingredient_id
    )
    total_entries = session.exec(stmt_entries).one()

    # Suma de salidas para este ingrediente
    stmt_exits = select(func.coalesce(func.sum(IngredientExit.quantity), 0)).where(
        IngredientExit.ingredient_id == ingredient_id
    )
    total_exits = session.exec(stmt_exits).one()

    return float(total_entries) - float(total_exits)


@inventory_router.get("/products", response_model=list[IngredientRead])
def list_products(session: Session = Depends(get_db)) -> list[IngredientRead]:
    """Lista todos los ingredientes con su stock calculado.
    
    Usa dos consultas agrupadas para obtener totales de entradas y salidas,
    evitando N+1 queries.
    """
    # Obtener todos los ingredientes
    ingredients = session.exec(select(Ingredient)).all()

    # Consulta agrupada: total de entradas por ingrediente
    stmt_entries = (
        select(IngredientEntry.ingredient_id, func.sum(IngredientEntry.quantity))
        .group_by(IngredientEntry.ingredient_id)
    )
    entries_data = {row[0]: row[1] for row in session.exec(stmt_entries).all()}

    # Consulta agrupada: total de salidas por ingrediente
    stmt_exits = (
        select(IngredientExit.ingredient_id, func.sum(IngredientExit.quantity))
        .group_by(IngredientExit.ingredient_id)
    )
    exits_data = {row[0]: row[1] for row in session.exec(stmt_exits).all()}

    # Construir respuesta con stock calculado
    result = []
    for ingredient in ingredients:
        total_entries = entries_data.get(ingredient.id, 0) or 0
        total_exits = exits_data.get(ingredient.id, 0) or 0
        current_stock = float(total_entries) - float(total_exits)

        result.append(
            IngredientRead(
                id=ingredient.id,
                name=ingredient.name,
                sku=ingredient.sku,
                unit=ingredient.unit,
                category=ingredient.category,
                country=ingredient.country,
                current_stock=current_stock,
            )
        )

    return result


@inventory_router.post(
    "/products", response_model=IngredientRead, status_code=status.HTTP_201_CREATED
)
def create_product(
    data: IngredientCreate,
    session: Session = Depends(get_db),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> IngredientRead:
    """Crea un nuevo ingrediente.
    
    Requiere autenticación. Si el SKU ya existe, retorna 409 (Conflict).
    El stock inicial es 0.
    """
    # Verificar que el SKU no exista
    existing = session.exec(select(Ingredient).where(Ingredient.sku == data.sku)).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El SKU '{data.sku}' ya existe.",
        )

    # Crear ingrediente
    ingredient = Ingredient(
        name=data.name,
        sku=data.sku,
        unit=data.unit,
        category=data.category,
        country=data.country,
    )
    session.add(ingredient)
    session.commit()
    session.refresh(ingredient)

    return IngredientRead(
        id=ingredient.id,
        name=ingredient.name,
        sku=ingredient.sku,
        unit=ingredient.unit,
        category=ingredient.category,
        country=ingredient.country,
        current_stock=0.0,
    )


@inventory_router.get("/products/{ingredient_id}", response_model=IngredientRead)
def get_product(
    ingredient_id: int, session: Session = Depends(get_db)
) -> IngredientRead:
    """Obtiene un ingrediente por su ID con su stock calculado.
    
    Si no existe, retorna 404 (Not Found).
    """
    ingredient = session.get(Ingredient, ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {ingredient_id} no encontrado.",
        )

    current_stock = compute_stock(session, ingredient_id)

    return IngredientRead(
        id=ingredient.id,
        name=ingredient.name,
        sku=ingredient.sku,
        unit=ingredient.unit,
        category=ingredient.category,
        country=ingredient.country,
        current_stock=current_stock,
    )


@inventory_router.post(
    "/orders/inbound",
    response_model=IngredientEntryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_inbound_order(
    data: IngredientEntryCreate,
    session: Session = Depends(get_db),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> IngredientEntryRead:
    """Registra una entrega de proveedor (entrada de ingrediente).
    
    Requiere autenticación. Si el ingrediente no existe, retorna 404.
    Guarda el UUID del usuario autenticado.
    """
    # Verificar que el ingrediente existe
    ingredient = session.get(Ingredient, data.ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {data.ingredient_id} no encontrado.",
        )

    # Crear entrada
    entry = IngredientEntry(
        ingredient_id=data.ingredient_id,
        quantity=data.quantity,
        supplier_name=data.supplier_name,
        location_id=data.location_id,
        user_uuid=current_user["id"],
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)

    return IngredientEntryRead(
        id=entry.id,
        ingredient_id=entry.ingredient_id,
        quantity=entry.quantity,
        supplier_name=entry.supplier_name,
        location_id=entry.location_id,
        created_at=entry.created_at,
        user_uuid=entry.user_uuid,
    )


@inventory_router.post(
    "/orders/outbound",
    response_model=IngredientExitRead,
    status_code=status.HTTP_201_CREATED,
)
def create_outbound_order(
    data: IngredientExitCreate,
    session: Session = Depends(get_db),
    current_user: dict[str, Any] = Depends(get_current_user),
) -> IngredientExitRead:
    """Registra un consumo o merma (salida de ingrediente).
    
    Requiere autenticación. Si el ingrediente no existe, retorna 404.
    Verifica que haya stock disponible antes de registrar; si no, retorna 400.
    Guarda el UUID del usuario autenticado.
    """
    # Verificar que el ingrediente existe
    ingredient = session.get(Ingredient, data.ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {data.ingredient_id} no encontrado.",
        )

    # Calcular stock disponible
    available_stock = compute_stock(session, data.ingredient_id)

    # Verificar que hay stock suficiente
    if data.quantity > available_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient stock for ingredient '{ingredient.name}'. "
                f"Available: {available_stock}, requested: {data.quantity}."
            ),
        )

    # Crear salida
    exit_record = IngredientExit(
        ingredient_id=data.ingredient_id,
        quantity=data.quantity,
        reason=data.reason,
        location_id=data.location_id,
        user_uuid=current_user["id"],
    )
    session.add(exit_record)
    session.commit()
    session.refresh(exit_record)

    return IngredientExitRead(
        id=exit_record.id,
        ingredient_id=exit_record.ingredient_id,
        quantity=exit_record.quantity,
        reason=exit_record.reason,
        location_id=exit_record.location_id,
        created_at=exit_record.created_at,
        user_uuid=exit_record.user_uuid,
    )


@inventory_router.get("/orders", response_model=list[OrderRead])
def list_orders(session: Session = Depends(get_db)) -> list[OrderRead]:
    """Lista todas las órdenes (entradas y salidas) ordenadas por fecha descendente.
    
    Mezcla IngredientEntry e IngredientExit con información del ingrediente asociado.
    Usa lazy="selectin" para evitar N+1 queries al acceder a ingredient.
    """
    # Obtener todas las entradas con su ingrediente
    entries = session.exec(select(IngredientEntry)).all()
    entries_orders = [
        OrderRead(
            id=entry.id,
            order_type="inbound",
            ingredient_id=entry.ingredient_id,
            ingredient_name=entry.ingredient.name,
            ingredient_sku=entry.ingredient.sku,
            unit=entry.ingredient.unit,
            quantity=entry.quantity,
            location_id=entry.location_id,
            supplier_name=entry.supplier_name,
            reason=None,
            user_uuid=entry.user_uuid,
            created_at=entry.created_at,
        )
        for entry in entries
    ]

    # Obtener todas las salidas con su ingrediente
    exits = session.exec(select(IngredientExit)).all()
    exits_orders = [
        OrderRead(
            id=exit_record.id,
            order_type="outbound",
            ingredient_id=exit_record.ingredient_id,
            ingredient_name=exit_record.ingredient.name,
            ingredient_sku=exit_record.ingredient.sku,
            unit=exit_record.ingredient.unit,
            quantity=exit_record.quantity,
            location_id=exit_record.location_id,
            supplier_name=None,
            reason=exit_record.reason,
            user_uuid=exit_record.user_uuid,
            created_at=exit_record.created_at,
        )
        for exit_record in exits
    ]

    # Combinar y ordenar por fecha descendente
    all_orders = entries_orders + exits_orders
    all_orders.sort(key=lambda o: o.created_at, reverse=True)

    return all_orders
