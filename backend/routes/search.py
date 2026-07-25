from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from routes.auth import require_admin
from search_service import get_client, index_product

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/status")
def search_status():
    client = get_client()
    if client is None:
        return {"provider": "database-fallback", "configured": False}
    try:
        return {"provider": "opensearch", "configured": True, "healthy": bool(client.ping())}
    except Exception:
        return {"provider": "opensearch", "configured": True, "healthy": False}


@router.post("/reindex")
def reindex_products(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    products = db.query(Product).filter(Product.is_active == True).all()
    indexed = sum(1 for product in products if index_product(product))
    return {"indexed": indexed, "total": len(products), "provider": "opensearch" if indexed else "database-fallback"}
