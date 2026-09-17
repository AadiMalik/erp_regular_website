// Smart Mart — Help Center FAQ reference data, grouped by category.

export const FAQ_CATEGORIES = [
  {
    id: 'orders',
    label: 'Orders',
    icon: 'fa-bag-shopping',
    items: [
      { q: 'How do I place an order?', a: 'Browse the shop, add items to your cart, then head to checkout. Sign in (or continue as a guest) to enter your delivery details and confirm payment.' },
      { q: 'Can I change or cancel my order after placing it?', a: 'You can cancel an order from My Orders as long as it has not moved past the "Processing" stage. Once an order ships, cancellation is no longer available — you can request a return instead after delivery.' },
      { q: 'How do I track my order?', a: 'Go to My Orders and select a specific order, or use Track My Order with your order number and email to see live status without signing in.' },
      { q: 'Do you offer reordering?', a: 'Yes — open any past order in My Orders and select Reorder to add the exact same items back to your cart.' },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping & Delivery',
    icon: 'fa-truck-fast',
    items: [
      { q: 'What are the delivery options?', a: 'We offer Standard (2–4 hours, free over $50), Express (within 60 minutes) and Scheduled delivery so you can pick a convenient time slot.' },
      { q: 'Which areas do you deliver to?', a: 'We currently deliver within the service radius of each Smart Mart branch. Choose your nearest branch using the store selector to see accurate delivery estimates.' },
      { q: 'Is delivery free?', a: 'Standard delivery is free on orders over $50. Below that, a flat $4.99 delivery fee applies.' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: 'fa-credit-card',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and Cash on Delivery.' },
      { q: 'Is my payment information secure?', a: 'Yes — all payments are processed over an encrypted, secure checkout.' },
      { q: 'Can I use a coupon code?', a: 'Yes, enter your coupon code in the Cart page before proceeding to checkout to see the discount applied to your order.' },
    ],
  },
  {
    id: 'returns',
    label: 'Returns & Refunds',
    icon: 'fa-rotate-left',
    items: [
      { q: 'What is your return policy?', a: 'Most items can be returned within 24 hours of delivery if you are not satisfied. See our full Returns & Refund Policy for perishable-item exceptions.' },
      { q: 'How do I request a return?', a: 'Open the relevant order in My Orders and select Return Item. Our support team will reach out to arrange pickup or a refund.' },
      { q: 'How long do refunds take?', a: 'Approved refunds are issued to your original payment method within 3–5 business days.' },
    ],
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: 'fa-user-shield',
    items: [
      { q: 'How do I create an account?', a: 'Select Create Account from the header menu, enter your details, and verify your email with the OTP code shown on screen.' },
      { q: 'I forgot my password — what do I do?', a: 'Use Forgot Password on the sign-in page, verify the OTP sent to your email, and set a new password.' },
      { q: 'Can I save multiple delivery addresses?', a: 'Yes — manage saved addresses anytime from your Profile page.' },
    ],
  },
];
