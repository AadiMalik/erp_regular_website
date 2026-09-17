# CLAUDE.md — Project Rules

## Core Rules

1. This is a Vue.js 3 ecommerce website connected to a separate Laravel ERP/CMS through APIs.
2. The ERP/CMS is the **source of truth** for website content, theme selection, colors, styles, navigation, banners, pages, and other configurable website data.
3. Never hard-code CMS-controlled content, colors, theme settings, navigation, contact information, banners, or page content in Vue.
4. The website must support **5–7 predefined themes**. The admin will select the active theme from the ERP, and the selected theme must automatically apply to the website.
5. Themes must be developed using a scalable architecture so another theme can be added later without rewriting the entire application.
6. Keep **business logic shared** between all themes. Do not duplicate cart, authentication, products, orders, API, checkout, or other business logic for each theme.
7. Theme-specific code should only control UI, layout, styling, animations, and visual presentation.
8. Admin must be able to control the website's **color combination**. Use centralized CSS variables/theme tokens instead of hard-coded colors.
9. Support configurable colors such as primary, secondary, accent, background, surface, text, heading, border, success, warning, and error colors.
10. Themes define the visual structure; CMS-defined colors and settings must be applied dynamically to the selected theme.
11. Do not create an unlimited/custom CSS builder. Use predefined and controlled theme/style options.
12. Use a default/fallback theme if the API returns an invalid or missing theme.
13. Missing CMS values must never break the website. Always provide safe fallback values.
14. Homepage sections must be CMS-friendly and should support enabling/disabling and changing section order in the future.
15. Navigation, footer, hero content, banners, FAQs, testimonials, policies, contact information, SEO data, etc. must be designed for future API/CMS integration.
16. Products, categories, brands, variations, stock, prices, branches, customers, and orders must come from the ERP API. Do not duplicate ERP master data unnecessarily.
17. Never connect the Vue application directly to the ERP database.
18. Keep API calls and API configuration in a separate service/API layer. Do not put large API logic directly inside UI components.
19. Use Vue.js 3, Vite, Vue Router, reusable components, and a clean professional project structure.
20. Use reusable components and avoid duplicate code. Do not create unnecessarily large components.
21. Preserve the existing theme design, layout, animations, responsiveness, assets, and visual identity unless a change is explicitly requested.
22. Do not redesign existing pages unnecessarily.
23. Do not add unnecessary libraries or dependencies.
24. Do not modify unrelated files or functionality while implementing a requested feature.
25. Do not delete existing files/assets unless you have verified they are unused.
26. Keep desktop, tablet, and mobile layouts working correctly.
27. Do not use unnecessary direct DOM manipulation when Vue state/reactivity can solve the problem.
28. Never expose API keys, secrets, passwords, database credentials, or private configuration in frontend code.
29. Never add arbitrary JavaScript execution through CMS fields.
30. After major changes, run the project/build and fix compilation errors, broken imports, missing assets, console errors, and runtime issues.
31. Before implementing anything, inspect the existing project and reuse existing components/architecture where appropriate.
32. Always prefer **configuration over hard-coding, reusable components over duplication, shared business logic over theme-specific logic, and scalable architecture over quick hacks**.
33. The final architecture must make it easy to change the active theme, colors, website content, sections, and CMS data from the ERP without requiring Vue source-code changes.

## Vue.js Project Structure

Use a clean and scalable Vue.js 3 + Vite structure similar to:

src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── product/
│   ├── category/
│   └── sections/
├── themes/
│   ├── theme-1/
│   ├── theme-2/
│   ├── theme-3/
│   ├── theme-4/
│   ├── theme-5/
│   ├── theme-6/
│   └── theme-7/
├── layouts/
├── pages/
├── router/
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   └── website.js
│   └── services/
├── stores/
├── composables/
├── utils/
├── constants/
├── config/
├── App.vue
└── main.js

## Theme Component (TC) Rules

Each theme must have its own theme-specific UI components.

Example:

themes/
├── theme-1/
│   ├── components/
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── Hero.vue
│   │   ├── ProductCard.vue
│   │   ├── CategoryCard.vue
│   │   ├── Banner.vue
│   │   └── sections/
│   ├── layouts/
│   └── styles/
│
├── theme-2/
│   ├── components/
│   ├── layouts/
│   └── styles/
└── ...

Theme-specific components must only contain presentation/UI logic. Business logic must remain shared.

If multiple themes use the same component structure, reuse shared components instead of duplicating unnecessary code.

## Service Rules

All API communication must be handled through the service/API layer.

Components must not contain large or repeated API request logic.

Use:

services/
└── api/
    ├── client.js
    ├── auth.js
    ├── website.js
    ├── products.js
    ├── categories.js
    ├── cart.js
    ├── orders.js
    └── customers.js

`client.js` should contain the common HTTP/API client configuration.

Each service should handle its own API domain.

Example:

products.js → product APIs  
categories.js → category APIs  
orders.js → order APIs  
website.js → CMS/theme/settings APIs  
auth.js → authentication APIs

Keep API logic separate from Vue components and theme components.

## Architecture Rule

Use this separation:

ERP API
↓
Services
↓
Stores / Composables
↓
Shared Components
↓
Theme Components
↓
Pages

Themes must consume shared data/business logic and should only control how that data is presented.