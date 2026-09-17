// Smart Mart — a small Unsplash URL helper used as an image fallback
// wherever the ERP has no image (categories, branches). Category/subcategory
// and brand data is no longer hard-coded here — it comes from the ERP via
// services/categories.js.

export const unsplash = (id, w = 800, h = w) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
