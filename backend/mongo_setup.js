/**
 * =============================================================================
 * Madhav Fashion Studio — MongoDB Setup Script
 * =============================================================================
 * Run this script to create collections, indexes, and seed documents.
 * 
 * Usage:
 *   mongosh mongodb://localhost:27017/madhav_fashion mongo_setup.js
 * 
 * Or from mongo shell:
 *   use madhav_fashion
 *   load('mongo_setup.js')
 * =============================================================================
 */

// Switch to the madhav_fashion database
db = db.getSiblingDB('madhav_fashion');

print('═══ Madhav Fashion Studio — MongoDB Setup ═══');

// =============================================================================
// COLLECTION 1: products — Denormalized product catalogue for fast search
// Purpose: Full-text search, faceted filtering, recommendations
// =============================================================================
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sku', 'name', 'category', 'price', 'is_active'],
      properties: {
        sku:          { bsonType: 'string', description: 'Unique SKU identifier' },
        name:         { bsonType: 'string', description: 'Product name' },
        description:  { bsonType: 'string' },
        category:     { bsonType: 'string' },
        price:        { bsonType: 'number', minimum: 0 },
        original_price: { bsonType: ['number', 'null'] },
        stock:        { bsonType: 'int', minimum: 0 },
        badge:        { bsonType: ['string', 'null'] },
        colors:       { bsonType: ['array'], items: { bsonType: 'string' } },
        sizes:        { bsonType: ['array'], items: { bsonType: 'string' } },
        images:       { bsonType: ['array'], items: { bsonType: 'string' } },
        specs:        { bsonType: ['object', 'null'] },
        rating:       { bsonType: 'number', minimum: 0, maximum: 5 },
        review_count: { bsonType: 'int', minimum: 0 },
        is_active:    { bsonType: 'bool' },
        created_at:   { bsonType: 'date' },
        updated_at:   { bsonType: 'date' }
      }
    }
  }
});

// Indexes for products collection
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ name: 'text', description: 'text', category: 'text' }, {
  name: 'products_fulltext_search',
  weights: { name: 10, description: 3, category: 5 },
  default_language: 'none'
});
db.products.createIndex({ category: 1, price: 1 });
db.products.createIndex({ category: 1, rating: -1 });
db.products.createIndex({ is_active: 1, stock: 1 });
db.products.createIndex({ colors: 1 });
db.products.createIndex({ 'specs.Brand': 1 });
db.products.createIndex({ created_at: -1 });

print('✓ Collection "products" created with indexes');

// =============================================================================
// COLLECTION 2: carts — Active shopping carts (alternative to Redis)
// Purpose: Guest and authenticated cart persistence
// =============================================================================
db.createCollection('carts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['session_id', 'items', 'updated_at'],
      properties: {
        user_id:    { bsonType: ['string', 'null'] },
        session_id: { bsonType: 'string' },
        items: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['product_id', 'quantity'],
            properties: {
              product_id: { bsonType: 'string' },
              quantity:   { bsonType: 'int', minimum: 1 },
              color:      { bsonType: ['string', 'null'] },
              size:       { bsonType: ['string', 'null'] },
              price:      { bsonType: 'number' },
              name:       { bsonType: 'string' },
              image:      { bsonType: 'string' }
            }
          }
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.carts.createIndex({ session_id: 1 }, { unique: true });
db.carts.createIndex({ user_id: 1 }, { sparse: true });
db.carts.createIndex({ updated_at: 1 }, { expireAfterSeconds: 604800 }); // TTL: 7 days

print('✓ Collection "carts" created with indexes (TTL: 7 days)');

// =============================================================================
// COLLECTION 3: user_activity — Clickstream & behavioural events
// Purpose: Recommendations engine, analytics, personalised feeds
// =============================================================================
db.createCollection('user_activity', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['event_type', 'timestamp'],
      properties: {
        user_id:    { bsonType: ['string', 'null'] },
        session_id: { bsonType: 'string' },
        event_type: {
          bsonType: 'string',
          enum: ['product_view', 'search', 'add_to_cart', 'purchase', 'add_to_wishlist', 'review']
        },
        product_id:  { bsonType: ['string', 'null'] },
        search_query: { bsonType: ['string', 'null'] },
        category:    { bsonType: ['string', 'null'] },
        metadata:    { bsonType: ['object'] },
        timestamp:   { bsonType: 'date' }
      }
    }
  }
});

db.user_activity.createIndex({ user_id: 1, timestamp: -1 });
db.user_activity.createIndex({ session_id: 1, timestamp: -1 });
db.user_activity.createIndex({ event_type: 1, timestamp: -1 });
db.user_activity.createIndex({ product_id: 1, event_type: 1 });
db.user_activity.createIndex({ timestamp: 1 }, { expireAfterSeconds: 15552000 }); // TTL: 180 days
db.user_activity.createIndex({ category: 1, event_type: 1 });

print('✓ Collection "user_activity" created with indexes (TTL: 180 days)');

// =============================================================================
// COLLECTION 4: recommendations_cache — Pre-computed recommendations
// Purpose: Fast lookup of personalised and similar product recommendations
// =============================================================================
db.createCollection('recommendations_cache', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['context_type', 'context_id', 'recommendations', 'generated_at'],
      properties: {
        context_type: {
          bsonType: 'string',
          enum: ['user', 'product', 'category', 'homepage']
        },
        context_id:   { bsonType: 'string' },
        recommendations: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['product_id', 'score'],
            properties: {
              product_id:  { bsonType: 'string' },
              score:       { bsonType: 'number' },
              reason:      { bsonType: ['string', 'null'] }
            }
          }
        },
        generated_at: { bsonType: 'date' },
        expires_at:   { bsonType: 'date' }
      }
    }
  }
});

db.recommendations_cache.createIndex({ context_type: 1, context_id: 1 }, { unique: true });
db.recommendations_cache.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

print('✓ Collection "recommendations_cache" created with indexes (TTL-based expiry)');

// =============================================================================
// COLLECTION 5: reviews — Denormalised reviews for fast product page loading
// Purpose: Quick review retrieval without joining across MySQL
// =============================================================================
db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['product_id', 'reviewer_name', 'rating', 'created_at'],
      properties: {
        product_id:    { bsonType: 'string' },
        user_id:       { bsonType: ['string', 'null'] },
        reviewer_name: { bsonType: 'string' },
        rating:        { bsonType: 'int', minimum: 1, maximum: 5 },
        comment:       { bsonType: 'string' },
        is_verified_purchase: { bsonType: 'bool' },
        helpful_count: { bsonType: 'int', minimum: 0 },
        created_at:    { bsonType: 'date' }
      }
    }
  }
});

db.reviews.createIndex({ product_id: 1, created_at: -1 });
db.reviews.createIndex({ product_id: 1, rating: -1 });
db.reviews.createIndex({ user_id: 1 });

print('✓ Collection "reviews" created with indexes');

// =============================================================================
// COLLECTION 6: sessions — User sessions for auth & analytics
// Purpose: Store JWT refresh tokens and session metadata
// =============================================================================
db.createCollection('sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['session_id', 'user_id', 'created_at', 'expires_at'],
      properties: {
        session_id:  { bsonType: 'string' },
        user_id:     { bsonType: 'string' },
        role:        { bsonType: 'string' },
        refresh_token: { bsonType: 'string' },
        ip_address:  { bsonType: 'string' },
        user_agent:  { bsonType: 'string' },
        created_at:  { bsonType: 'date' },
        expires_at:  { bsonType: 'date' },
        last_activity: { bsonType: 'date' }
      }
    }
  }
});

db.sessions.createIndex({ session_id: 1 }, { unique: true });
db.sessions.createIndex({ user_id: 1 });
db.sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired
db.sessions.createIndex({ last_activity: 1 }, { expireAfterSeconds: 2592000 }); // 30 days idle

print('✓ Collection "sessions" created with indexes');

// =============================================================================
// SEED DATA — Fashion Products (denormalized for search)
// =============================================================================
print('Seeding product catalogue...');

const seedProducts = [
  {
    sku: 'f1', name: "Girls Cotton Anarkali Kurti",
    description: 'Soft printed cotton Anarkali kurti for festive days and everyday Indian style.',
    category: 'fashion', price: 899, original_price: 1299, stock: NumberInt(60),
    badge: 'Indian Edit',
    colors: ['Pink', 'Yellow', 'Sky Blue'],
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    images: ['https://picsum.photos/seed/girls-anarkali/600/600'],
    specs: { Fabric: 'Cotton', Style: 'Indian ethnic wear', Fit: 'Comfort fit' },
    rating: 4.8, review_count: NumberInt(124), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f2', name: "Girls Printed Cotton T-Shirt",
    description: 'Breathable cotton T-shirt with a bright Indian-inspired print for everyday wear.',
    category: 'fashion', price: 499, original_price: 699, stock: NumberInt(90),
    badge: 'Everyday Favourite',
    colors: ['Peach', 'Mint', 'Lavender'],
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    images: ['https://picsum.photos/seed/girls-tshirt/600/600'],
    specs: { Fabric: '100% Cotton', Sleeve: 'Short sleeve', Care: 'Machine wash' },
    rating: 4.7, review_count: NumberInt(98), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f3', name: "Girls Slim Fit Denim Jeans",
    description: 'Stretch denim jeans designed for comfortable movement, play, and everyday outfits.',
    category: 'fashion', price: 799, original_price: 1199, stock: NumberInt(75),
    badge: 'New',
    colors: ['Indigo', 'Black', 'Light Blue'],
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    images: ['https://picsum.photos/seed/girls-jeans/600/600'],
    specs: { Fabric: 'Stretch denim', Fit: 'Slim fit', Closure: 'Button and zip' },
    rating: 4.6, review_count: NumberInt(86), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f4', name: "Girls Embroidered Kurti Set",
    description: 'Colourful Indian kurti set with delicate embroidery and matching palazzo pants.',
    category: 'fashion', price: 1199, original_price: 1799, stock: NumberInt(45),
    badge: 'Festive Pick',
    colors: ['Red', 'Turquoise', 'Mustard'],
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    images: ['https://picsum.photos/seed/girls-kurti-set/600/600'],
    specs: { Fabric: 'Rayon', Includes: 'Kurti and palazzo', Style: 'Festive Indian wear' },
    rating: 4.9, review_count: NumberInt(73), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f5', name: "Women's Everyday Co-ord Set",
    description: 'Relaxed cotton co-ord set with a clean silhouette for travel, errands, and easy weekends.',
    category: 'fashion', price: 1099, original_price: 1599, stock: NumberInt(55),
    badge: 'Bestseller',
    colors: ['Olive', 'Black', 'Beige'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://picsum.photos/seed/womens-coord/600/600'],
    specs: { Fabric: 'Cotton', Gender: 'Women', Occasion: 'Casual', Fit: 'Relaxed' },
    rating: 4.7, review_count: NumberInt(441), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f6', name: "Women's Floral Midi Dress",
    description: 'Lightweight floral midi dress with a comfortable waist and soft everyday drape.',
    category: 'fashion', price: 899, original_price: 1399, stock: NumberInt(38),
    badge: 'New arrival',
    colors: ['Blue', 'Pink', 'Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://picsum.photos/seed/floral-midi/600/600'],
    specs: { Fabric: 'Rayon', Gender: 'Women', Occasion: 'Casual', Sleeve: 'Short sleeve' },
    rating: 4.6, review_count: NumberInt(192), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f7', name: "Men's Slim Fit Oxford Shirt",
    description: 'Crisp cotton Oxford shirt with a versatile fit for workdays and evenings out.',
    category: 'fashion', price: 799, original_price: 1199, stock: NumberInt(72),
    badge: 'Top rated',
    colors: ['White', 'Sky Blue', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['https://picsum.photos/seed/oxford-shirt/600/600'],
    specs: { Fabric: 'Cotton', Gender: 'Men', Occasion: 'Workwear', Fit: 'Slim fit' },
    rating: 4.8, review_count: NumberInt(357), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f8', name: "Men's Tapered Stretch Jeans",
    description: 'Comfort stretch denim with a modern tapered leg and five-pocket construction.',
    category: 'fashion', price: 999, original_price: 1699, stock: NumberInt(61),
    badge: 'Deal of the day',
    colors: ['Dark Blue', 'Black', 'Mid Blue'],
    sizes: ['28', '30', '32', '34', '36'],
    images: ['https://picsum.photos/seed/tapered-jeans/600/600'],
    specs: { Fabric: 'Stretch denim', Gender: 'Men', Fit: 'Tapered', Rise: 'Mid rise' },
    rating: 4.5, review_count: NumberInt(284), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f9', name: "Men's Lightweight Hooded Jacket",
    description: 'Layer-ready lightweight jacket with a hood and secure zip pockets for changing weather.',
    category: 'fashion', price: 1299, original_price: 2199, stock: NumberInt(29),
    badge: 'Winter edit',
    colors: ['Black', 'Olive', 'Charcoal'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: ['https://picsum.photos/seed/hooded-jacket/600/600'],
    specs: { Fabric: 'Polyester', Gender: 'Men', Occasion: 'Outdoor', 'Water resistant': 'Yes' },
    rating: 4.4, review_count: NumberInt(117), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f10', name: 'Classic Kanjivaram Saree',
    description: 'Festive saree-inspired edit with a rich border and an elegant drape for celebrations.',
    category: 'fashion', price: 1899, original_price: 2999, stock: NumberInt(18),
    badge: 'Festive favourite',
    colors: ['Maroon', 'Royal Blue', 'Green'],
    sizes: ['Free Size'],
    images: ['https://picsum.photos/seed/kanjivaram-saree/600/600'],
    specs: { Fabric: 'Silk blend', Gender: 'Women', Occasion: 'Festive', Includes: 'Unstitched saree' },
    rating: 4.9, review_count: NumberInt(88), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f11', name: "Women's Everyday Running Shoes",
    description: 'Cushioned everyday sneakers with a breathable upper for walks, commutes, and casual looks.',
    category: 'fashion', price: 1199, original_price: 1899, stock: NumberInt(44),
    badge: 'Comfort pick',
    colors: ['White', 'Black', 'Pink'],
    sizes: ['36', '37', '38', '39', '40'],
    images: ['https://picsum.photos/seed/running-shoes/600/600'],
    specs: { Material: 'Mesh', Gender: 'Women', Occasion: 'Athleisure', Sole: 'EVA' },
    rating: 4.6, review_count: NumberInt(246), is_active: true,
    created_at: new Date(), updated_at: new Date()
  },
  {
    sku: 'f12', name: 'Structured Vegan Leather Tote Bag',
    description: 'Roomy structured tote with an inner pocket and polished everyday styling.',
    category: 'fashion', price: 899, original_price: 1499, stock: NumberInt(33),
    badge: "Editor's pick",
    colors: ['Tan', 'Black', 'Burgundy'],
    sizes: ['One Size'],
    images: ['https://picsum.photos/seed/tote-bag/600/600'],
    specs: { Material: 'Vegan leather', Gender: 'Women', Occasion: 'Everyday', Capacity: 'Large' },
    rating: 4.7, review_count: NumberInt(163), is_active: true,
    created_at: new Date(), updated_at: new Date()
  }
];

// Upsert each product
seedProducts.forEach(function(product) {
  db.products.updateOne(
    { sku: product.sku },
    { $set: product },
    { upsert: true }
  );
});

print(`✓ Seeded ${seedProducts.length} products`);

// =============================================================================
// VERIFICATION
// =============================================================================
print('\n═══ Collection Summary ═══');
db.getCollectionNames().forEach(function(coll) {
  var count = db.getCollection(coll).countDocuments();
  print(`  ${coll}: ${count} documents`);
});

print('\n═══ Index Summary ═══');
db.getCollectionNames().forEach(function(coll) {
  var indexes = db.getCollection(coll).getIndexes();
  print(`  ${coll}: ${indexes.length} index(es)`);
});

print('\n✓ MongoDB setup complete for Madhav Fashion Studio!');
print('  Connection string: mongodb://localhost:27017/madhav_fashion');