// Smart Mart — sample product catalog.
// Static stand-in for a future `/api/products` response. Every page reads
// this array only through helpers in core/store.js — nothing else touches it,
// so swapping this file for a real fetch later is a one-file change.

import { unsplash } from './categories.js';

const POOL = {
  'fruits-vegetables': ['1618160702438-9b02ab6515c9', '1610832958506-aa56368176cf', '1610348725531-843dff563e2c', '1590779033100-9f60a05a013d', '1519996529931-28324d5a630e', '1601599561213-832382fd07ba'],
  'dairy-eggs': ['1550583724-b2692b85b150', '1621996346565-e3dbc646d9a9', '1563636619-e9143da7973b', '1626200419199-391ae4be7a41', '1552642986-ccb41e7059e7'],
  bakery: ['1509440159596-0249088772ff', '1447279506476-3faec8071eee', '1517686469429-8bdb88b9f907', '1631730359585-38a4935cbec4', '1610614819513-58e34989848b'],
  beverages: ['1587049352846-4a222e784d38', '1541014741259-de529411b96a', '1544025162-d76694265947', '1543168256-418811576931', '1600271886742-f049cd451bba'],
  snacks: ['1601924582970-9238bcb495d9', '1587735243615-c03f25aaff15', '1594631252845-29fc4cc8cde9', '1567306226416-28f0efdc88ce', '1606787366850-de6330128bfc'],
  'meat-seafood': ['1607349913338-fca6f7fc42d0', '1600180758890-6b94519a8ba6', '1585155770447-2f66e2a397b5', '1556228453-efd6c1ff04f6', '1583947581924-860bda6a26df'],
  frozen: ['1622480916113-9000ac49b79d', '1608270586620-248524c67de9', '1614707267537-b85aaf00c4b7', '1584464491033-06628f3a6b7b', '1608198093002-ad4e005484ec'],
  'grocery-staples': ['1595855759920-86582396756a', '1626197031507-c17099753214', '1550547660-d9450f859349', '1548943487-a2e4e43b4853', '1583258292688-d0213dc5a3a8'],
  'personal-care': ['1585421514738-01798e348b17', '1620574387735-3624d75b2dbc', '1616684000067-36952fde56ec', '1604382354936-07c5d9983bd3', '1584622781564-1d987f7333c1'],
  household: ['1587132137056-bfbf0166836e', '1543339308-43e59d6b73a6', '1556910096-6f5e72db6803', '1573575155376-b5010099301b', '1584017911766-d451b3d0e843'],
};

let uid = 0;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function p(cfg) {
  uid += 1;
  const pool = POOL[cfg.category];
  const i1 = (cfg.imgOffset || 0) % pool.length;
  const i2 = (i1 + 1) % pool.length;
  const discount = cfg.oldPrice ? Math.round(100 - (cfg.price / cfg.oldPrice) * 100) : 0;
  return {
    id: `p${uid}`,
    sku: `SM-${cfg.category.slice(0, 3).toUpperCase()}-${String(uid).padStart(4, '0')}`,
    slug: slugify(cfg.name),
    name: cfg.name,
    category: cfg.category,
    subcategory: cfg.subcategory,
    brand: cfg.brand,
    price: cfg.price,
    oldPrice: cfg.oldPrice || null,
    discount,
    unit: cfg.unit,
    rating: cfg.rating,
    reviewCount: cfg.reviewCount,
    stock: cfg.stock,
    badges: cfg.badges || [],
    description: cfg.description,
    highlights: cfg.highlights,
    images: [unsplash(pool[i1]), unsplash(pool[i2])],
    variations: cfg.variations || null,
  };
}

export const PRODUCTS = [
  // ---------------- Fruits & Vegetables ----------------
  p({ category: 'fruits-vegetables', subcategory: 'Fresh Fruits', name: 'Fresh Red Apples', brand: 'FarmFresh', price: 3.49, oldPrice: 4.29, unit: '1 kg', rating: 4.6, reviewCount: 214, stock: 42, badges: ['bestseller', 'deal'], imgOffset: 0,
    description: 'Crisp, juicy red apples picked at peak ripeness and hand-selected for size and colour. Great for snacking, salads or baking.',
    highlights: ['Rich in fibre & vitamin C', 'Sourced from local orchards', 'No added wax coating'],
    variations: { label: 'Pack Size', type: 'weight', options: [
      { label: '1 kg', price: 3.49, oldPrice: 4.29, stock: 42 },
      { label: '2 kg', price: 6.49, oldPrice: 8.19, stock: 26 },
      { label: '5 kg', price: 14.99, oldPrice: 19.5, stock: 9 },
    ] } }),
  p({ category: 'fruits-vegetables', subcategory: 'Fresh Fruits', name: 'Organic Bananas', brand: 'GreenLeaf', price: 1.99, unit: '1 dozen', rating: 4.4, reviewCount: 156, stock: 60, badges: ['new'], imgOffset: 1,
    description: 'Naturally ripened organic bananas — a quick energy boost packed with potassium.',
    highlights: ['Certified organic', 'No synthetic ripening agents', 'Great for smoothies'] }),
  p({ category: 'fruits-vegetables', subcategory: 'Fresh Vegetables', name: 'Ripe Vine Tomatoes', brand: 'FarmFresh', price: 2.79, oldPrice: 3.49, unit: '500 g', rating: 4.3, reviewCount: 98, stock: 35, badges: ['deal'], imgOffset: 2,
    description: 'Sweet, sun-ripened tomatoes still on the vine for maximum freshness.',
    highlights: ['Vine-ripened for full flavour', 'Ideal for sauces & salads', 'Picked within 48 hours'] }),
  p({ category: 'fruits-vegetables', subcategory: 'Fresh Vegetables', name: 'Fresh Baby Spinach', brand: 'GreenLeaf', price: 2.29, unit: '250 g bunch', rating: 4.5, reviewCount: 71, stock: 18, badges: [], imgOffset: 3,
    description: 'Tender baby spinach leaves, triple-washed and ready to use.',
    highlights: ['Triple-washed & ready to eat', 'High in iron', 'Locally grown'] }),
  p({ category: 'fruits-vegetables', subcategory: 'Fresh Fruits', name: 'Sweet Navel Oranges', brand: 'NatureValu', price: 3.99, unit: '1 kg', rating: 4.7, reviewCount: 132, stock: 50, badges: ['trending'], imgOffset: 4,
    description: 'Seedless navel oranges bursting with sweet citrus flavour, perfect for juicing.',
    highlights: ['Seedless & easy to peel', 'High in vitamin C', 'Great for fresh juice'] }),
  p({ category: 'fruits-vegetables', subcategory: 'Fresh Vegetables', name: 'Crunchy Baby Carrots', brand: 'FarmFresh', price: 1.79, unit: '500 g', rating: 4.2, reviewCount: 64, stock: 0, badges: [], imgOffset: 5,
    description: 'Sweet, crunchy baby carrots, pre-washed and ready to snack on.',
    highlights: ['Pre-washed, ready to eat', 'No added sugar', 'Kid-friendly snack'] }),

  // ---------------- Dairy & Eggs ----------------
  p({ category: 'dairy-eggs', subcategory: 'Milk', name: 'Full Cream Milk', brand: 'DairyPure', price: 2.49, unit: '1 L', rating: 4.6, reviewCount: 302, stock: 80, badges: ['bestseller'], imgOffset: 0,
    description: 'Farm-fresh full cream milk, pasteurised and homogenised for a rich, creamy taste.',
    highlights: ['Rich source of calcium', 'Pasteurised for safety', 'No preservatives'],
    variations: { label: 'Size', type: 'size', options: [
      { label: '500 ml', price: 1.39, stock: 60 },
      { label: '1 L', price: 2.49, stock: 80 },
      { label: '2 L', price: 4.49, stock: 40 },
    ] } }),
  p({ category: 'dairy-eggs', subcategory: 'Eggs', name: 'Farm Fresh Eggs', brand: 'FarmFresh', price: 3.29, oldPrice: 3.89, unit: '12 pack', rating: 4.8, reviewCount: 245, stock: 55, badges: ['deal', 'bestseller'], imgOffset: 1,
    description: 'Free-range eggs from cage-free hens, collected daily for guaranteed freshness.',
    highlights: ['Free-range & cage-free', 'Rich in protein', 'Graded for size consistency'] }),
  p({ category: 'dairy-eggs', subcategory: 'Cheese', name: 'Cheddar Cheese Block', brand: 'DairyPure', price: 4.99, unit: '200 g', rating: 4.5, reviewCount: 88, stock: 24, badges: ['new'], imgOffset: 2,
    description: 'Aged cheddar cheese with a sharp, rich flavour — perfect for sandwiches and cooking.',
    highlights: ['Aged for 6 months', 'Great melt for cooking', 'Made from real milk'] }),
  p({ category: 'dairy-eggs', subcategory: 'Yogurt', name: 'Greek Style Yogurt', brand: 'DairyPure', price: 3.59, unit: '500 g', rating: 4.4, reviewCount: 119, stock: 30, badges: [], imgOffset: 3,
    description: 'Thick and creamy Greek-style yogurt, strained for extra protein.',
    highlights: ['High protein, low sugar', 'Live active cultures', 'Naturally thick texture'] }),
  p({ category: 'dairy-eggs', subcategory: 'Butter & Cream', name: 'Salted Butter Block', brand: 'HomeStyle', price: 2.99, unit: '250 g', rating: 4.3, reviewCount: 54, stock: 40, badges: [], imgOffset: 4,
    description: 'Creamy salted butter churned from fresh dairy cream.',
    highlights: ['Churned from fresh cream', 'Perfectly salted', 'Great for baking'] }),

  // ---------------- Bakery ----------------
  p({ category: 'bakery', subcategory: 'Bread', name: 'Whole Wheat Bread Loaf', brand: 'HomeStyle', price: 2.49, unit: '400 g', rating: 4.5, reviewCount: 176, stock: 45, badges: ['bestseller'], imgOffset: 0,
    description: 'Soft, freshly baked whole wheat bread — a healthier everyday staple.',
    highlights: ['100% whole wheat', 'No artificial preservatives', 'Baked fresh daily'] }),
  p({ category: 'bakery', subcategory: 'Buns & Rolls', name: 'Butter Croissants', brand: 'HomeStyle', price: 3.99, oldPrice: 4.99, unit: '4 pack', rating: 4.7, reviewCount: 92, stock: 20, badges: ['deal'], imgOffset: 1,
    description: 'Flaky, buttery croissants baked fresh every morning.',
    highlights: ['Made with real butter', 'Flaky, golden layers', 'Bakery-fresh daily'] }),
  p({ category: 'bakery', subcategory: 'Cookies', name: 'Chocolate Chip Cookies', brand: 'CrispCo', price: 3.29, unit: '300 g', rating: 4.6, reviewCount: 140, stock: 33, badges: ['trending'], imgOffset: 2,
    description: 'Classic chocolate chip cookies with a soft centre and crisp edge.',
    highlights: ['Loaded with chocolate chips', 'Soft-baked centre', 'Family recipe'] }),
  p({ category: 'bakery', subcategory: 'Bread', name: 'Artisan Sourdough Bread', brand: 'HomeStyle', price: 4.49, unit: '500 g', rating: 4.8, reviewCount: 66, stock: 15, badges: ['new'], imgOffset: 3,
    description: 'Slow-fermented sourdough with a crisp crust and tangy, airy crumb.',
    highlights: ['48-hour slow fermentation', 'Naturally leavened', 'Crisp crust, soft crumb'] }),
  p({ category: 'bakery', subcategory: 'Buns & Rolls', name: 'Cinnamon Rolls', brand: 'CrispCo', price: 4.29, unit: '6 pack', rating: 4.5, reviewCount: 58, stock: 0, badges: [], imgOffset: 4,
    description: 'Warm, gooey cinnamon rolls finished with sweet cream icing.',
    highlights: ['Swirled with cinnamon sugar', 'Topped with cream icing', 'Best served warm'] }),

  // ---------------- Beverages ----------------
  p({ category: 'beverages', subcategory: 'Juices', name: 'Fresh Orange Juice', brand: 'NatureValu', price: 3.49, unit: '1 L', rating: 4.5, reviewCount: 128, stock: 48, badges: ['bestseller'], imgOffset: 0,
    description: '100% pure squeezed orange juice with no added sugar or concentrate.',
    highlights: ['100% pure, not from concentrate', 'No added sugar', 'Good source of vitamin C'] }),
  p({ category: 'beverages', subcategory: 'Water', name: 'Sparkling Mineral Water', brand: 'PureBite', price: 1.29, unit: '1 L', rating: 4.3, reviewCount: 74, stock: 90, badges: [], imgOffset: 1,
    description: 'Naturally sourced sparkling mineral water with a crisp, refreshing finish.',
    highlights: ['Naturally carbonated', 'Zero calories', 'BPA-free bottle'] }),
  p({ category: 'beverages', subcategory: 'Tea & Coffee', name: 'Ground Coffee Beans', brand: 'DailyBasket', price: 6.99, oldPrice: 8.49, unit: '250 g', rating: 4.7, reviewCount: 210, stock: 38, badges: ['deal', 'bestseller'], imgOffset: 2,
    description: 'Medium-roast ground coffee with notes of chocolate and caramel.',
    highlights: ['Medium roast, whole bean ground', 'Ethically sourced beans', 'Rich aroma & smooth finish'],
    variations: { label: 'Roast', type: 'flavor', options: [
      { label: 'Medium Roast', price: 6.99, oldPrice: 8.49, stock: 38 },
      { label: 'Dark Roast', price: 7.49, stock: 22 },
      { label: 'Decaf', price: 7.99, stock: 12 },
    ] } }),
  p({ category: 'beverages', subcategory: 'Tea & Coffee', name: 'Green Tea Bags', brand: 'PureBite', price: 3.99, unit: '25 count', rating: 4.4, reviewCount: 95, stock: 52, badges: ['new'], imgOffset: 3,
    description: 'Antioxidant-rich green tea bags for a light, refreshing cup.',
    highlights: ['Rich in antioxidants', 'Light, refreshing taste', 'Individually wrapped'] }),
  p({ category: 'beverages', subcategory: 'Soft Drinks', name: 'Classic Cola Soft Drink', brand: 'DailyBasket', price: 1.99, unit: '1.5 L', rating: 4.1, reviewCount: 187, stock: 100, badges: ['trending'], imgOffset: 4,
    description: 'Classic cola with bold, refreshing flavour — perfect chilled.',
    highlights: ['Classic bold flavour', 'Best served chilled', 'Resealable bottle'] }),

  // ---------------- Snacks & Munchies ----------------
  p({ category: 'snacks', subcategory: 'Chips & Crisps', name: 'Classic Potato Chips', brand: 'CrispCo', price: 2.49, unit: '150 g', rating: 4.4, reviewCount: 168, stock: 70, badges: ['bestseller'], imgOffset: 0,
    description: 'Crunchy, kettle-cooked potato chips seasoned with sea salt.',
    highlights: ['Kettle-cooked crunch', 'Seasoned with sea salt', 'No artificial flavours'],
    variations: { label: 'Flavor', type: 'flavor', options: [
      { label: 'Sea Salt', price: 2.49, stock: 70 },
      { label: 'Sour Cream & Onion', price: 2.49, stock: 44 },
      { label: 'BBQ', price: 2.49, stock: 0 },
      { label: 'Spicy Chili', price: 2.69, stock: 18 },
    ] } }),
  p({ category: 'snacks', subcategory: 'Nuts & Dry Fruits', name: 'Roasted Mixed Nuts', brand: 'NatureValu', price: 5.99, oldPrice: 7.49, unit: '500 g', rating: 4.6, reviewCount: 121, stock: 26, badges: ['deal'], imgOffset: 1,
    description: 'A hearty blend of roasted almonds, cashews, and pistachios, lightly salted.',
    highlights: ['Blend of 4 premium nuts', 'Lightly salted, dry roasted', 'Good source of healthy fats'] }),
  p({ category: 'snacks', subcategory: 'Chocolates', name: 'Dark Chocolate Bar 70%', brand: 'PureBite', price: 2.99, unit: '100 g', rating: 4.8, reviewCount: 203, stock: 60, badges: ['bestseller', 'trending'], imgOffset: 2,
    description: 'Smooth, intense 70% dark chocolate made from ethically sourced cocoa.',
    highlights: ['70% single-origin cocoa', 'Ethically sourced', 'Smooth, intense finish'] }),
  p({ category: 'snacks', subcategory: 'Biscuits', name: 'Digestive Biscuits', brand: 'CrispCo', price: 2.29, unit: '300 g', rating: 4.2, reviewCount: 77, stock: 40, badges: [], imgOffset: 3,
    description: 'Wholesome wheat digestive biscuits with a light, crumbly texture.',
    highlights: ['Made with whole wheat', 'Light, crumbly texture', 'Great with tea or coffee'] }),
  p({ category: 'snacks', subcategory: 'Chips & Crisps', name: 'Ready to Eat Popcorn', brand: 'DailyBasket', price: 1.99, unit: '100 g', rating: 4.3, reviewCount: 49, stock: 0, badges: ['new'], imgOffset: 4,
    description: 'Air-popped popcorn with a light butter seasoning — ready straight from the bag.',
    highlights: ['Air-popped, not fried', 'Light butter seasoning', 'Whole grain snack'] }),

  // ---------------- Meat & Seafood ----------------
  p({ category: 'meat-seafood', subcategory: 'Chicken', name: 'Fresh Chicken Breast', brand: 'PrimeCut', price: 6.99, unit: '1 kg', rating: 4.5, reviewCount: 134, stock: 22, badges: ['bestseller'], imgOffset: 0,
    description: 'Skinless, boneless chicken breast — a lean protein staple for every kitchen.',
    highlights: ['Skinless & boneless', 'Antibiotic-free', 'High in lean protein'] }),
  p({ category: 'meat-seafood', subcategory: 'Mutton', name: 'Mutton Curry Cut', brand: 'PrimeCut', price: 11.99, oldPrice: 13.99, unit: '1 kg', rating: 4.4, reviewCount: 61, stock: 12, badges: ['deal'], imgOffset: 1,
    description: 'Tender mutton, curry-cut and trimmed, ideal for slow-cooked curries.',
    highlights: ['Hand-trimmed cuts', 'Ideal for slow cooking', 'Sourced from local farms'] }),
  p({ category: 'meat-seafood', subcategory: 'Fish & Seafood', name: 'Atlantic Salmon Fillet', brand: 'PrimeCut', price: 9.99, unit: '500 g', rating: 4.7, reviewCount: 88, stock: 16, badges: ['trending'], imgOffset: 2,
    description: 'Boneless Atlantic salmon fillet, rich in omega-3 fatty acids.',
    highlights: ['Boneless, skin-on fillet', 'Rich in omega-3', 'Sustainably sourced'] }),
  p({ category: 'meat-seafood', subcategory: 'Prawns', name: 'Peeled & Deveined Prawns', brand: 'PrimeCut', price: 8.49, unit: '500 g', rating: 4.5, reviewCount: 47, stock: 0, badges: [], imgOffset: 3,
    description: 'Ready-to-cook prawns, peeled and deveined for convenience.',
    highlights: ['Peeled & deveined', 'Flash-frozen for freshness', 'Ready in minutes'] }),
  p({ category: 'meat-seafood', subcategory: 'Chicken', name: 'Chicken Drumsticks', brand: 'PrimeCut', price: 5.49, unit: '1 kg', rating: 4.3, reviewCount: 72, stock: 30, badges: ['new'], imgOffset: 4,
    description: 'Juicy chicken drumsticks, perfect for grilling or roasting.',
    highlights: ['Great for grilling', 'Antibiotic-free', 'Consistent sizing'] }),

  // ---------------- Frozen Foods ----------------
  p({ category: 'frozen', subcategory: 'Frozen Vegetables', name: 'Frozen Mixed Vegetables', brand: 'GreenLeaf', price: 2.99, unit: '1 kg', rating: 4.3, reviewCount: 66, stock: 44, badges: [], imgOffset: 0,
    description: 'A colourful mix of peas, corn, carrots and beans, flash-frozen to lock in nutrients.',
    highlights: ['Flash-frozen at peak freshness', 'No added preservatives', 'Ready in 5 minutes'] }),
  p({ category: 'frozen', subcategory: 'Ice Cream', name: 'Vanilla Bean Ice Cream', brand: 'DairyPure', price: 4.49, oldPrice: 5.49, unit: '1 L tub', rating: 4.8, reviewCount: 159, stock: 28, badges: ['deal', 'bestseller'], imgOffset: 1,
    description: 'Creamy vanilla bean ice cream made with real Madagascar vanilla.',
    highlights: ['Made with real vanilla bean', 'Extra creamy texture', 'No artificial colours'] }),
  p({ category: 'frozen', subcategory: 'Frozen Snacks', name: 'Crispy French Fries', brand: 'CrispCo', price: 3.29, unit: '1 kg', rating: 4.4, reviewCount: 103, stock: 50, badges: ['trending'], imgOffset: 2,
    description: 'Golden, crispy French fries — oven-bake or fry straight from frozen.',
    highlights: ['Crispy outside, fluffy inside', 'Oven or fryer ready', 'Restaurant-style cut'] }),
  p({ category: 'frozen', subcategory: 'Frozen Snacks', name: 'Chicken Nuggets', brand: 'PrimeCut', price: 4.99, unit: '500 g', rating: 4.2, reviewCount: 84, stock: 20, badges: [], imgOffset: 3,
    description: 'Breaded chicken breast nuggets, a family favourite ready in minutes.',
    highlights: ['Made with real chicken breast', 'Family-size pack', 'Ready in 12 minutes'] }),
  p({ category: 'frozen', subcategory: 'Frozen Vegetables', name: 'Frozen Garden Peas', brand: 'GreenLeaf', price: 2.19, unit: '500 g', rating: 4.1, reviewCount: 39, stock: 0, badges: [], imgOffset: 4,
    description: 'Sweet garden peas, snap-frozen within hours of picking.',
    highlights: ['Snap-frozen at harvest', 'Naturally sweet', 'No added salt'] }),

  // ---------------- Grocery & Staples ----------------
  p({ category: 'grocery-staples', subcategory: 'Rice & Grains', name: 'Premium Basmati Rice', brand: 'GoldenHarvest', price: 8.99, unit: '5 kg', rating: 4.7, reviewCount: 241, stock: 33, badges: ['bestseller'], imgOffset: 0,
    description: 'Long-grain aged basmati rice with a signature aroma and fluffy texture.',
    highlights: ['Aged for extra-long grains', 'Naturally aromatic', 'Non-sticky, fluffy cook'],
    variations: { label: 'Pack Size', type: 'weight', options: [
      { label: '1 kg', price: 2.49, stock: 60 },
      { label: '5 kg', price: 8.99, stock: 33 },
      { label: '10 kg', price: 16.49, stock: 14 },
    ] } }),
  p({ category: 'grocery-staples', subcategory: 'Cooking Oil', name: 'Extra Virgin Olive Oil', brand: 'NatureValu', price: 9.49, oldPrice: 11.99, unit: '1 L', rating: 4.6, reviewCount: 117, stock: 25, badges: ['deal'], imgOffset: 1,
    description: 'Cold-pressed extra virgin olive oil with a rich, fruity flavour.',
    highlights: ['Cold-pressed, first extraction', 'Rich, fruity flavour', 'Low acidity'] }),
  p({ category: 'grocery-staples', subcategory: 'Spices & Masala', name: 'Garam Masala Spice Mix', brand: 'DailyBasket', price: 2.99, unit: '100 g', rating: 4.5, reviewCount: 62, stock: 48, badges: ['new'], imgOffset: 2,
    description: 'A fragrant house blend of roasted, ground whole spices.',
    highlights: ['Whole spices, roasted & ground', 'No fillers or colours', 'Traditional family blend'] }),
  p({ category: 'grocery-staples', subcategory: 'Pasta & Noodles', name: 'Italian Penne Pasta', brand: 'GoldenHarvest', price: 1.99, unit: '500 g', rating: 4.3, reviewCount: 90, stock: 55, badges: [], imgOffset: 3,
    description: 'Bronze-die extruded penne pasta made from durum wheat semolina.',
    highlights: ['Bronze-die extruded for texture', '100% durum wheat', 'Al dente in 11 minutes'] }),
  p({ category: 'grocery-staples', subcategory: 'Rice & Grains', name: 'Whole Wheat Atta Flour', brand: 'GoldenHarvest', price: 6.49, unit: '5 kg', rating: 4.4, reviewCount: 76, stock: 0, badges: [], imgOffset: 4,
    description: 'Stone-ground whole wheat flour for soft, wholesome flatbreads.',
    highlights: ['Stone-ground for texture', '100% whole wheat', 'No bleaching agents'] }),

  // ---------------- Personal Care ----------------
  p({ category: 'personal-care', subcategory: 'Hair Care', name: 'Herbal Shampoo', brand: 'PureBite', price: 4.99, unit: '400 ml', rating: 4.4, reviewCount: 143, stock: 38, badges: ['bestseller'], imgOffset: 0,
    description: 'Sulphate-free herbal shampoo that gently cleanses while nourishing hair.',
    highlights: ['Sulphate & paraben free', 'Infused with herbal extracts', 'Suitable for daily use'] }),
  p({ category: 'personal-care', subcategory: 'Bath & Body', name: 'Moisturizing Body Lotion', brand: 'NatureValu', price: 5.49, oldPrice: 6.99, unit: '300 ml', rating: 4.6, reviewCount: 108, stock: 29, badges: ['deal'], imgOffset: 1,
    description: '24-hour moisturizing body lotion with shea butter and vitamin E.',
    highlights: ['24-hour hydration', 'Shea butter & vitamin E', 'Fast-absorbing, non-greasy'] }),
  p({ category: 'personal-care', subcategory: 'Oral Care', name: 'Fluoride Toothpaste', brand: 'DailyBasket', price: 2.49, unit: '150 g', rating: 4.3, reviewCount: 95, stock: 66, badges: [], imgOffset: 2,
    description: 'Cavity-protection toothpaste with fluoride and a refreshing mint flavour.',
    highlights: ['Cavity protection formula', 'Refreshing mint flavour', 'Dentist recommended'] }),
  p({ category: 'personal-care', subcategory: 'Skin Care', name: 'Aloe Vera Face Wash', brand: 'GreenLeaf', price: 3.99, unit: '150 ml', rating: 4.5, reviewCount: 87, stock: 41, badges: ['new'], imgOffset: 3,
    description: 'Gentle, soap-free face wash with pure aloe vera for a fresh, calm complexion.',
    highlights: ['Soap-free, gentle formula', 'Pure aloe vera extract', 'Suitable for daily use'] }),
  p({ category: 'personal-care', subcategory: 'Bath & Body', name: 'Moisturizing Bar Soap', brand: 'PureBite', price: 3.29, unit: 'Pack of 4', rating: 4.2, reviewCount: 58, stock: 0, badges: [], imgOffset: 4,
    description: 'Creamy moisturizing bar soap that cleanses without drying out skin.',
    highlights: ['Moisturizing, non-drying', 'Pack of 4 bars', 'Gentle everyday fragrance'] }),

  // ---------------- Household & Cleaning ----------------
  p({ category: 'household', subcategory: 'Cleaning Supplies', name: 'Liquid Dish Soap', brand: 'HomeStyle', price: 2.79, unit: '750 ml', rating: 4.4, reviewCount: 112, stock: 58, badges: ['bestseller'], imgOffset: 0,
    description: 'Grease-cutting dish soap with a gentle formula that’s tough on grime.',
    highlights: ['Cuts through grease fast', 'Gentle on hands', 'Fresh citrus scent'] }),
  p({ category: 'household', subcategory: 'Cleaning Supplies', name: 'Multi-Surface Cleaner', brand: 'HomeStyle', price: 3.49, oldPrice: 4.29, unit: '1 L', rating: 4.3, reviewCount: 74, stock: 34, badges: ['deal'], imgOffset: 1,
    description: 'All-purpose multi-surface cleaner safe for kitchens, bathrooms and more.',
    highlights: ['Safe on most surfaces', 'Streak-free finish', 'Kills 99.9% of germs'] }),
  p({ category: 'household', subcategory: 'Detergents', name: 'Laundry Detergent Powder', brand: 'DailyBasket', price: 7.99, unit: '2 kg', rating: 4.5, reviewCount: 146, stock: 27, badges: ['trending'], imgOffset: 2,
    description: 'High-efficiency laundry powder that lifts stains even in cold water.',
    highlights: ['Effective in cold water', 'Removes tough stains', 'Long-lasting freshness'] }),
  p({ category: 'household', subcategory: 'Paper Products', name: 'Soft Toilet Paper', brand: 'HomeStyle', price: 5.99, unit: '12 rolls', rating: 4.6, reviewCount: 201, stock: 70, badges: ['bestseller'], imgOffset: 3,
    description: '3-ply soft toilet paper for everyday comfort and strength.',
    highlights: ['3-ply softness', 'Strong even when wet', '12-roll value pack'] }),
  p({ category: 'household', subcategory: 'Air Fresheners', name: 'Lavender Air Freshener Spray', brand: 'PureBite', price: 3.79, unit: '300 ml', rating: 4.1, reviewCount: 43, stock: 0, badges: ['new'], imgOffset: 4,
    description: 'Long-lasting lavender air freshener spray for a calm, fresh home.',
    highlights: ['Long-lasting fragrance', 'Calming lavender scent', 'Odour-neutralising formula'] }),
];

export function getProductBySlug(slug) {
  return PRODUCTS.find((prod) => prod.slug === slug);
}

export function getRelatedProducts(product, count = 4) {
  return PRODUCTS.filter((p2) => p2.category === product.category && p2.id !== product.id).slice(0, count);
}
