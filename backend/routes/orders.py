"""
routes/orders.py

Public / customer:
  POST /api/orders                     — place an order (guest or logged-in)
  GET  /api/orders/{id}                — get order by ID (owner or admin)

Admin only:
  GET    /api/orders                   — list all orders (paginated)
  PATCH  /api/orders/{id}/status       — update order status
  DELETE /api/orders/{id}              — hard-delete order
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Order, OrderItem, OrderStatus, Product, User
from schemas import (
    MessageResponse, OrderCreate, OrderOut, OrderStatusUpdate,
)
from routes.auth import get_current_user, require_admin, ALGORITHM, SECRET_KEY

router = APIRouter(prefix="/api/orders", tags=["orders"])

optional_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login/form", auto_error=False)


def get_optional_user(
    token: Optional[str] = Depends(optional_oauth2),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Resolve a customer token when present while preserving guest checkout."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not isinstance(user_id, str) or not user_id.isdigit():
            return None
        user = db.get(User, int(user_id))
        return user if user and user.is_active else None
    except (JWTError, ValueError):
        return None

FREE_SHIPPING_THRESHOLD = 499.0
SHIPPING_COST           = 40.0


# ── Place order (public / guest checkout) ─────────────────────
@router.post("", response_model=OrderOut, status_code=201)
def place_order(
    payload: OrderCreate,
    db:      Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Creates a new order. Validates stock for every item, deducts
    stock, calculates totals, and saves everything atomically.
    """
    subtotal = 0.0
    item_rows: list[OrderItem] = []

    quantities: dict[int, int] = {}
    for item in payload.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    products: dict[int, Product] = {}
    for product_id, quantity in quantities.items():
        product = db.get(Product, product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )
        if product.stock < quantity:
            raise HTTPException(
                status_code=409,
                detail=f"'{product.name}' only has {product.stock} left in stock",
            )
        products[product_id] = product

    for item in payload.items:
        product = products[item.product_id]
        subtotal += product.price * item.quantity
        item_rows.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=product.price,
                color=item.color,
                size=item.size,
            )
        )

    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
    total    = subtotal + shipping

    order = Order(
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        country=payload.country,
        subtotal=subtotal,
        shipping_cost=shipping,
        total=total,
        notes=payload.notes,
        status=OrderStatus.pending,
        user_id=current_user.id if current_user else None,
    )
    db.add(order)
    db.flush()  # get order.id before adding items

    for row in item_rows:
        row.order_id = order.id
        db.add(row)
        # Deduct stock
        product = products[row.product_id]
        product.stock = max(0, product.stock - row.quantity)

    db.commit()
    db.refresh(order)

    # Return with items + products loaded
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order.id)
        .one()
    )


@router.get("/mine", response_model=List[OrderOut])
def my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter((Order.user_id == current_user.id) | (Order.email == current_user.email))
        .order_by(Order.created_at.desc()).all()
    )


# ── Get single order ───────────────────────────────────────────
@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db:       Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role.value != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ── Admin: list all orders ─────────────────────────────────────
@router.get("", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = Query(None),
    page:   int           = Query(1, ge=1),
    limit:  int           = Query(25, ge=1, le=100),
    db:     Session       = Depends(get_db),
    _admin                = Depends(require_admin),
):
    qs = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    )
    if status:
        try:
            qs = qs.filter(Order.status == OrderStatus(status))
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Invalid status: {status}")

    return (
        qs.order_by(Order.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


# ── Admin: update status ───────────────────────────────────────
@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload:  OrderStatusUpdate,
    db:       Session = Depends(get_db),
    _admin            = Depends(require_admin),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .one()
    )


# ── Admin: delete order ────────────────────────────────────────
@router.delete("/{order_id}", response_model=MessageResponse)
def delete_order(
    order_id: int,
    db:       Session = Depends(get_db),
    _admin            = Depends(require_admin),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": f"Order {order_id} deleted"}
