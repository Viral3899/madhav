"""
mongo_service.py — MongoDB integration for Madhav Fashion Studio

Provides a singleton MongoDB client and helper functions for:
  - Product search (full-text via MongoDB text indexes)
  - Cart persistence (guest and authenticated)
  - User activity tracking (clickstream for recommendations)
  - Recommendations cache
  - Reviews (denormalized for fast product page loading)
  - Session management

Usage:
    from mongo_service import get_mongo_db

    db = get_mongo_db()
    results = db.products.find({"category": "fashion"}).limit(20)

Environment variables (in .env):
    MONGODB_URL=mongodb://localhost:27017
    MONGODB_DB_NAME=madhav_fashion
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
#  MongoDB client (lazy singleton)
# ---------------------------------------------------------------------------
_mongo_client = None
_mongo_db = None


def get_mongo_client():
    """Return the singleton MongoClient, creating it if necessary."""
    global _mongo_client
    if _mongo_client is None:
        try:
            from pymongo import MongoClient
            from pymongo.errors import ConnectionFailure

            mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
            _mongo_client = MongoClient(
                mongo_url,
                serverSelectionTimeoutMS=3000,  # fail fast if unavailable
                connect=True,
            )
            # Ping to verify connection
            _mongo_client.admin.command("ping")
            logger.info("✓ Connected to MongoDB at %s", mongo_url)
        except ImportError:
            logger.warning("pymongo not installed. MongoDB features disabled.")
            _mongo_client = None
        except ConnectionFailure as exc:
            logger.warning("MongoDB unavailable (%s). Features will fall back to SQL.", exc)
            _mongo_client = None
    return _mongo_client


def get_mongo_db():
    """Return the MongoDB database instance, or None if unavailable."""
    global _mongo_db
    client = get_mongo_client()
    if client is not None and _mongo_db is None:
        db_name = os.getenv("MONGODB_DB_NAME", "madhav_fashion")
        _mongo_db = client[db_name]
    return _mongo_db


def is_mongo_available() -> bool:
    """Check if MongoDB is connected and usable."""
    return get_mongo_db() is not None


# ---------------------------------------------------------------------------
#  Product helpers
# ---------------------------------------------------------------------------

def search_products(
    query: str,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    colors: Optional[List[str]] = None,
    sizes: Optional[List[str]] = None,
    sort_by: str = "relevance",
    page: int = 1,
    per_page: int = 20,
) -> Dict[str, Any]:
    """
    Full-text product search using MongoDB text indexes.
    Falls back to basic filtering if no text query is provided.

    Returns:
        {
            "products": [...],
            "total": int,
            "page": int,
            "per_page": int,
            "total_pages": int
        }
    """
    db = get_mongo_db()
    if db is None:
        return {"products": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}

    pipeline: List[Dict[str, Any]] = []

    # ── Match stage ──────────────────────────────────────────────
    match: Dict[str, Any] = {"is_active": True}

    if query and query.strip():
        match["$text"] = {"$search": query}
    if category:
        match["category"] = category
    if min_price is not None or max_price is not None:
        price_filter: Dict[str, Any] = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        match["price"] = price_filter
    if colors:
        match["colors"] = {"$in": colors}
    if sizes:
        match["sizes"] = {"$in": sizes}

    pipeline.append({"$match": match})

    # ── Score for text search ────────────────────────────────────
    if query and query.strip():
        pipeline.append({"$addFields": {"score": {"$meta": "textScore"}}})

    # ── Count total (before pagination) ──────────────────────────
    count_result = list(db.products.aggregate([*pipeline, {"$count": "total"}]))
    total = count_result[0]["total"] if count_result else 0

    # ── Sort ─────────────────────────────────────────────────────
    sort_stage: Dict[str, Any] = {}
    if sort_by == "price_asc":
        sort_stage["price"] = 1
    elif sort_by == "price_desc":
        sort_stage["price"] = -1
    elif sort_by == "rating":
        sort_stage["rating"] = -1
    elif sort_by == "newest":
        sort_stage["created_at"] = -1
    elif sort_by == "name":
        sort_stage["name"] = 1
    else:  # relevance
        if query and query.strip():
            sort_stage["score"] = {"$meta": "textScore"}
        sort_stage["rating"] = -1

    pipeline.append({"$sort": sort_stage})

    # ── Pagination ───────────────────────────────────────────────
    skip = (page - 1) * per_page
    pipeline.append({"$skip": skip})
    pipeline.append({"$limit": per_page})

    # ── Projection ───────────────────────────────────────────────
    pipeline.append({
        "$project": {
            "_id": 0,
            "sku": 1,
            "name": 1,
            "description": 1,
            "category": 1,
            "price": 1,
            "original_price": 1,
            "stock": 1,
            "badge": 1,
            "colors": 1,
            "sizes": 1,
            "images": 1,
            "specs": 1,
            "rating": 1,
            "review_count": 1,
            "score": {"$meta": "textScore"} if query and query.strip() else 0,
        }
    })

    products = list(db.products.aggregate(pipeline))

    return {
        "products": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }


def get_product_by_sku(sku: str) -> Optional[Dict[str, Any]]:
    """Fetch a single product by SKU from MongoDB."""
    db = get_mongo_db()
    if db is None:
        return None
    return db.products.find_one({"sku": sku}, {"_id": 0})


def sync_product_to_mongo(product: Dict[str, Any]) -> bool:
    """
    Upsert a product into MongoDB (called after MySQL product create/update).
    Expects a dict with keys matching the MongoDB product schema.
    """
    db = get_mongo_db()
    if db is None:
        return False
    try:
        result = db.products.update_one(
            {"sku": product["sku"]},
            {"$set": {**product, "updated_at": datetime.utcnow()}},
            upsert=True,
        )
        return result.acknowledged
    except Exception as exc:
        logger.error("Failed to sync product %s to MongoDB: %s", product.get("sku"), exc)
        return False


# ---------------------------------------------------------------------------
#  Cart helpers
# ---------------------------------------------------------------------------

def get_cart(session_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve a cart by session_id or user_id."""
    db = get_mongo_db()
    if db is None:
        return None

    query: Dict[str, Any] = {}
    if user_id:
        query["user_id"] = user_id
    else:
        query["session_id"] = session_id

    return db.carts.find_one(query, {"_id": 0})


def save_cart(session_id: str, items: List[Dict[str, Any]], user_id: Optional[str] = None) -> bool:
    """Upsert a cart document."""
    db = get_mongo_db()
    if db is None:
        return False

    now = datetime.utcnow()
    try:
        db.carts.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "session_id": session_id,
                    "user_id": user_id,
                    "items": items,
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        return True
    except Exception as exc:
        logger.error("Failed to save cart: %s", exc)
        return False


def merge_carts(session_id: str, user_id: str) -> bool:
    """
    Merge a guest cart into a user's cart on login.
    Keeps the user's existing items and appends new ones from the guest cart.
    """
    db = get_mongo_db()
    if db is None:
        return False

    guest_cart = db.carts.find_one({"session_id": session_id})
    user_cart = db.carts.find_one({"user_id": user_id})

    if not guest_cart:
        return True  # nothing to merge

    guest_items = {item["product_id"]: item for item in guest_cart.get("items", [])}

    if user_cart:
        # Merge: user items take priority, add missing guest items
        user_items = {item["product_id"]: item for item in user_cart.get("items", [])}
        for pid, item in guest_items.items():
            if pid not in user_items:
                user_items[pid] = item
        merged = list(user_items.values())
        db.carts.update_one(
            {"user_id": user_id},
            {"$set": {"items": merged, "updated_at": datetime.utcnow()}},
        )
    else:
        # Transfer guest cart to user
        db.carts.update_one(
            {"session_id": session_id},
            {"$set": {"user_id": user_id, "updated_at": datetime.utcnow()}},
        )

    # Delete the guest cart
    db.carts.delete_one({"session_id": session_id, "user_id": None})
    return True


# ---------------------------------------------------------------------------
#  User activity / clickstream helpers
# ---------------------------------------------------------------------------

def track_event(
    event_type: str,
    session_id: str,
    user_id: Optional[str] = None,
    product_id: Optional[str] = None,
    search_query: Optional[str] = None,
    category: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> bool:
    """Record a user activity event for recommendations and analytics."""
    db = get_mongo_db()
    if db is None:
        return False

    try:
        db.user_activity.insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "event_type": event_type,
            "product_id": product_id,
            "search_query": search_query,
            "category": category,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow(),
        })
        return True
    except Exception as exc:
        logger.error("Failed to track event: %s", exc)
        return False


def get_recent_activity(
    user_id: str,
    limit: int = 50,
    event_types: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Get recent activity for a user (for recommendations)."""
    db = get_mongo_db()
    if db is None:
        return []

    query: Dict[str, Any] = {"user_id": user_id}
    if event_types:
        query["event_type"] = {"$in": event_types}

    return list(
        db.user_activity.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )


# ---------------------------------------------------------------------------
#  Recommendations cache helpers
# ---------------------------------------------------------------------------

def get_cached_recommendations(
    context_type: str, context_id: str
) -> Optional[List[Dict[str, Any]]]:
    """Get cached recommendations if they exist and haven't expired."""
    db = get_mongo_db()
    if db is None:
        return None

    cached = db.recommendations_cache.find_one(
        {"context_type": context_type, "context_id": context_id, "expires_at": {"$gt": datetime.utcnow()}},
        {"_id": 0, "recommendations": 1},
    )
    return cached["recommendations"] if cached else None


def cache_recommendations(
    context_type: str,
    context_id: str,
    recommendations: List[Dict[str, Any]],
    ttl_hours: int = 24,
) -> bool:
    """Store recommendations with a TTL."""
    db = get_mongo_db()
    if db is None:
        return False

    now = datetime.utcnow()
    try:
        db.recommendations_cache.update_one(
            {"context_type": context_type, "context_id": context_id},
            {
                "$set": {
                    "context_type": context_type,
                    "context_id": context_id,
                    "recommendations": recommendations,
                    "generated_at": now,
                    "expires_at": now + timedelta(hours=ttl_hours),
                }
            },
            upsert=True,
        )
        return True
    except Exception as exc:
        logger.error("Failed to cache recommendations: %s", exc)
        return False


# ---------------------------------------------------------------------------
#  Review helpers
# ---------------------------------------------------------------------------

def get_product_reviews(
    product_id: str,
    sort_by: str = "newest",
    page: int = 1,
    per_page: int = 10,
) -> Dict[str, Any]:
    """Get reviews for a product from MongoDB."""
    db = get_mongo_db()
    if db is None:
        return {"reviews": [], "total": 0, "page": page, "per_page": per_page, "total_pages": 0}

    query = {"product_id": product_id}

    total = db.reviews.count_documents(query)

    sort_field = "created_at"
    sort_order = -1
    if sort_by == "highest":
        sort_field = "rating"
        sort_order = -1
    elif sort_by == "lowest":
        sort_field = "rating"
        sort_order = 1
    elif sort_by == "helpful":
        sort_field = "helpful_count"
        sort_order = -1

    skip = (page - 1) * per_page
    reviews = list(
        db.reviews.find(query, {"_id": 0})
        .sort(sort_field, sort_order)
        .skip(skip)
        .limit(per_page)
    )

    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }


def add_review(review: Dict[str, Any]) -> bool:
    """Add a review to MongoDB (should also be saved to MySQL)."""
    db = get_mongo_db()
    if db is None:
        return False

    try:
        review["created_at"] = datetime.utcnow()
        review["helpful_count"] = 0
        review["is_verified_purchase"] = False
        db.reviews.insert_one(review)
        return True
    except Exception as exc:
        logger.error("Failed to add review: %s", exc)
        return False


# ---------------------------------------------------------------------------
#  Session helpers
# ---------------------------------------------------------------------------

def create_session(
    session_id: str,
    user_id: str,
    role: str,
    refresh_token: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    ttl_days: int = 30,
) -> bool:
    """Create a new session document."""
    db = get_mongo_db()
    if db is None:
        return False

    now = datetime.utcnow()
    try:
        db.sessions.insert_one({
            "session_id": session_id,
            "user_id": user_id,
            "role": role,
            "refresh_token": refresh_token,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": now,
            "expires_at": now + timedelta(days=ttl_days),
            "last_activity": now,
        })
        return True
    except Exception as exc:
        logger.error("Failed to create session: %s", exc)
        return False


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get a session by ID."""
    db = get_mongo_db()
    if db is None:
        return None
    return db.sessions.find_one({"session_id": session_id}, {"_id": 0})


def update_session_activity(session_id: str) -> bool:
    """Update last_activity timestamp for a session."""
    db = get_mongo_db()
    if db is None:
        return False
    try:
        db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {"last_activity": datetime.utcnow()}},
        )
        return True
    except Exception as exc:
        logger.error("Failed to update session activity: %s", exc)
        return False


def delete_session(session_id: str) -> bool:
    """Delete a session (logout)."""
    db = get_mongo_db()
    if db is None:
        return False
    try:
        db.sessions.delete_one({"session_id": session_id})
        return True
    except Exception as exc:
        logger.error("Failed to delete session: %s", exc)
        return False