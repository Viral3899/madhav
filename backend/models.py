"""
models.py — SQLAlchemy ORM table definitions + Pydantic response/request schemas
Tables: users, products, orders, order_items, reviews
"""

from __future__ import annotations
import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, JSON, func,
)
from sqlalchemy.orm import relationship, Mapped
from pydantic import BaseModel, EmailStr, field_validator

from database import Base


# ════════════════════════════════════════════════════════════════
#   ENUMS
# ════════════════════════════════════════════════════════════════

class OrderStatus(str, enum.Enum):
    pending    = "pending"
    confirmed  = "confirmed"
    shipped    = "shipped"
    delivered  = "delivered"
    cancelled  = "cancelled"


class UserRole(str, enum.Enum):
    customer = "customer"
    seller   = "seller"
    admin    = "admin"


# ════════════════════════════════════════════════════════════════
#   ORM MODELS
# ════════════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(120), nullable=False)
    email         = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, server_default=func.now())

    orders        = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    reviews       = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id            = Column(Integer, primary_key=True, index=True)
    sku           = Column(String(60), unique=True, index=True, nullable=False)
    name          = Column(String(300), nullable=False, index=True)
    description   = Column(Text, default="")
    category      = Column(String(80), index=True, nullable=False)
    price         = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)   # for discount display
    stock         = Column(Integer, default=0)
    badge         = Column(String(60), nullable=True)   # "Best Seller", "New", etc.
    colors        = Column(JSON, default=list)       # ["Black", "White"]
    sizes         = Column(JSON, default=list)       # ["S", "M", "L"] or []
    images        = Column(JSON, default=list)       # list of URL strings
    specs         = Column(JSON, default=dict)       # {"Brand": "Sony", ...}
    rating        = Column(Float, default=0.0)
    review_count  = Column(Integer, default=0)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, server_default=func.now())
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now())

    order_items   = relationship("OrderItem", back_populates="product")
    reviews       = relationship("Review", back_populates="product", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for guest checkout
    status        = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)

    # Contact
    email         = Column(String(200), nullable=False)
    first_name    = Column(String(120), nullable=False)
    last_name     = Column(String(120), nullable=False)

    # Shipping address
    address       = Column(String(300), nullable=False)
    city          = Column(String(120), nullable=False)
    state         = Column(String(120), nullable=False)
    zip_code      = Column(String(20), nullable=False)
    country       = Column(String(80), default="India")

    subtotal      = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0.0)
    total         = Column(Float, nullable=False)

    notes         = Column(Text, nullable=True)
    created_at    = Column(DateTime, server_default=func.now())
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user          = relationship("User", back_populates="orders")
    items         = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id            = Column(Integer, primary_key=True, index=True)
    order_id      = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id    = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity      = Column(Integer, nullable=False, default=1)
    unit_price    = Column(Float, nullable=False)   # price snapshot at order time
    color         = Column(String(80), nullable=True)
    size          = Column(String(40), nullable=True)

    order         = relationship("Order", back_populates="items")
    product       = relationship("Product", back_populates="order_items")


class Review(Base):
    __tablename__ = "reviews"

    id            = Column(Integer, primary_key=True, index=True)
    product_id    = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewer_name = Column(String(120), nullable=False)
    rating        = Column(Integer, nullable=False)  # 1–5
    comment       = Column(Text, default="")
    created_at    = Column(DateTime, server_default=func.now())

    product       = relationship("Product", back_populates="reviews")
    user          = relationship("User", back_populates="reviews")
