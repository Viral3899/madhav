from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session

from models import Product


def recommend_products(db: Session, product_id: Optional[int] = None, limit: int = 8) -> List[Product]:
    """Content-based fashion recommendations with a deterministic popular fallback.

    This keeps recommendations useful before a trained ML model exists. The same
    response contract can later be backed by a model-serving service.
    """
    products = db.query(Product).filter(Product.is_active == True, Product.stock > 0).all()
    if not products:
        return []
    if product_id is None:
        return sorted(products, key=lambda item: (item.rating, item.review_count), reverse=True)[:limit]
    source = next((item for item in products if item.id == product_id), None)
    if source is None:
        return sorted(products, key=lambda item: (item.rating, item.review_count), reverse=True)[:limit]

    def score(candidate: Product) -> float:
        if candidate.id == source.id:
            return -1
        source_specs = source.specs or {}
        candidate_specs = candidate.specs or {}
        shared_specs = sum(1 for key, value in source_specs.items() if candidate_specs.get(key) == value)
        shared_colors = len(set(source.colors or []) & set(candidate.colors or []))
        price_distance = abs(candidate.price - source.price) / max(source.price, 1)
        return shared_specs * 4 + shared_colors * 2 + candidate.rating + candidate.review_count / 1000 - price_distance

    return sorted(products, key=score, reverse=True)[:limit]
