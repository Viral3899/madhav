from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductOut
from services.recommendations import recommend_products

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("", response_model=List[ProductOut])
def get_recommendations(product_id: Optional[int] = Query(None), limit: int = Query(8, ge=1, le=24), db: Session = Depends(get_db)):
    return recommend_products(db, product_id=product_id, limit=limit)
