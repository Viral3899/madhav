"""
main.py — FastAPI application entry point
Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, SessionLocal, engine
from models import Product, User, UserRole
from routes.auth import hash_password
from routes import auth, products, orders, admin, recommendations, search


# ════════════════════════════════════════════════════════════════
#   SEED DATA — mirrors the products in store.html
# ════════════════════════════════════════════════════════════════
SEED_PRODUCTS = [
    # ── Electronics ──────────────────────────────────────────
    dict(
        sku="e1", category="electronics",
        name="Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        description="Industry-leading noise cancellation with 30-hour battery life. Multipoint connection lets you pair two Bluetooth devices simultaneously.",
        price=24999, original_price=34990, stock=45, badge="Best Seller",
        colors=["Black", "Silver", "Midnight Blue"], sizes=[],
        images=["https://picsum.photos/seed/headphones-main/600/600",
                "https://picsum.photos/seed/headphones-2/600/600",
                "https://picsum.photos/seed/headphones-3/600/600",
                "https://picsum.photos/seed/headphones-4/600/600"],
        specs={"Brand": "Sony", "Battery Life": "30 hours",
               "Connectivity": "Bluetooth 5.2", "Weight": "250g",
               "Noise Cancellation": "Active (ANC)", "Warranty": "1 Year"},
        rating=4.7, review_count=18342,
    ),
    dict(
        sku="e2", category="electronics",
        name='Samsung 55" 4K QLED Smart TV (2024)',
        description="Quantum Dot technology delivers brilliant colour accuracy. Dolby Atmos sound system with Object Tracking Sound.",
        price=54999, original_price=79990, stock=12, badge="31% off",
        colors=["Black"], sizes=['43"', '55"', '65"', '75"'],
        images=["https://picsum.photos/seed/smarttv-main/600/600",
                "https://picsum.photos/seed/smarttv-2/600/600",
                "https://picsum.photos/seed/smarttv-3/600/600"],
        specs={"Brand": "Samsung", "Resolution": "4K Ultra HD",
               "Screen Size": "55 inches", "Refresh Rate": "120 Hz",
               "HDR": "Quantum HDR 12x", "Ports": "4x HDMI, 2x USB"},
        rating=4.5, review_count=9210,
    ),
    dict(
        sku="e3", category="electronics",
        name="Apple iPhone 15 (128GB) — Midnight",
        description="A16 Bionic chip for super-fast performance. 48MP main camera with 2x Telephoto. Dynamic Island with real-time activities.",
        price=79900, original_price=89900, stock=30, badge="New",
        colors=["Midnight", "Starlight", "Blue", "Pink", "Yellow"],
        sizes=["128GB", "256GB", "512GB"],
        images=["https://picsum.photos/seed/iphone15-main/600/600",
                "https://picsum.photos/seed/iphone15-2/600/600",
                "https://picsum.photos/seed/iphone15-3/600/600",
                "https://picsum.photos/seed/iphone15-4/600/600"],
        specs={"Brand": "Apple", "Chip": "A16 Bionic",
               "Camera": "48MP Main + 12MP Ultra Wide",
               "Battery": "Up to 26h video",
               "Display": "6.1\" Super Retina XDR", "OS": "iOS 17"},
        rating=4.8, review_count=51204,
    ),
    dict(
        sku="e4", category="electronics",
        name="boAt Airdopes 141 True Wireless Earbuds",
        description="ENx Technology for clear calls. Up to 42 hours total playback. IPX4 water resistance.",
        price=1299, original_price=4490, stock=200, badge="71% off",
        colors=["Active Black", "Bold Blue", "Blazing Red"], sizes=[],
        images=["https://picsum.photos/seed/earbuds-main/600/600",
                "https://picsum.photos/seed/earbuds-2/600/600",
                "https://picsum.photos/seed/earbuds-3/600/600"],
        specs={"Brand": "boAt", "Battery (Buds)": "6 hours",
               "Total Battery": "42 hours", "Water": "IPX4",
               "Connectivity": "Bluetooth 5.1", "Warranty": "1 Year"},
        rating=4.2, review_count=82034,
    ),
    # ── Fashion ───────────────────────────────────────────────
    dict(
        sku="f1", category="fashion",
        name="Levi's Men's 511 Slim Fit Stretch Jeans",
        description="Slim through hip and thigh. 4-way stretch denim for all-day comfort. Classic 5-pocket styling.",
        price=2799, original_price=4999, stock=80, badge="Top Pick",
        colors=["Dark Indigo", "Light Wash", "Black"],
        sizes=["28", "30", "32", "34", "36", "38"],
        images=["https://picsum.photos/seed/jeans-main/600/600",
                "https://picsum.photos/seed/jeans-2/600/600",
                "https://picsum.photos/seed/jeans-3/600/600"],
        specs={"Brand": "Levi's", "Material": "99% Cotton, 1% Elastane",
               "Fit": "Slim", "Rise": "Mid Rise",
               "Closure": "Zip Fly", "Care": "Machine Wash"},
        rating=4.4, review_count=23458,
    ),
    dict(
        sku="f2", category="fashion",
        name="Zara Women's Floral Midi Wrap Dress",
        description="Feminine midi wrap dress in vibrant floral print. V-neckline, long sleeves, adjustable tie-waist.",
        price=3490, original_price=5990, stock=35, badge="Trending",
        colors=["Floral Blue", "Floral Red", "Ivory"],
        sizes=["XS", "S", "M", "L", "XL"],
        images=["https://picsum.photos/seed/dress-main/600/600",
                "https://picsum.photos/seed/dress-2/600/600",
                "https://picsum.photos/seed/dress-3/600/600",
                "https://picsum.photos/seed/dress-4/600/600"],
        specs={"Brand": "Zara", "Material": "100% Viscose",
               "Length": "Midi", "Neckline": "V-neck",
               "Sleeve": "Long Sleeve", "Care": "Dry Clean Only"},
        rating=4.3, review_count=7820,
    ),
    dict(
        sku="f3", category="fashion",
        name="Nike Air Force 1 '07 White Sneakers",
        description="The radiance lives on. Crispy leather upper pairs with bold Swoosh. Nike Air cushioning.",
        price=7495, original_price=8995, stock=60, badge="Classic",
        colors=["White/White", "Black/Black", "Triple White"],
        sizes=["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        images=["https://picsum.photos/seed/airforce-main/600/600",
                "https://picsum.photos/seed/airforce-2/600/600",
                "https://picsum.photos/seed/airforce-3/600/600"],
        specs={"Brand": "Nike", "Upper": "Full-grain Leather",
               "Sole": "Rubber", "Closure": "Lace-up",
               "Technology": "Nike Air cushioning", "Origin": "Vietnam"},
        rating=4.7, review_count=34012,
    ),
    dict(
        sku="f4", category="fashion",
        name="H&M Oversized Hoodie — Stone Grey",
        description="Relaxed oversized fit with kangaroo pocket and drawstring hood. Soft brushed interior.",
        price=1499, original_price=2499, stock=120, badge="40% off",
        colors=["Stone Grey", "Black", "Cream", "Forest Green"],
        sizes=["XS", "S", "M", "L", "XL", "XXL"],
        images=["https://picsum.photos/seed/hoodie-main/600/600",
                "https://picsum.photos/seed/hoodie-2/600/600",
                "https://picsum.photos/seed/hoodie-3/600/600"],
        specs={"Brand": "H&M", "Material": "80% Cotton, 20% Polyester",
               "Fit": "Oversized", "Hood": "Drawstring",
               "Pocket": "Kangaroo front", "Care": "Machine Wash 40°"},
        rating=4.1, review_count=5640,
    ),
    # ── Home ──────────────────────────────────────────────────
    dict(
        sku="h1", category="home",
        name="Philips Air Fryer HD9200 4.1L — Black",
        description="Fry, bake, grill and roast with up to 90% less fat. Rapid Air Technology. Dishwasher-safe basket.",
        price=6999, original_price=10995, stock=25, badge="Best Seller",
        colors=["Black", "White"], sizes=["2.9L", "4.1L", "6.2L"],
        images=["https://picsum.photos/seed/airfryer-main/600/600",
                "https://picsum.photos/seed/airfryer-2/600/600",
                "https://picsum.photos/seed/airfryer-3/600/600"],
        specs={"Brand": "Philips", "Capacity": "4.1 Litres",
               "Power": "1400W", "Temperature": "80–200°C",
               "Timer": "30 min", "Warranty": "2 Years"},
        rating=4.6, review_count=41230,
    ),
    dict(
        sku="h2", category="home",
        name="IKEA KALLAX Shelf Unit 4×4 — White",
        description="Versatile cube storage that works as a shelf or room divider. Add inserts to customize.",
        price=14999, original_price=18999, stock=8, badge=None,
        colors=["White", "Black-Brown", "White Stained Oak"],
        sizes=["1×4", "2×4", "4×4"],
        images=["https://picsum.photos/seed/kallax-main/600/600",
                "https://picsum.photos/seed/kallax-2/600/600",
                "https://picsum.photos/seed/kallax-3/600/600"],
        specs={"Brand": "IKEA", "Material": "Particleboard, ABS plastic",
               "Dimensions": "147×147cm", "Cells": "16 compartments",
               "Max Load": "13 kg per cell", "Assembly": "Self-assembly"},
        rating=4.5, review_count=12003,
    ),
    dict(
        sku="h3", category="home",
        name="Prestige Iris 750W Mixer Grinder — 3 Jars",
        description="750W motor for heavy-duty grinding. 3 stainless steel jars. ISI approved.",
        price=2499, original_price=4500, stock=55, badge="44% off",
        colors=["White/Blue", "White/Red"], sizes=[],
        images=["https://picsum.photos/seed/mixer-main/600/600",
                "https://picsum.photos/seed/mixer-2/600/600",
                "https://picsum.photos/seed/mixer-3/600/600"],
        specs={"Brand": "Prestige", "Power": "750W",
               "Jars": "3 (1.5L, 1L, 0.4L)", "Material": "Stainless Steel",
               "Speed": "3 speeds + pulse", "Warranty": "2 Years"},
        rating=4.4, review_count=28901,
    ),
    # ── Beauty ────────────────────────────────────────────────
    dict(
        sku="b1", category="beauty",
        name="L'Oréal Paris Elvive Extraordinary Oil Shampoo",
        description="Infused with 6 rare flower oils. Transforms dry, dull hair. Sulfate-free formula.",
        price=399, original_price=580, stock=180, badge="Deal of the Day",
        colors=[], sizes=["175ml", "340ml", "680ml"],
        images=["https://picsum.photos/seed/shampoo-main/600/600",
                "https://picsum.photos/seed/shampoo-2/600/600",
                "https://picsum.photos/seed/shampoo-3/600/600"],
        specs={"Brand": "L'Oréal Paris", "Type": "Shampoo",
               "Key Ingredient": "Flower Oil Blend",
               "Hair Type": "Dry & Dull",
               "Sulfate-free": "Yes", "Quantity": "340ml"},
        rating=4.3, review_count=15670,
    ),
    dict(
        sku="b2", category="beauty",
        name="Maybelline Fit Me Matte+Poreless Foundation",
        description="Matte + poreless finish that controls shine all day. 40 shades. SPF 22 protection.",
        price=499, original_price=799, stock=95, badge="Fan Favourite",
        colors=["110 Porcelain", "120 Classic Ivory", "128 Warm Nude", "220 Natural Beige"],
        sizes=["18ml", "30ml"],
        images=["https://picsum.photos/seed/foundation-main/600/600",
                "https://picsum.photos/seed/foundation-2/600/600",
                "https://picsum.photos/seed/foundation-3/600/600"],
        specs={"Brand": "Maybelline", "Finish": "Matte",
               "Coverage": "Medium to Full", "SPF": "22",
               "Skin Type": "Normal to Oily", "Quantity": "30ml"},
        rating=4.4, review_count=31044,
    ),
]


# ════════════════════════════════════════════════════════════════
FASHION_CATALOG = [
    dict(sku="f1", category="fashion", name="Girls Cotton Anarkali Kurti",
         description="Soft printed cotton Anarkali kurti for festive days and everyday Indian style.",
         price=899, original_price=1299, stock=60, badge="Indian Edit",
         colors=["Pink", "Yellow", "Sky Blue"], sizes=["4Y", "6Y", "8Y", "10Y", "12Y"],
         images=["https://picsum.photos/seed/girls-anarkali/600/600"],
         specs={"Fabric": "Cotton", "Style": "Indian ethnic wear", "Fit": "Comfort fit"}, rating=4.8, review_count=124),
    dict(sku="f2", category="fashion", name="Girls Printed Cotton T-Shirt",
         description="Breathable cotton T-shirt with a bright Indian-inspired print for everyday wear.",
         price=499, original_price=699, stock=90, badge="Everyday Favourite",
         colors=["Peach", "Mint", "Lavender"], sizes=["4Y", "6Y", "8Y", "10Y", "12Y"],
         images=["https://picsum.photos/seed/girls-tshirt/600/600"],
         specs={"Fabric": "100% Cotton", "Sleeve": "Short sleeve", "Care": "Machine wash"}, rating=4.7, review_count=98),
    dict(sku="f3", category="fashion", name="Girls Slim Fit Denim Jeans",
         description="Stretch denim jeans designed for comfortable movement, play, and everyday outfits.",
         price=799, original_price=1199, stock=75, badge="New",
         colors=["Indigo", "Black", "Light Blue"], sizes=["4Y", "6Y", "8Y", "10Y", "12Y"],
         images=["https://picsum.photos/seed/girls-jeans/600/600"],
         specs={"Fabric": "Stretch denim", "Fit": "Slim fit", "Closure": "Button and zip"}, rating=4.6, review_count=86),
    dict(sku="f4", category="fashion", name="Girls Embroidered Kurti Set",
         description="Colourful Indian kurti set with delicate embroidery and matching palazzo pants.",
         price=1199, original_price=1799, stock=45, badge="Festive Pick",
         colors=["Red", "Turquoise", "Mustard"], sizes=["4Y", "6Y", "8Y", "10Y", "12Y"],
         images=["https://picsum.photos/seed/girls-kurti-set/600/600"],
         specs={"Fabric": "Rayon", "Includes": "Kurti and palazzo", "Style": "Festive Indian wear"}, rating=4.9, review_count=73),
    dict(sku="f5", category="fashion", name="Women’s Everyday Co-ord Set",
         description="Relaxed cotton co-ord set with a clean silhouette for travel, errands, and easy weekends.",
         price=1099, original_price=1599, stock=55, badge="Bestseller",
         colors=["Olive", "Black", "Beige"], sizes=["S", "M", "L", "XL", "XXL"],
         images=["https://picsum.photos/seed/womens-coord/600/600"],
         specs={"Fabric": "Cotton", "Gender": "Women", "Occasion": "Casual", "Fit": "Relaxed"}, rating=4.7, review_count=441),
    dict(sku="f6", category="fashion", name="Women’s Floral Midi Dress",
         description="Lightweight floral midi dress with a comfortable waist and soft everyday drape.",
         price=899, original_price=1399, stock=38, badge="New arrival",
         colors=["Blue", "Pink", "Green"], sizes=["S", "M", "L", "XL"],
         images=["https://picsum.photos/seed/floral-midi/600/600"],
         specs={"Fabric": "Rayon", "Gender": "Women", "Occasion": "Casual", "Sleeve": "Short sleeve"}, rating=4.6, review_count=192),
    dict(sku="f7", category="fashion", name="Men’s Slim Fit Oxford Shirt",
         description="Crisp cotton Oxford shirt with a versatile fit for workdays and evenings out.",
         price=799, original_price=1199, stock=72, badge="Top rated",
         colors=["White", "Sky Blue", "Navy"], sizes=["S", "M", "L", "XL", "XXL"],
         images=["https://picsum.photos/seed/oxford-shirt/600/600"],
         specs={"Fabric": "Cotton", "Gender": "Men", "Occasion": "Workwear", "Fit": "Slim fit"}, rating=4.8, review_count=357),
    dict(sku="f8", category="fashion", name="Men’s Tapered Stretch Jeans",
         description="Comfort stretch denim with a modern tapered leg and five-pocket construction.",
         price=999, original_price=1699, stock=61, badge="Deal of the day",
         colors=["Dark Blue", "Black", "Mid Blue"], sizes=["28", "30", "32", "34", "36"],
         images=["https://picsum.photos/seed/tapered-jeans/600/600"],
         specs={"Fabric": "Stretch denim", "Gender": "Men", "Fit": "Tapered", "Rise": "Mid rise"}, rating=4.5, review_count=284),
    dict(sku="f9", category="fashion", name="Men’s Lightweight Hooded Jacket",
         description="Layer-ready lightweight jacket with a hood and secure zip pockets for changing weather.",
         price=1299, original_price=2199, stock=29, badge="Winter edit",
         colors=["Black", "Olive", "Charcoal"], sizes=["M", "L", "XL", "XXL"],
         images=["https://picsum.photos/seed/hooded-jacket/600/600"],
         specs={"Fabric": "Polyester", "Gender": "Men", "Occasion": "Outdoor", "Water resistant": "Yes"}, rating=4.4, review_count=117),
    dict(sku="f10", category="fashion", name="Classic Kanjivaram Saree",
         description="Festive saree-inspired edit with a rich border and an elegant drape for celebrations.",
         price=1899, original_price=2999, stock=18, badge="Festive favourite",
         colors=["Maroon", "Royal Blue", "Green"], sizes=["Free Size"],
         images=["https://picsum.photos/seed/kanjivaram-saree/600/600"],
         specs={"Fabric": "Silk blend", "Gender": "Women", "Occasion": "Festive", "Includes": "Unstitched saree"}, rating=4.9, review_count=88),
    dict(sku="f11", category="fashion", name="Women’s Everyday Running Shoes",
         description="Cushioned everyday sneakers with a breathable upper for walks, commutes, and casual looks.",
         price=1199, original_price=1899, stock=44, badge="Comfort pick",
         colors=["White", "Black", "Pink"], sizes=["36", "37", "38", "39", "40"],
         images=["https://picsum.photos/seed/running-shoes/600/600"],
         specs={"Material": "Mesh", "Gender": "Women", "Occasion": "Athleisure", "Sole": "EVA"}, rating=4.6, review_count=246),
    dict(sku="f12", category="fashion", name="Structured Vegan Leather Tote Bag",
         description="Roomy structured tote with an inner pocket and polished everyday styling.",
         price=899, original_price=1499, stock=33, badge="Editor's pick",
         colors=["Tan", "Black", "Burgundy"], sizes=["One Size"],
         images=["https://picsum.photos/seed/tote-bag/600/600"],
         specs={"Material": "Vegan leather", "Gender": "Women", "Occasion": "Everyday", "Capacity": "Large"}, rating=4.7, review_count=163),
]


#   APP LIFESPAN (startup / shutdown)
# ════════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Create tables ──────────────────────────────────────────
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Seed admin user ────────────────────────────────────
        admin_email = os.getenv("ADMIN_EMAIL", "admin@madhavfashionstudio.com")
        admin_pass  = os.getenv("ADMIN_PASSWORD", "admin123")
        if not db.query(User).filter(User.email == admin_email).first():
            db.add(User(
                name="Admin",
                email=admin_email,
                hashed_password=hash_password(admin_pass),
                role=UserRole.admin,
            ))
            print(f"✓ Admin created — email: {admin_email}  password: {admin_pass}")

        # ── Seed products (only if table is empty) ─────────────
        customer_email = os.getenv("CUSTOMER_EMAIL", "customer@madhavfashionstudio.com")
        customer_pass = os.getenv("CUSTOMER_PASSWORD", "customer123")
        if not db.query(User).filter(User.email == customer_email).first():
            db.add(User(
                name="Demo Customer",
                email=customer_email,
                hashed_password=hash_password(customer_pass),
                role=UserRole.customer,
            ))
            print(f"Demo customer created - email: {customer_email} password: {customer_pass}")

        seller_email = os.getenv("SELLER_EMAIL", "seller@madhavfashionstudio.com")
        seller_pass = os.getenv("SELLER_PASSWORD", "seller123")
        if not db.query(User).filter(User.email == seller_email).first():
            db.add(User(
                name="Demo Fashion Seller",
                email=seller_email,
                hashed_password=hash_password(seller_pass),
                role=UserRole.seller,
            ))
            print(f"Demo seller created - email: {seller_email} password: {seller_pass}")

        # Keep the live shop focused on girls' Indian clothing, T-shirts, and jeans.
        allowed_skus = {item["sku"] for item in FASHION_CATALOG}
        for product in db.query(Product).all():
            if product.sku not in allowed_skus:
                product.is_active = False
        for item in FASHION_CATALOG:
            product = db.query(Product).filter(Product.sku == item["sku"]).first()
            if product:
                for field, value in item.items():
                    setattr(product, field, value)
                product.is_active = True
            else:
                db.add(Product(**item))

        if db.query(Product).count() == 0:
            for p in SEED_PRODUCTS:
                db.add(Product(**p))
            print(f"✓ Seeded {len(SEED_PRODUCTS)} products")

        db.commit()
    finally:
        db.close()

    print("✓ Madhav Fashion Studio API ready  →  http://localhost:8010/docs")
    yield
    # nothing to clean up for SQLite


# ════════════════════════════════════════════════════════════════
#   APP INSTANCE
# ════════════════════════════════════════════════════════════════
app = FastAPI(
    title="Madhav Fashion Studio API",
    description=(
        "REST backend for the Madhav Fashion Studio commerce platform.\n\n"
        "**Default admin credentials:**  `admin@madhavfashionstudio.com` / `admin123`\n\n"
        "Use **POST /api/auth/login** to get a JWT, then click **Authorize** "
        "and paste `Bearer <token>` to access admin endpoints."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow store.html and admin.html (opened as file://) ──
ALLOWED_ORIGINS = [
    "http://localhost:3000",    # Next.js default
    "http://localhost:4028",    # Madhav storefront
    "http://127.0.0.1:4028",
    "http://localhost:8000",    # self
    "http://127.0.0.1:8000",
    "http://localhost:5500",    # Live Server (VS Code)
    "http://127.0.0.1:5500",
    "null",                     # file:// origin
]
extra = os.getenv("CORS_ORIGINS", "")
if extra:
    ALLOWED_ORIGINS += [o.strip() for o in extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(recommendations.router)
app.include_router(search.router)

# ── Health check ───────────────────────────────────────────────
@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "Madhav Fashion Studio API is running"}

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8010,
        reload=True,
    )
