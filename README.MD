# Madhav Fashion Studio

Madhav Fashion Studio is a full-stack marketplace application with an Amazon-inspired shopping experience: department browsing, search, deals, catalogue, checkout, authentication, inventory, reviews, orders, and admin operations.

## Stack

- Next.js 15, React 19, TypeScript, and Tailwind CSS
- FastAPI with SQLAlchemy and MySQL (SQLite fallback for quick local development)
- JWT authentication with customer and admin roles
- REST API documented automatically at `/docs`

## Features

- Marketplace home page with search-first navigation, department cards, deals, product rails, responsive navigation, cart drawer, and checkout
- Fashion-only catalogue spanning women, men, kids, ethnic wear, western wear, footwear, bags, and accessories
- Live product search, department/price/size/colour filters, sorting, pricing, stock, sale badges, ratings, and product detail pages
- Customer registration, login, logout, and persistent browser sessions
- Persistent guest cart with variant-aware add-to-cart and checkout handoff
- Guest checkout and authenticated customers
- Server-side stock validation, order creation, shipping calculation, and inventory deduction
- Product reviews and automatic rating recalculation
- Admin product creation, editing, soft deletion, stock updates, order status updates, user management, and dashboard statistics

The current implementation is a modular monolith designed to be split into the listed services as traffic and team size grow. Payments are intentionally mocked in development; connect a PCI-compliant provider before production use.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full module-by-module production architecture, data models, API boundaries, scaling decisions, failure handling, and delivery order.

## Roadmap to Production

This project is a functional ecommerce MVP. Use the following order to develop it toward a large-scale marketplace:

### 1. Production Foundation

- [ ] Move the database from SQLite to PostgreSQL.
- [ ] Add Alembic database migrations.
- [ ] Add automated backend, frontend, and end-to-end tests.
- [ ] Replace development secrets and demo credentials before deployment.
- [ ] Add rate limiting, secure cookies, CSRF protection, strict CORS, and security headers.
- [ ] Configure backups, restore testing, structured logs, metrics, and error alerts.

### 2. Real Payments and Orders

- [ ] Integrate Razorpay, Stripe, or another PCI-compliant payment provider.
- [ ] Add signed, idempotent payment webhooks.
- [ ] Add payment failure, refund, cancellation, and retry handling.
- [ ] Add saved customer addresses and delivery options.
- [ ] Add coupons, taxes, invoices, and return workflows.

### 3. Marketplace and Seller Operations

- [ ] Add strict seller ownership using `seller_id` on products, orders, and reports.
- [ ] Add seller verification, KYC, commission, and payout workflows.
- [ ] Add product approval and catalogue moderation.
- [ ] Add bulk product import with row-level validation errors.
- [ ] Add multiple seller offers and Buy Box selection.

### 4. Catalogue, Search, and Media

- [ ] Add proper brands, categories, attributes, variants, and SKU management.
- [ ] Use OpenSearch for full-text search, autocomplete, filters, and ranking.
- [ ] Store product media in object storage such as S3 with CDN delivery.
- [ ] Add image resizing, WebP/AVIF conversion, and upload scanning.
- [ ] Add verified-purchase reviews, review moderation, questions, and answers.

### 5. Inventory, Shipping, and Delivery

- [ ] Add warehouses, stock reservations, and reservation expiry.
- [ ] Add split shipments and fulfilment groups for multi-seller orders.
- [ ] Integrate a carrier or aggregator such as Shiprocket, Delhivery, FedEx, or DHL.
- [ ] Add shipment tracking and signed carrier webhooks.
- [ ] Add delivery estimates, return pickup, and proof of delivery.

### 6. Scale and Customer Experience

- [ ] Add Redis for carts, sessions, caching, and rate limits.
- [ ] Add background workers and an outbox/event system for order processing.
- [ ] Add email, SMS, WhatsApp, and push notifications.
- [ ] Add analytics, recommendations, fraud detection, and customer support tools.
- [ ] Load-test critical flows such as search, cart, checkout, and order creation.

### 7. Deployment and Launch

- [ ] Deploy the Next.js frontend and FastAPI backend separately.
- [ ] Use managed PostgreSQL, Redis, object storage, and search infrastructure.
- [ ] Configure a production domain, HTTPS, environment variables, and CI/CD.
- [ ] Add health checks, monitoring dashboards, alerting, and incident procedures.
- [ ] Run a security review, backup restore test, and production readiness review.

### Recommended Delivery Order

1. PostgreSQL, migrations, secrets, security controls, and tests.
2. Real payments, webhooks, refunds, and order state management.
3. Seller ownership, verification, commissions, and payouts.
4. Returns, shipping integration, tracking, and notifications.
5. Redis, CDN media, OpenSearch, and background workers.
6. Analytics, recommendations, fraud detection, and load testing.

Do not use Amazon branding, logos, copied content, or claim to be Amazon. Build these capabilities under the Madhav Fashion Studio brand.

## Run Locally

### 1. Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:4028`.

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8010
```

The API is available at `http://localhost:8010`, with interactive documentation at `http://localhost:8010/docs`.

The backend creates tables, demo products, and default development accounts on first startup. SQLite creates `backend/shopzone.db`; MySQL uses the configured `DATABASE_URL`:

- Email: `admin@madhavfashionstudio.com`
- Password: `admin123`

Development customer login:

- Email: `customer@madhavfashionstudio.com`
- Password: `customer123`

Development seller login:

- Email: `seller@madhavfashionstudio.com`
- Password: `seller123`

Development admin login:

- Email: `admin@madhavfashionstudio.com`
- Password: `admin123`

These demo credentials are for local development only. Change all passwords and `SECRET_KEY` before deployment.

## Currency

The storefront supports `INR` (default), `USD`, `EUR`, `GBP`, and `AED`. Use the currency selector in the marketplace header; displayed conversions are local demo rates and should be replaced with a live FX service for production billing.

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SECRET_KEY` before production use.

Customer accounts and shop-holder accounts use separate flows. Customers use `/customer-login`. Shop holders use `/shop-holder`, then manage products from `/seller`. Set `ADMIN_SIGNUP_KEY` in the backend environment; the registration screen uses `madhav-shop-holder-setup` by default for local development, which must be replaced before deployment.

## Configuration

### MySQL

Create a database and user, then set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=mysql+pymysql://madhav_user:password@127.0.0.1:3306/madhav_fashion
```

Install backend dependencies with `pip install -r requirements.txt`. The SQLAlchemy models work with both MySQL and the local SQLite fallback. Use migrations before changing an existing production schema.

Set `NEXT_PUBLIC_API_URL` when the API is not running at `http://localhost:8010/api`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8010/api
NEXT_PUBLIC_SITE_URL=http://localhost:4028
```

The checkout currently records orders and uses a mock payment form. Connect a payment provider before accepting real payments, and never store raw card details.

## Search and Recommendations

The API exposes `GET /api/recommendations` and `GET /api/recommendations?product_id=16` for fashion recommendations. It uses product attributes, colour overlap, ratings, price proximity, and popularity as a deterministic fallback. `POST /api/search/reindex` indexes active products into OpenSearch when `OPENSEARCH_URL` is configured; otherwise product search safely falls back to the SQL database. The homepage displays a live “Recommended for you” rail.

## Main API Routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/{id}`, reviews, and admin product mutations
- `POST /api/orders`, order lookup, admin order listing and status changes
- `GET /api/admin/stats`, user listing, and user updates

## Project Layout

```text
src/app/                 Next.js pages and storefront sections
src/components/          Header, footer, cart, auth, and shared UI
src/context/             Cart and authentication state
src/lib/api.ts           Typed frontend API client
backend/routes/          Auth, products, orders, and admin endpoints
backend/models.py        SQLAlchemy data models
backend/shopzone.db      Local SQLite fallback database
```
