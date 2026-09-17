// Store branch/location data - fetched from the ERP's public branches API
// (business_id from .env). Falls back to an empty list on any failure so a
// down/misconfigured API never breaks the site (per CLAUDE.md #13).

import { http } from './http';
import { unsplash } from '@/data/categories';

const FALLBACK_IMAGE = unsplash('1601599561213-832382fd07ba', 400, 300);
const FALLBACK_DELIVERY_NOTE = 'Delivery available - contact branch for details';

let cachedBranches = [];

function mapBranch(b) {
  const hours = [b.open_time, b.close_time].filter(Boolean).join(' – ');
  return {
    id: b.branch_id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    hours: hours || 'Contact branch for hours',
    deliveryNote: FALLBACK_DELIVERY_NOTE,
    image: FALLBACK_IMAGE,
  };
}

export async function fetchBranches() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return cachedBranches;

  try {
    const { data } = await http.get(`/v1/branches/${businessId}`);
    if (data?.Success && Array.isArray(data?.Data)) {
      cachedBranches = data.Data.map(mapBranch);
    }
  } catch {
    // keep last-known branches (possibly empty) rather than breaking the site
  }

  return cachedBranches;
}

export function findBranch(id) {
  return cachedBranches.find((b) => b.id === id);
}

export { cachedBranches as BRANCHES };
