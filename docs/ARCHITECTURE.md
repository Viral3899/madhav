# Madhav Fashion Studio Marketplace Architecture

This document defines the production path for the Amazon-style fashion marketplace. The current repository is a modular monolith with Next.js, FastAPI, SQLAlchemy, and SQLite. It already provides a fashion catalogue, JWT accounts, seller/admin entry points, cart, wishlist, checkout, stock validation, reviews, currency selection, settings, and order history. The production services below should be introduced incrementally, not simulated in the browser.

## Platform Baseline

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, accessible responsive UI.
- API: FastAPI with Pydantic validation, JWT access tokens, SQLAlchemy repositories.
- Production data: PostgreSQL for transactions, Redis for sessions/cache/rate limits, object storage plus CDN for media.
- Events: SQS/SNS initially; Kafka only when event volume and replay requirements justify its operational cost.
- Observability: structured JSON logs, OpenTelemetry traces, Prometheus metrics, alerting, and an immutable audit stream.

## 1. Authentication and Authorization

**Models and APIs:** `User`, `Role`, `Session`, `Address`, `MfaChallenge`, `AuditEvent`; `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET/PATCH /auth/me`, `POST /auth/mfa/*`. Roles are guest, customer, seller, and admin.

**Choice:** OIDC provider for Google login and MFA, short-lived JWT access tokens plus rotating refresh tokens in secure httpOnly cookies. Do not build SSO to AWS, Prime, or Alexa; those belong to separate Amazon-owned identity systems.

**Scale and failure handling:** Stateless API verification scales horizontally. Revoke refresh-token families on reuse, rate-limit login by IP and account, use Argon2id for local passwords, and log every role change. Current local JWT login is the development implementation.

## 2. Fashion Catalog and Search

**Models and APIs:** `Product`, `Variant`, `SKU`, `Brand`, `Category`, `Attribute`, `Media`, `Inventory`; `GET /products`, `GET /products/{id}`, `GET /categories`, `GET /search/suggest`. A fashion product owns variants; each variant owns SKU, size, colour, fabric, price, and stock.

**Choice:** PostgreSQL remains the source of truth; OpenSearch provides denormalized full-text and faceted search. S3-compatible storage plus an image worker produces WebP/AVIF thumbnails and responsive CDN URLs.

**Scale and failure handling:** index updates are asynchronous and idempotent. If search is unavailable, fall back to a bounded database query. Version documents, reject stale inventory writes, and never trust search stock for checkout.

## 3. Recommendation Engine

**Models and APIs:** `Event`, `UserProfile`, `ProductEmbedding`, `Recommendation`; `POST /events`, `GET /recommendations`, `GET /products/{id}/similar`. Track views, searches, add-to-cart, purchase, dwell time, and dismissals with consent.

**Choice:** Start with popularity by department plus content similarity from product attributes. Add item-to-item collaborative filtering offline, then a feature store and model serving only after enough event volume exists.

**Scale and failure handling:** event ingestion is append-only and queued. Cache recommendations by user and context. Always fall back to trending fashion and never block product pages on ML.

## 4. Cart and Checkout

**Models and APIs:** `Cart`, `CartItem`, `GuestCart`, `Address`, `Coupon`, `ShippingQuote`; `GET/PUT /cart`, `POST /cart/items`, `PATCH /cart/items/{id}`, `POST /cart/merge`, `POST /checkout/quote`, `POST /checkout/confirm`.

**Choice:** Redis for active carts with PostgreSQL snapshots for signed-in customers. Merge guest and customer carts by SKU/variant on login. Keep the current multi-step address, shipping, payment, confirmation flow and move validation server-side.

**Scale and failure handling:** use idempotency keys for checkout, calculate totals from current product prices, reserve stock before payment capture, and expire abandoned reservations. Never store card data.

## 5. Payments

**Models and APIs:** `PaymentIntent`, `PaymentMethodToken`, `Refund`, `FraudDecision`; `POST /payments/intents`, `POST /payments/confirm`, `POST /payments/webhook`, `POST /refunds`.

**Choice:** Razorpay/Stripe/Adyen hosted components for cards, UPI, wallets, and COD rules. Tokenization stays with the provider; the app stores only provider IDs and status. The current card form is explicitly mock-only.

**Scale and failure handling:** webhook processing is signed, idempotent, and retried. Orders become paid only from verified provider events. Use velocity, amount, device, and address signals for fraud review; send uncertain cases to manual review.

## 6. Order Management

**Models and APIs:** `Order`, `OrderItem`, `OrderStateEvent`, `Shipment`, `Return`, `Refund`; `POST /orders`, `GET /orders/mine`, `GET /orders/{id}`, `POST /orders/{id}/cancel`, `POST /orders/{id}/return`.

**Choice:** PostgreSQL transaction for the order plus an outbox table. Publish `OrderPlaced`, `PaymentCaptured`, `Packed`, `Shipped`, `Delivered`, and `ReturnRequested` events to SQS/SNS.

**Scale and failure handling:** state transitions are explicit and validated. Consumers are idempotent, dead-lettered, and replayable. Split multi-seller carts into fulfillment groups but preserve one customer-facing order.

## 7. Inventory and Warehouse

**Models and APIs:** `InventoryItem`, `Warehouse`, `StockReservation`, `SellerStock`; `GET /inventory`, `POST /inventory/reserve`, `POST /inventory/release`, `PATCH /inventory/{sku}`.

**Choice:** PostgreSQL row version or atomic conditional update for the source of truth; Redis is only a read cache. Select the nearest warehouse that can fulfill all eligible lines, otherwise split shipments.

**Scale and failure handling:** reserve with `available >= quantity` in one transaction, release reservations on timeout, reconcile against warehouse feeds, and alert on negative or low stock. Current checkout already validates and deducts stock server-side.

## 8. Seller Marketplace

**Models and APIs:** `Seller`, `SellerVerification`, `TaxProfile`, `BankAccountToken`, `SellerProduct`, `Commission`, `Payout`; `POST /sellers/onboard`, `GET/PATCH /seller/profile`, `POST /seller/products`, `POST /seller/imports`, `GET /seller/orders`, `GET /seller/payouts`.

**Choice:** KYC and payout providers own sensitive verification. Seller data is tenant-scoped. Bulk imports run as jobs with row-level error reports. The current seller dashboard is a local catalogue view and should be extended with ownership and payout permissions before production.

**Scale and failure handling:** isolate seller access by `seller_id`, rate-limit imports, validate every SKU, and make payout jobs idempotent. Never allow a seller to update another seller's listing.

## 9. Pricing and Promotions

**Models and APIs:** `Price`, `Promotion`, `Coupon`, `PromotionRule`, `BuyBoxSnapshot`; `GET /offers`, `POST /coupons/validate`, `POST /admin/promotions`, `GET /products/{id}/buy-box`.

**Choice:** deterministic rules engine first; store effective periods and priority. Competitor pricing must use permitted feeds, not fragile scraping. Buy Box scoring combines landed price, seller quality, inventory, and delivery promise.

**Scale and failure handling:** cache read-only offer results with short TTLs, version rules, cap discount stacking, and recalculate at checkout. Never trust a client-supplied discount.

## 10. Reviews and Ratings

**Models and APIs:** `Review`, `ReviewMedia`, `ReviewVote`, `ModerationCase`, `Question`, `Answer`; `GET/POST /products/{id}/reviews`, `POST /reviews/{id}/helpful`, `POST /reviews/{id}/report`, `GET/POST /products/{id}/questions`.

**Choice:** accept text and media after upload scanning. Mark verified purchase by matching a delivered order item. Start with rules and a moderation queue; add NLP classification only with human appeal.

**Scale and failure handling:** aggregate ratings asynchronously, paginate reviews, throttle votes, and keep moderation decisions auditable.

## 11. Notifications

**Models and APIs:** `Notification`, `Template`, `DeliveryAttempt`, `Preference`; `GET /notifications`, `PATCH /notifications/{id}/read`, internal `POST /notifications/send`.

**Choice:** provider adapters for SES/email, SNS or Twilio/SMS, FCM push, and WhatsApp. Publish order events once and fan out through workers.

**Scale and failure handling:** retry with exponential backoff, dead-letter permanently failing messages, deduplicate by event ID, and respect channel consent and quiet hours.

## 12. Logistics and Tracking

**Models and APIs:** `Shipment`, `Carrier`, `TrackingEvent`, `DeliveryAttempt`, `ProofOfDelivery`; `POST /shipments`, `GET /shipments/{id}/tracking`, carrier webhooks.

**Choice:** carrier aggregator first, direct UPS/FedEx/Indian carrier integrations later. Persist normalized tracking states and carrier raw payloads separately.

**Scale and failure handling:** webhook signatures and idempotency keys are mandatory. Tracking is eventually consistent; show last update time and a support fallback instead of inventing GPS data.

## 13. Analytics and Reporting

**Models and APIs:** `ClickstreamEvent`, `OrderFact`, `SellerMetric`, `CustomerMetric`; `GET /analytics/seller`, `GET /analytics/admin`, scheduled exports.

**Choice:** transactional PostgreSQL emits events to a warehouse through Kinesis or an equivalent stream. Use dbt-style transformations and a BI tool for dashboards; keep operational queries out of the warehouse.

**Scale and failure handling:** events are immutable, schema-versioned, partitioned, and replayable. Strip or hash PII before analytics storage and monitor event lag.

## 14. API Layer and Integrations

**Models and APIs:** versioned REST at `/api/v1`, optional GraphQL read gateway, webhook registrations, API keys, and rate-limit buckets.

**Choice:** keep FastAPI REST as the internal boundary now. Add GraphQL only when clients need flexible read composition. Generate OpenAPI clients and require idempotency for mutations.

**Scale and failure handling:** gateway rate limits by identity and endpoint, validates payload size, times out downstream calls, and uses circuit breakers. Webhooks are signed, replay-protected, and observable.

## 15. Security and Compliance

**Controls:** TLS, secure cookies, CSRF protection for cookie-auth mutations, strict CORS, CSP, input validation, parameterized SQL, dependency scanning, secrets manager, audit logs, WAF, bot controls, backups, and restore drills.

**Privacy:** data export/deletion workflows, retention policies, consent records, PII minimization, and field-level access auditing. GDPR/CCPA obligations depend on the markets served and require legal review.

**Failure handling:** deny by default, fail closed for authorization and payment webhooks, alert on anomalous login/order behavior, rotate secrets, and test incident response.

## Delivery Order

1. Move SQLite to PostgreSQL and add migrations, refresh-token rotation, rate limiting, and automated tests.
2. Finish seller ownership, product editing, addresses, coupons, returns, and notification preferences.
3. Integrate one payment provider and one carrier with webhooks and idempotency.
4. Add Redis carts, object storage/CDN media processing, and OpenSearch indexing.
5. Add event outbox, analytics warehouse, recommendation jobs, and operational observability.
6. Split services only when independent scaling or ownership justifies the network and deployment complexity.

