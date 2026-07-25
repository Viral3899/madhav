"""
routes/admin.py

Admin-only dashboard routes:
  GET /api/admin/stats          — aggregated dashboard KPIs
  GET /api/admin/users          — paginated user list
  PATCH /api/admin/users/{id}   — toggle active / change role
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Order, OrderStatus, Product, User, UserRole
from schemas import MessageResponse, StatsResponse, UserOut
from routes.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=StatsResponse)
def dashboard_stats(
    db:     Session = Depends(get_db),
    _admin          = Depends(require_admin),
):
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    total_orders   = db.query(func.count(Order.id)).scalar()
    total_users    = db.query(func.count(User.id)).filter(User.role == UserRole.customer).scalar()
    total_revenue  = db.query(func.coalesce(func.sum(Order.total), 0.0)).filter(
        Order.status != OrderStatus.cancelled
    ).scalar()
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.pending).scalar()
    out_of_stock   = db.query(func.count(Product.id)).filter(
        Product.is_active == True, Product.stock == 0
    ).scalar()

    return StatsResponse(
        total_products=total_products or 0,
        total_orders=total_orders or 0,
        total_users=total_users or 0,
        total_revenue=float(total_revenue or 0),
        pending_orders=pending_orders or 0,
        out_of_stock=out_of_stock or 0,
    )


@router.get("/users", response_model=List[UserOut])
def list_users(
    page:  int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db:    Session = Depends(get_db),
    _admin         = Depends(require_admin),
):
    return (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id:   int,
    is_active: bool | None = None,
    role:      UserRole | None = None,
    db:        Session = Depends(get_db),
    _admin             = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if is_active is not None:
        user.is_active = is_active
    if role is not None:
        user.role = role
    db.commit()
    db.refresh(user)
    return user
