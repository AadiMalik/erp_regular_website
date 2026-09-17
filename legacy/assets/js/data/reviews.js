// Smart Mart — sample testimonials & product review data.

export const TESTIMONIALS = [
  { name: 'Amelia Carter', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?img=32', rating: 5,
    quote: 'Smart Mart has completely replaced my weekly supermarket run. The produce arrives fresher than what I used to pick myself in-store.' },
  { name: 'Daniel Reyes', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?img=12', rating: 5,
    quote: 'Delivery is unbelievably fast and the app makes reordering my staples a two-tap job. Genuinely can\'t go back to regular grocery shopping.' },
  { name: 'Priya Nair', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?img=47', rating: 4,
    quote: 'Great range of organic options and the weekend deals are honestly some of the best prices I\'ve found online.' },
  { name: 'Marcus Chen', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?img=15', rating: 5,
    quote: 'Customer support helped me swap a damaged item within minutes. That kind of service is rare these days.' },
  { name: 'Sofia Rossi', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?img=45', rating: 5,
    quote: 'The freshness guarantee is real — every fruit and veg order has been better quality than my local store.' },
  { name: 'Ethan Walker', role: 'Verified Buyer', avatar: 'https://i.pravatar.cc/100?img=8', rating: 4,
    quote: 'Love the loyalty pricing on household essentials. Checkout is fast and the packaging is impressively eco-friendly.' },
];

const NAMES = ['Olivia Brooks', 'Liam Turner', 'Emma Scott', 'Noah Bennett', 'Ava Mitchell', 'James Cooper', 'Isabella Ward', 'Lucas Bailey'];
const COMMENTS = [
  'Exactly as described and arrived well packaged. Will definitely reorder.',
  'Good quality for the price. Freshness was better than expected.',
  'Solid everyday staple in our kitchen now — consistent quality every order.',
  'Delivery was quick and the item matched the product photos closely.',
  'Really happy with this one, works perfectly for what we needed.',
  'Decent product overall, though packaging could be a little sturdier.',
  'Great value, tastes/works great, and delivery was right on schedule.',
  'One of the better options I\'ve tried in this category — recommended.',
];

export function generateReviews(product) {
  const seed = product.id.charCodeAt(1) + product.name.length;
  const count = 3 + (seed % 4);
  const reviews = [];
  for (let i = 0; i < count; i += 1) {
    const idx = (seed + i * 3) % NAMES.length;
    const stars = Math.max(3, Math.round(product.rating) - (i % 2 === 0 ? 0 : 1));
    reviews.push({
      name: NAMES[idx],
      avatar: `https://i.pravatar.cc/80?img=${((seed + i * 7) % 70) + 1}`,
      rating: stars,
      date: new Date(Date.now() - (i + 1) * 9 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      comment: COMMENTS[(seed + i) % COMMENTS.length],
    });
  }
  return reviews;
}

export function ratingBreakdown(product) {
  const reviews = generateReviews(product);
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => { counts[r.rating - 1] += 1; });
  const total = reviews.length;
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: total ? Math.round((counts[star - 1] / total) * 100) : 0,
  }));
}
