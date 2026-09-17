import { findProductById } from '@/services/products';

export function wishlistItemKey(productId, variationId = null) {
  return variationId ? `${productId}:${variationId}` : String(productId);
}

/**
 * Map API wishlist rows to product-like objects for cards and drawers.
 */
export function mapWishlistItemsToProducts(items = []) {
  return (items || []).map((item) => {
    const productId = item.product_id;
    const variationId = item.product_variation_id || null;
    const cached = findProductById(productId);
    const apiProduct = item.product || {};

    let display = cached
      ? { ...cached }
      : {
          id: productId,
          slug: apiProduct.slug,
          name: apiProduct.name || 'Product',
          brand: apiProduct.brand,
          images: apiProduct.images?.length ? apiProduct.images : [''],
          price: 0,
          oldPrice: null,
          discount: 0,
          stock: null,
          badges: [],
          rating: 0,
          reviewCount: 0,
        };

    const variationLabel = apiProduct.variation_label || null;

    if (variationId && cached?.variations?.options) {
      const option = cached.variations.options.find((o) => String(o.id) === String(variationId));
      if (option) {
        display = {
          ...display,
          price: option.price,
          oldPrice: option.oldPrice,
          stock: option.stock,
          name: variationLabel ? `${display.name} (${variationLabel})` : display.name,
        };
      } else if (variationLabel) {
        display = { ...display, name: `${display.name} (${variationLabel})` };
      }
    }

    return {
      ...display,
      wishlistItemId: item.id,
      wishlistProductId: productId,
      wishlistVariationId: variationId,
      wishlistKey: wishlistItemKey(productId, variationId),
    };
  });
}
