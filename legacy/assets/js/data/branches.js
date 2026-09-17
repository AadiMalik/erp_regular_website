// Smart Mart — store branch/location reference data.
// Static stand-in for a future `/api/branches` response.

import { unsplash } from './categories.js';

export const BRANCHES = [
  {
    id: 'downtown-springfield',
    name: 'Downtown Springfield',
    address: '221 Fresh Market Ave, Springfield',
    phone: '+1 (555) 010-2024',
    hours: 'Mon – Sun, 7am – 11pm',
    deliveryNote: 'Express delivery available · avg. 45 min',
    image: unsplash('1601599561213-832382fd07ba', 400, 300),
  },
  {
    id: 'westside-plaza',
    name: 'Westside Plaza',
    address: '48 Elmwood Boulevard, Springfield',
    phone: '+1 (555) 010-2087',
    hours: 'Mon – Sun, 8am – 10pm',
    deliveryNote: 'Standard delivery · avg. 2 hours',
    image: unsplash('1542838132-92c53300491e', 400, 300),
  },
  {
    id: 'northgate-market',
    name: 'Northgate Market',
    address: '1150 Cedar Ridge Road, Springfield',
    phone: '+1 (555) 010-2139',
    hours: 'Mon – Sun, 7am – 11pm',
    deliveryNote: 'Express delivery available · avg. 50 min',
    image: unsplash('1578916171728-46686eac8d58', 400, 300),
  },
  {
    id: 'riverside-corner',
    name: 'Riverside Corner',
    address: '76 Harbor View Street, Springfield',
    phone: '+1 (555) 010-2255',
    hours: 'Mon – Sat, 8am – 9:30pm',
    deliveryNote: 'Standard delivery · avg. 2.5 hours',
    image: unsplash('1534723452862-4c874018d66d', 400, 300),
  },
];

export function getBranch(id) {
  return BRANCHES.find((b) => b.id === id);
}
