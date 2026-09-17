// Builds the platform share links and the rich, ad-like message used by
// ShareModal. Facebook/LinkedIn's own unfurlers read OG tags from the
// target URL, but this SPA has no per-product server-rendered meta tags -
// so price/rating/description are folded into the shared text itself
// rather than relying on link previews alone.

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len - 1).trim()}…` : str;
}

export function buildProductShareText({ name, priceText, oldPriceText, rating, reviewCount, description, variations, url }) {
  const lines = [`🛍️ ${name || 'Check out this product'}`];

  if (priceText) {
    lines.push(oldPriceText ? `💰 ${priceText} (was ${oldPriceText})` : `💰 ${priceText}`);
  }
  if (rating) {
    lines.push(`⭐ ${rating}/5${reviewCount ? ` (${reviewCount} reviews)` : ''}`);
  }
  if (variations?.length) {
    lines.push(`📦 ${variations.map((v) => `${v.label}: ${v.priceText}`).join('  |  ')}`);
  }
  if (description) {
    lines.push(`📝 ${truncate(description, 140)}`);
  }
  lines.push('', url);
  return lines.join('\n');
}

export function getShareLinks({ url, text, title, image }) {
  const eu = encodeURIComponent(url);
  const et = encodeURIComponent(text);
  const etitle = encodeURIComponent(title || 'Check out this product');

  const links = {
    whatsapp: `https://wa.me/?text=${et}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${eu}&quote=${et}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${eu}`,
    twitter: `https://twitter.com/intent/tweet?url=${eu}&text=${etitle}`,
    telegram: `https://t.me/share/url?url=${eu}&text=${et}`,
    email: `mailto:?subject=${etitle}&body=${et}`,
  };
  if (image) {
    links.pinterest = `https://pinterest.com/pin/create/button/?url=${eu}&media=${encodeURIComponent(image)}&description=${etitle}`;
  }
  return links;
}
