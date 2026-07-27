"""
schemas.py — Pydantic v2 request / response models
"""

from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from models import OrderStatus, UserRole


# ════════════════════════════════════════════════════════════════
#   PRODUCT SCHEMAS
# ════════════════════════════════════════════════════════════════

class ProductBase(BaseModel):
    name:           str
    description:    str            = ""
    category:       str
    price:          float
    original_price: Optional[float] = None
    stock:          int            = 0
    badge:          Optional[str]  = None
    colors:         List[str]      = []
    sizes:          List[str]      = []
    images:         List[str]      = []
    specs:          Dict[str, Any] = {}

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v


class ProductCreate(ProductBase):
    sku: str


class ProductUpdate(BaseModel):
    name:           Optional[str]          = None
    description:    Optional[str]          = None
    category:       Optional[str]          = None
    price:          Optional[float]        = None
    original_price: Optional[float]        = None
    stock:          Optional[int]          = None
    badge:          Optional[str]          = None
    colors:         Optional[List[str]]    = None
    sizes:          Optional[List[str]]    = None
    images:         Optional[List[str]]    = None
    specs:          Optional[Dict[str, Any]] = None
    is_active:      Optional[bool]         = None


class ProductOut(ProductBase):
    id:           int
    sku:          str
    rating:       float
    review_count: int
    is_active:    bool
    created_at:   datetime

    model_config = {"from_attributes": True}


# ════════════════════════════════════════════════════════════════
#   ORDER SCHEMAS
# ════════════════════════════════════════════════════════════════

class OrderItemIn(BaseModel):
    product_id: int
    quantity:   int   = 1
    color:      Optional[str] = None
    size:       Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        return v


class OrderCreate(BaseModel):
    email:      EmailStr
    first_name: str
    last_name:  str
    address:    str
    city:       str
    state:      str
    zip_code:   str
    country:    str = "India"
    items:      List[OrderItemIn]
    notes:      Optional[str] = None

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("Order must contain at least one item")
        return v

    @field_validator("first_name", "last_name", "address", "city", "state", "zip_code")
    @classmethod
    def required_text(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("This field is required")
        return value


class OrderItemOut(BaseModel):
    id:         int
    product_id: int
    quantity:   int
    unit_price: float
    color:      Optional[str]
    size:       Optional[str]
    product:    Optional[ProductOut] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id:            int
    email:         str
    first_name:    str
    last_name:     str
    address:       str
    city:          str
    state:         str
    zip_code:      str
    country:       str
    subtotal:      float
    shipping_cost: float
    total:         float
    status:        OrderStatus
    notes:         Optional[str]
    created_at:    datetime
    items:         List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ════════════════════════════════════════════════════════════════
#   USER / AUTH SCHEMAS
# ════════════════════════════════════════════════════════════════

class UserRegister(BaseModel):
    name:     str
    email:    EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class AdminRegister(UserRegister):
    setup_key: str


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


class UserOut(BaseModel):
    id:         int
    name:       str
    email:      str
    role:       UserRole
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


# ════════════════════════════════════════════════════════════════
#   REVIEW SCHEMAS
# ════════════════════════════════════════════════════════════════

class ReviewCreate(BaseModel):
    reviewer_name: str
    rating:        int
    comment:       str = ""

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id:            int
    product_id:    int
    reviewer_name: str
    rating:        int
    comment:       str
    created_at:    datetime

    model_config = {"from_attributes": True}


# ════════════════════════════════════════════════════════════════
#   GENERIC
# ════════════════════════════════════════════════════════════════

class MessageResponse(BaseModel):
    message: str

class StatsResponse(BaseModel):
    total_products:  int
    total_orders:    int
    total_users:     int
    total_revenue:   float
    pending_orders:  int
    out_of_stock:    int
