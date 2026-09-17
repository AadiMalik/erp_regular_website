// Smart Mart — category reference data.
// Swap `image` values or extend `subcategories` freely; nothing else depends on their shape.

export const unsplash = (id, w = 800, h = w) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const CATEGORIES = [
  {
    id: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    icon: 'fa-carrot',
    image: unsplash('1618160702438-9b02ab6515c9'),
    subcategories: ['Fresh Fruits', 'Fresh Vegetables', 'Organic', 'Herbs & Seasoning'],
  },
  {
    id: 'dairy-eggs',
    name: 'Dairy & Eggs',
    icon: 'fa-cheese',
    image: unsplash('1550583724-b2692b85b150'),
    subcategories: ['Milk', 'Cheese', 'Yogurt', 'Eggs', 'Butter & Cream'],
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: 'fa-bread-slice',
    image: unsplash('1509440159596-0249088772ff'),
    subcategories: ['Bread', 'Cakes & Pastries', 'Buns & Rolls', 'Cookies'],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: 'fa-mug-saucer',
    image: unsplash('1587049352846-4a222e784d38'),
    subcategories: ['Juices', 'Soft Drinks', 'Water', 'Tea & Coffee'],
  },
  {
    id: 'snacks',
    name: 'Snacks & Munchies',
    icon: 'fa-cookie-bite',
    image: unsplash('1601924582970-9238bcb495d9'),
    subcategories: ['Chips & Crisps', 'Chocolates', 'Nuts & Dry Fruits', 'Biscuits'],
  },
  {
    id: 'meat-seafood',
    name: 'Meat & Seafood',
    icon: 'fa-drumstick-bite',
    image: unsplash('1607349913338-fca6f7fc42d0'),
    subcategories: ['Chicken', 'Mutton', 'Fish & Seafood', 'Prawns'],
  },
  {
    id: 'frozen',
    name: 'Frozen Foods',
    icon: 'fa-snowflake',
    image: unsplash('1622480916113-9000ac49b79d'),
    subcategories: ['Frozen Vegetables', 'Ice Cream', 'Frozen Snacks', 'Frozen Meat'],
  },
  {
    id: 'grocery-staples',
    name: 'Grocery & Staples',
    icon: 'fa-jar',
    image: unsplash('1595855759920-86582396756a'),
    subcategories: ['Rice & Grains', 'Cooking Oil', 'Spices & Masala', 'Pasta & Noodles'],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: 'fa-pump-soap',
    image: unsplash('1585421514738-01798e348b17'),
    subcategories: ['Skin Care', 'Hair Care', 'Oral Care', 'Bath & Body'],
  },
  {
    id: 'household',
    name: 'Household & Cleaning',
    icon: 'fa-spray-can-sparkles',
    image: unsplash('1587132137056-bfbf0166836e'),
    subcategories: ['Detergents', 'Cleaning Supplies', 'Air Fresheners', 'Paper Products'],
  },
];

export const BRANDS = [
  'FarmFresh', 'DairyPure', 'GoldenHarvest', 'NatureValu', 'PureBite',
  'HomeStyle', 'GreenLeaf', 'DailyBasket', 'CrispCo', 'PrimeCut',
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
