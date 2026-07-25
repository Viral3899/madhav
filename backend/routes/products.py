"""
routes/products.py

Public endpoints (no auth):
  GET  /api/products              — list with filter/sort/search/pagination
  GET  /api/products/{id}         — single product
  GET  /api/products/{id}/reviews — reviews for a product
  POST /api/products/{id}/reviews — submit a review

Admin endpoints (require admin JWT):
  POST   /api/products            — create product
  PUT    /api/products/{id}       — update product
  DELETE /api/products/{id}       — soft-delete (sets is_active=False)
  PATCH  /api/products/{id}/stock — adjust stock
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from database import get_db
from models import Product, Review
from schemas import (
    MessageResponse, ProductCreate, ProductOut, ProductUpdate,
    ReviewCreate, ReviewOut,
)
from routes.auth import get_current_user, require_admin
from search_service import search_ids

router = APIRouter(prefix="/api/products", tags=["products"])


# ── Helpers ────────────────────────────────────────────────────
def _get_or_404(product_id: int, db: Session) -> Product:
    p = db.get(Product, product_id)
    if not p or not p.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


def _recalc_rating(product: Product, db: Session):
    """Recompute average rating from reviews table."""
    result = db.query(
        func.avg(Review.rating), func.count(Review.id)
    ).filter(Review.product_id == product.id).one()
    product.rating       = round(float(result[0] or 0), 1)
    product.review_count = result[1]
    db.commit()
    db.refresh(product)


# ── Public: list ───────────────────────────────────────────────
@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = Query("fashion", description="Fashion catalogue only"),
    q:        Optional[str] = Query(None, description="Search in name/description"),
    sort:     str           = Query("featured", enum=["featured", "price_asc", "price_desc", "rating", "discount"]),
    page:     int           = Query(1, ge=1),
    limit:    int           = Query(20, ge=1, le=100),
    db:       Session       = Depends(get_db),
):
    qs = db.query(Product).filter(Product.is_active == True)

    if category and category != "all":
        qs = qs.filter(func.lower(Product.category) == category.lower())
    else:
        qs = qs.filter(func.lower(Product.category) == "fashion")

    if q:
        indexed_ids = None
        try:
            indexed_ids = search_ids(q, limit=limit)
        except Exception:
            indexed_ids = None
        if indexed_ids is not None:
            qs = qs.filter(Product.id.in_(indexed_ids))
        else:
            indexed_ids = None
        like = f"%{q.lower()}%"
        if indexed_ids is None:
            qs = qs.filter(or_(func.lower(Product.name).contains(q.lower()), func.lower(Product.description).contains(q.lower())))

    if sort == "price_asc":
        qs = qs.order_by(Product.price.asc())
    elif sort == "price_desc":
        qs = qs.order_by(Product.price.desc())
    elif sort == "rating":
        qs = qs.order_by(Product.rating.desc(), Product.review_count.desc())
    elif sort == "discount":
        # products with original_price come first, sorted by biggest % off
        qs = qs.order_by(
            (Product.original_price - Product.price).desc().nullslast()
        )
    else:  # featured — newest first
        qs = qs.order_by(Product.id.asc())

    offset = (page - 1) * limit
    return qs.offset(offset).limit(limit).all()


# ── Public: single product ─────────────────────────────────────
@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return _get_or_404(product_id, db)


# ── Public: reviews ────────────────────────────────────────────
@router.get("/{product_id}/reviews", response_model=List[ReviewOut])
def list_reviews(
    product_id: int,
    page:  int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db:    Session = Depends(get_db),
):
    _get_or_404(product_id, db)
    return (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )


@router.post("/{product_id}/reviews", response_model=ReviewOut, status_code=201)
def submit_review(
    product_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
):
    product = _get_or_404(product_id, db)
    review  = Review(product_id=product_id, **payload.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    _recalc_rating(product, db)
    return review


# ── Admin: create ──────────────────────────────────────────────
@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db:      Session = Depends(get_db),
    _admin           = Depends(require_admin),
):
    if payload.category.lower() != "fashion":
        raise HTTPException(status_code=422, detail="Only fashion products are supported")
    if db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status_code=409, detail="SKU already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ── Admin: update ──────────────────────────────────────────────
@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload:    ProductUpdate,
    db:         Session = Depends(get_db),
    _admin              = Depends(require_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.category and payload.category.lower() != "fashion":
        raise HTTPException(status_code=422, detail="Only fashion products are supported")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


# ── Admin: soft delete ─────────────────────────────────────────
@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: int,
    db:         Session = Depends(get_db),
    _admin              = Depends(require_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": f"Product {product_id} deactivated"}


# ── Admin: stock patch ─────────────────────────────────────────
@router.patch("/{product_id}/stock", response_model=ProductOut)
def update_stock(
    product_id: int,
    stock:      int,
    db:         Session = Depends(get_db),
    _admin              = Depends(require_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if stock < 0:
        raise HTTPException(status_code=422, detail="Stock cannot be negative")
    product.stock = stock
    db.commit()
    db.refresh(product)
    return product
