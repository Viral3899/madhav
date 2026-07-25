-- =============================================================================
-- Madhav Fashion Studio — MySQL Database Setup Script
-- =============================================================================
-- Run this script to create the database, tables, indexes, and seed data.
-- Usage:
--   mysql -u root -p < database_setup.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS madhav_fashion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE madhav_fashion;

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(200)    NOT NULL UNIQUE,
    hashed_password VARCHAR(256)    NOT NULL,
    role            ENUM('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- =============================================================================
-- PRODUCTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    sku             VARCHAR(60)     NOT NULL UNIQUE,
    name            VARCHAR(300)    NOT NULL,
    description     TEXT,
    category        VARCHAR(80)     NOT NULL,
    price           DECIMAL(12,2)   NOT NULL,
    original_price  DECIMAL(12,2)   DEFAULT NULL,
    stock           INT             NOT NULL DEFAULT 0,
    badge           VARCHAR(60)     DEFAULT NULL,
    colors          JSON            DEFAULT NULL,
    sizes           JSON            DEFAULT NULL,
    images          JSON            DEFAULT NULL,
    specs           JSON            DEFAULT NULL,
    rating          DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
    review_count    INT             NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_products_sku (sku),
    INDEX idx_products_name (name),
    INDEX idx_products_category (category),
    INDEX idx_products_price (price),
    INDEX idx_products_rating (rating),
    INDEX idx_products_active (is_active),
    FULLTEXT INDEX idx_products_fulltext (name, description)
) ENGINE=InnoDB;

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             DEFAULT NULL,
    status          ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
                                    NOT NULL DEFAULT 'pending',
    email           VARCHAR(200)    NOT NULL,
    first_name      VARCHAR(120)    NOT NULL,
    last_name       VARCHAR(120)    NOT NULL,
    address         VARCHAR(300)    NOT NULL,
    city            VARCHAR(120)    NOT NULL,
    state           VARCHAR(120)    NOT NULL,
    zip_code        VARCHAR(20)     NOT NULL,
    country         VARCHAR(80)     NOT NULL DEFAULT 'India',
    subtotal        DECIMAL(12,2)   NOT NULL,
    shipping_cost   DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    total           DECIMAL(12,2)   NOT NULL,
    notes           TEXT            DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- ORDER ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    order_id        INT             NOT NULL,
    product_id      INT             NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2)   NOT NULL,
    color           VARCHAR(80)     DEFAULT NULL,
    size            VARCHAR(40)     DEFAULT NULL,

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- REVIEWS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    product_id      INT             NOT NULL,
    user_id         INT             DEFAULT NULL,
    reviewer_name   VARCHAR(120)    NOT NULL,
    rating          TINYINT         NOT NULL COMMENT 'Rating 1-5',
    comment         TEXT,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_rating (rating),
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
    CONSTRAINT chk_review_rating  CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

-- =============================================================================
-- CARTS TABLE (for persistent carts — optional, Redis is recommended in prod)
-- =============================================================================
CREATE TABLE IF NOT EXISTS carts (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             DEFAULT NULL,
    session_id      VARCHAR(128)    DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_carts_user (user_id),
    INDEX idx_carts_session (session_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- CART ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    cart_id         INT             NOT NULL,
    product_id      INT             NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    color           VARCHAR(80)     DEFAULT NULL,
    size            VARCHAR(40)     DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_product (product_id),
    CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id)   ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- WISHLIST TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    product_id      INT             NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_wishlist_user_product (user_id, product_id),
    INDEX idx_wishlist_user (user_id),
    CONSTRAINT fk_wishlist_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- ADDRESSES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS addresses (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    label           VARCHAR(60)     DEFAULT 'Home',
    first_name      VARCHAR(120)    NOT NULL,
    last_name       VARCHAR(120)    NOT NULL,
    address_line1   VARCHAR(300)    NOT NULL,
    address_line2   VARCHAR(300)    DEFAULT NULL,
    city            VARCHAR(120)    NOT NULL,
    state           VARCHAR(120)    NOT NULL,
    zip_code        VARCHAR(20)     NOT NULL,
    country         VARCHAR(80)     NOT NULL DEFAULT 'India',
    phone           VARCHAR(20)     DEFAULT NULL,
    is_default      TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_addresses_user (user_id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- SEED DATA — Users
-- =============================================================================
-- Passwords are hashed with bcrypt (hash algorithm used by passlib).
-- The plain-text equivalents are listed in the README for local dev only.

INSERT INTO users (name, email, hashed_password, role, is_active) VALUES
    ('Admin',              'admin@madhavfashionstudio.com',    '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Q5q5p5q5p5q5p5q5p5q5p5q5p5O', 'admin',    1),
    ('Demo Customer',      'customer@madhavfashionstudio.com', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Q5q5p5q5p5q5p5q5p5q5p5q5p5O', 'customer', 1),
    ('Demo Fashion Seller','seller@madhavfashionstudio.com',   '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Q5q5p5q5p5q5p5q5p5q5p5q5p5O', 'seller',   1)
ON DUPLICATE KEY UPDATE name=name;

-- =============================================================================
-- SEED DATA — Products (Fashion Catalogue)
-- =============================================================================
INSERT INTO products (sku, name, description, category, price, original_price, stock, badge, colors, sizes, images, specs, rating, review_count) VALUES
('f1', 'Girls Cotton Anarkali Kurti',
 'Soft printed cotton Anarkali kurti for festive days and everyday Indian style.',
 'fashion', 899, 1299, 60, 'Indian Edit',
 JSON_ARRAY('Pink', 'Yellow', 'Sky Blue'),
 JSON_ARRAY('4Y', '6Y', '8Y', '10Y', '12Y'),
 JSON_ARRAY('https://picsum.photos/seed/girls-anarkali/600/600'),
 JSON_OBJECT('Fabric', 'Cotton', 'Style', 'Indian ethnic wear', 'Fit', 'Comfort fit'),
 4.8, 124),

('f2', 'Girls Printed Cotton T-Shirt',
 'Breathable cotton T-shirt with a bright Indian-inspired print for everyday wear.',
 'fashion', 499, 699, 90, 'Everyday Favourite',
 JSON_ARRAY('Peach', 'Mint', 'Lavender'),
 JSON_ARRAY('4Y', '6Y', '8Y', '10Y', '12Y'),
 JSON_ARRAY('https://picsum.photos/seed/girls-tshirt/600/600'),
 JSON_OBJECT('Fabric', '100% Cotton', 'Sleeve', 'Short sleeve', 'Care', 'Machine wash'),
 4.7, 98),

('f3', 'Girls Slim Fit Denim Jeans',
 'Stretch denim jeans designed for comfortable movement, play, and everyday outfits.',
 'fashion', 799, 1199, 75, 'New',
 JSON_ARRAY('Indigo', 'Black', 'Light Blue'),
 JSON_ARRAY('4Y', '6Y', '8Y', '10Y', '12Y'),
 JSON_ARRAY('https://picsum.photos/seed/girls-jeans/600/600'),
 JSON_OBJECT('Fabric', 'Stretch denim', 'Fit', 'Slim fit', 'Closure', 'Button and zip'),
 4.6, 86),

('f4', 'Girls Embroidered Kurti Set',
 'Colourful Indian kurti set with delicate embroidery and matching palazzo pants.',
 'fashion', 1199, 1799, 45, 'Festive Pick',
 JSON_ARRAY('Red', 'Turquoise', 'Mustard'),
 JSON_ARRAY('4Y', '6Y', '8Y', '10Y', '12Y'),
 JSON_ARRAY('https://picsum.photos/seed/girls-kurti-set/600/600'),
 JSON_OBJECT('Fabric', 'Rayon', 'Includes', 'Kurti and palazzo', 'Style', 'Festive Indian wear'),
 4.9, 73),

('f5', 'Women''s Everyday Co-ord Set',
 'Relaxed cotton co-ord set with a clean silhouette for travel, errands, and easy weekends.',
 'fashion', 1099, 1599, 55, 'Bestseller',
 JSON_ARRAY('Olive', 'Black', 'Beige'),
 JSON_ARRAY('S', 'M', 'L', 'XL', 'XXL'),
 JSON_ARRAY('https://picsum.photos/seed/womens-coord/600/600'),
 JSON_OBJECT('Fabric', 'Cotton', 'Gender', 'Women', 'Occasion', 'Casual', 'Fit', 'Relaxed'),
 4.7, 441),

('f6', 'Women''s Floral Midi Dress',
 'Lightweight floral midi dress with a comfortable waist and soft everyday drape.',
 'fashion', 899, 1399, 38, 'New arrival',
 JSON_ARRAY('Blue', 'Pink', 'Green'),
 JSON_ARRAY('S', 'M', 'L', 'XL'),
 JSON_ARRAY('https://picsum.photos/seed/floral-midi/600/600'),
 JSON_OBJECT('Fabric', 'Rayon', 'Gender', 'Women', 'Occasion', 'Casual', 'Sleeve', 'Short sleeve'),
 4.6, 192),

('f7', 'Men''s Slim Fit Oxford Shirt',
 'Crisp cotton Oxford shirt with a versatile fit for workdays and evenings out.',
 'fashion', 799, 1199, 72, 'Top rated',
 JSON_ARRAY('White', 'Sky Blue', 'Navy'),
 JSON_ARRAY('S', 'M', 'L', 'XL', 'XXL'),
 JSON_ARRAY('https://picsum.photos/seed/oxford-shirt/600/600'),
 JSON_OBJECT('Fabric', 'Cotton', 'Gender', 'Men', 'Occasion', 'Workwear', 'Fit', 'Slim fit'),
 4.8, 357),

('f8', 'Men''s Tapered Stretch Jeans',
 'Comfort stretch denim with a modern tapered leg and five-pocket construction.',
 'fashion', 999, 1699, 61, 'Deal of the day',
 JSON_ARRAY('Dark Blue', 'Black', 'Mid Blue'),
 JSON_ARRAY('28', '30', '32', '34', '36'),
 JSON_ARRAY('https://picsum.photos/seed/tapered-jeans/600/600'),
 JSON_OBJECT('Fabric', 'Stretch denim', 'Gender', 'Men', 'Fit', 'Tapered', 'Rise', 'Mid rise'),
 4.5, 284),

('f9', 'Men''s Lightweight Hooded Jacket',
 'Layer-ready lightweight jacket with a hood and secure zip pockets for changing weather.',
 'fashion', 1299, 2199, 29, 'Winter edit',
 JSON_ARRAY('Black', 'Olive', 'Charcoal'),
 JSON_ARRAY('M', 'L', 'XL', 'XXL'),
 JSON_ARRAY('https://picsum.photos/seed/hooded-jacket/600/600'),
 JSON_OBJECT('Fabric', 'Polyester', 'Gender', 'Men', 'Occasion', 'Outdoor', 'Water resistant', 'Yes'),
 4.4, 117),

('f10', 'Classic Kanjivaram Saree',
 'Festive saree-inspired edit with a rich border and an elegant drape for celebrations.',
 'fashion', 1899, 2999, 18, 'Festive favourite',
 JSON_ARRAY('Maroon', 'Royal Blue', 'Green'),
 JSON_ARRAY('Free Size'),
 JSON_ARRAY('https://picsum.photos/seed/kanjivaram-saree/600/600'),
 JSON_OBJECT('Fabric', 'Silk blend', 'Gender', 'Women', 'Occasion', 'Festive', 'Includes', 'Unstitched saree'),
 4.9, 88),

('f11', 'Women''s Everyday Running Shoes',
 'Cushioned everyday sneakers with a breathable upper for walks, commutes, and casual looks.',
 'fashion', 1199, 1899, 44, 'Comfort pick',
 JSON_ARRAY('White', 'Black', 'Pink'),
 JSON_ARRAY('36', '37', '38', '39', '40'),
 JSON_ARRAY('https://picsum.photos/seed/running-shoes/600/600'),
 JSON_OBJECT('Material', 'Mesh', 'Gender', 'Women', 'Occasion', 'Athleisure', 'Sole', 'EVA'),
 4.6, 246),

('f12', 'Structured Vegan Leather Tote Bag',
 'Roomy structured tote with an inner pocket and polished everyday styling.',
 'fashion', 899, 1499, 33, 'Editor''s pick',
 JSON_ARRAY('Tan', 'Black', 'Burgundy'),
 JSON_ARRAY('One Size'),
 JSON_ARRAY('https://picsum.photos/seed/tote-bag/600/600'),
 JSON_OBJECT('Material', 'Vegan leather', 'Gender', 'Women', 'Occasion', 'Everyday', 'Capacity', 'Large'),
 4.7, 163)
ON DUPLICATE KEY UPDATE name=name;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these after seeding to confirm everything is set up correctly:
--   SELECT COUNT(*) AS total_users FROM users;
--   SELECT COUNT(*) AS total_products FROM products;
--   SELECT category, COUNT(*) AS count FROM products GROUP BY category;
--   SELECT * FROM users;
--   SELECT sku, name, price, stock FROM products LIMIT 5;

SELECT '✓ Database setup complete!' AS status;
SELECT CONCAT('Users: ', COUNT(*)) AS info FROM users;
SELECT CONCAT('Products: ', COUNT(*)) AS info FROM products;