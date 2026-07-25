export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'women' | 'men' | 'essentials' | 'sale';
  image: string;
  hoverImage: string;
  colors: string[];
  sizes: string[];
  badge?: string;
  description: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Girls Cotton Anarkali Kurti',
    price: 58,
    category: 'women',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_16d412437-1772087467125.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_16d412437-1772087467125.png',
    colors: ['Rose Pink', 'Peacock Blue', 'Saffron'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Flowing Anarkali kurta in soft georgette with delicate embroidery at the neckline. Pairs beautifully with churidar or palazzo.',
    rating: 4.8,
    reviewCount: 214,
    isNew: true,
  },
  {
    id: 'p2',
    name: 'Girls Printed Cotton T-Shirt',
    price: 120,
    category: 'women',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17e4fd043-1764672691592.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_17e4fd043-1764672691592.png',
    colors: ['Crimson', 'Emerald', 'Royal Blue'],
    sizes: ['Free Size'],
    description:
      'Handwoven Banarasi silk saree with zari border. A timeless piece for weddings, festivals, and celebrations.',
    rating: 4.9,
    reviewCount: 187,
    isNew: true,
  },
  {
    id: 'p3',
    name: 'Girls Slim Fit Denim Jeans',
    price: 72,
    originalPrice: 95,
    category: 'sale',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1051b2748-1784641851051.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1051b2748-1784641851051.png',
    colors: ['Mint Green', 'Lavender', 'Peach'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    badge: 'Sale',
    description:
      'Three-piece salwar suit with intricate thread embroidery. Includes dupatta. Comfortable cotton-silk blend.',
    rating: 4.7,
    reviewCount: 302,
  },
  {
    id: 'p4',
    name: 'Girls Embroidered Kurti Set',
    price: 65,
    category: 'men',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15ccd1ff3-1784184780780.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_15ccd1ff3-1784184780780.png',
    colors: ['Ivory', 'Navy', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Classic Nehru collar jacket in premium linen. Mandarin collar with subtle texture. Versatile for formal and festive occasions.',
    rating: 4.7,
    reviewCount: 98,
    isNew: true,
  },
  {
    id: 'p5',
    name: 'Girls Everyday Cotton Kurta',
    price: 32,
    category: 'essentials',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d7201a0d-1772719966359.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d7201a0d-1772719966359.png',
    colors: ['White', 'Sky Blue', 'Beige', 'Olive'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Everyday pure cotton kurta with minimal block print. Breathable and comfortable for all-day wear.',
    rating: 4.8,
    reviewCount: 489,
  },
  {
    id: 'p6',
    name: 'Girls Soft Palazzo Pants',
    price: 42,
    category: 'men',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e65f5c08-1784780344296.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e65f5c08-1784780344296.png',
    colors: ['Cream', 'Khaki', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Contemporary dhoti-style pants with elasticated waist. Lightweight cotton for comfort in warm weather.',
    rating: 4.5,
    reviewCount: 73,
    isNew: true,
  },
  {
    id: 'p7',
    name: 'Lehenga Choli',
    price: 145,
    originalPrice: 190,
    category: 'sale',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15e283771-1772279772045.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_15e283771-1772279772045.png',
    colors: ['Magenta', 'Teal', 'Gold'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    badge: 'Sale',
    description:
      'Festive lehenga choli with mirror work and sequin embellishments. Includes matching dupatta. Perfect for weddings.',
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: 'p8',
    name: 'Bandhani Dupatta',
    price: 28,
    category: 'essentials',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1fe0f2fe0-1779085950260.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1fe0f2fe0-1779085950260.png',
    colors: ['Saffron', 'Pink', 'Turquoise'],
    sizes: ['Free Size'],
    description:
      'Traditional Rajasthani bandhani tie-dye dupatta in pure cotton. Hand-crafted with authentic tie-dye technique.',
    rating: 4.8,
    reviewCount: 267,
  },
  {
    id: 'p9',
    name: 'Sherwani Set',
    price: 185,
    originalPrice: 240,
    category: 'sale',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b4cd04b9-1782822363336.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b4cd04b9-1782822363336.png',
    colors: ['Ivory', 'Maroon'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: 'Sale',
    description:
      'Full sherwani set with churidar and dupatta. Intricate zardozi embroidery. Ideal for weddings and grand celebrations.',
    rating: 4.9,
    reviewCount: 64,
  },
  {
    id: 'p10',
    name: 'Palazzo Pants',
    price: 26,
    category: 'essentials',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_14f1d4c77-1769197079337.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_14f1d4c77-1769197079337.png',
    colors: ['White', 'Black', 'Rust', 'Indigo'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Wide-leg palazzo pants in flowy rayon. Elasticated waist, pairs with any kurta or top.',
    rating: 4.7,
    reviewCount: 198,
    isNew: true,
  },
  {
    id: 'p11',
    name: 'Pathani Kurta',
    price: 55,
    category: 'men',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f95f3370-1772249376106.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f95f3370-1772249376106.png',
    colors: ['White', 'Sky Blue', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description:
      'Classic Pathani kurta with side slits and mandarin collar. Pure cotton, perfect for casual and festive wear.',
    rating: 4.8,
    reviewCount: 143,
  },
  {
    id: 'p12',
    name: 'Chanderi Suit',
    price: 88,
    category: 'women',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ca5e9640-1784780344563.png',
    hoverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ca5e9640-1784780344563.png',
    colors: ['Blush', 'Sage', 'Champagne'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Elegant Chanderi silk suit with delicate block print. Lightweight and lustrous — ideal for summer festivities.',
    rating: 4.7,
    reviewCount: 112,
    isNew: true,
  },
];

export const getFeaturedProducts = () => products.slice(0, 6);
export const getProductsByCategory = (category: string) =>
  category === 'all' ? products : products.filter((p) => p.category === category);
