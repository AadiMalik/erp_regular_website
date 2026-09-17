# Cursor Project Rules

## Mandatory CLAUDE.md Instruction

Before implementing, modifying, refactoring, or debugging anything in this project, **always read and follow the project's `CLAUDE.md` file**.

`CLAUDE.md` is the **authoritative project development instruction file** and its rules must be treated as mandatory.

* Do not ignore `CLAUDE.md`.
* Do not contradict `CLAUDE.md`.
* Do not create an alternative architecture that conflicts with `CLAUDE.md`.
* Do not duplicate the complete rules from `CLAUDE.md` in Cursor rules.
* If a rule in `CLAUDE.md` applies to the requested task, follow it automatically.
* If the requested implementation conflicts with `CLAUDE.md`, identify the conflict before making changes.
* User instructions have priority when they explicitly request a change to an existing project rule.

## Project Context

This is a **Vue.js 3 ecommerce website** connected to a separate **Laravel ERP/CMS through APIs**.

The ERP/CMS is the **source of truth** for:

* Website content
* Theme selection
* Colors
* Styles
* Navigation
* Banners
* Pages
* Contact information
* SEO data
* Products
* Categories
* Brands
* Variations
* Stock
* Prices
* Branches
* Customers
* Orders
* Other configurable website data

Never connect the Vue application directly to the ERP database.

## Architecture

Always maintain this architecture:

ERP API
↓
Services / API Layer
↓
Stores / Composables
↓
Shared Components
↓
Theme Components
↓
Pages

Business logic must remain shared.

Theme components must primarily control:

* UI
* Layout
* Styling
* Animations
* Visual presentation

Do not duplicate cart, authentication, products, orders, checkout, API, or other business logic between themes.

## Theme System

The website must support **5–7 predefined themes**.

The active theme is selected from the ERP/CMS and must automatically be applied to the website.

Use a scalable theme architecture that allows additional themes to be added later without rewriting the application.

Themes must not contain duplicated business logic.

Use centralized CSS variables/theme tokens for CMS-controlled colors.

Support configurable values such as:

* Primary
* Secondary
* Accent
* Background
* Surface
* Text
* Heading
* Border
* Success
* Warning
* Error

Use a default/fallback theme when the API returns an invalid or missing theme.

Missing CMS values must never break the website. Always provide safe fallback values.

Do not create an unlimited/custom CSS builder. Use predefined and controlled theme/style options.

## CMS-Driven Website

Never hard-code CMS-controlled:

* Content
* Colors
* Theme settings
* Navigation
* Contact information
* Banners
* Hero content
* FAQs
* Testimonials
* Policies
* SEO data
* Website sections

Homepage sections must be designed so they can support:

* Enable/disable
* Ordering/reordering
* CMS configuration
* Future API integration

The architecture must allow the ERP to change the active theme, colors, website content, sections, and CMS data **without requiring Vue source-code changes**.

## API / Service Layer

All API communication must be handled through the service/API layer.

Do not put large or repeated API request logic directly inside Vue components or theme components.

Recommended structure:

src/services/api/

* client.js
* auth.js
* website.js
* products.js
* categories.js
* cart.js
* orders.js
* customers.js

`client.js` must contain common HTTP/API client configuration.

Each API service should handle its own domain:

* `products.js` → Product APIs
* `categories.js` → Category APIs
* `orders.js` → Order APIs
* `website.js` → CMS/theme/settings APIs
* `auth.js` → Authentication APIs
* `customers.js` → Customer APIs
* `cart.js` → Cart APIs

## Project Structure

Maintain a clean and scalable Vue.js 3 + Vite structure similar to:

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

## Theme Component Rules

Each theme may have its own UI components.

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

Theme-specific components must contain presentation/UI logic only.

If multiple themes use the same component structure, reuse shared components instead of unnecessarily duplicating them.

## Vue.js Rules

Use:

* Vue.js 3
* Vite
* Vue Router
* Reusable components
* Stores
* Composables
* Clean project structure
* Vue reactivity/state management

Prefer Vue state/reactivity instead of unnecessary direct DOM manipulation.

Avoid unnecessarily large components.

Use reusable components and avoid duplicate code.

## Existing Project Preservation

Before implementing anything:

1. Inspect the existing project.
2. Understand the current architecture.
3. Find existing reusable components/services/stores/composables.
4. Reuse existing architecture where appropriate.
5. Preserve existing functionality unless a change is explicitly requested.

Do not:

* Redesign existing pages unnecessarily.
* Modify unrelated files.
* Modify unrelated functionality.
* Delete existing files/assets without verifying they are unused.
* Add unnecessary libraries or dependencies.
* Replace existing architecture without a valid reason.

Preserve:

* Existing theme design
* Layout
* Animations
* Responsiveness
* Assets
* Visual identity

unless the user explicitly requests a change.

## Security

Never expose:

* API keys
* Secrets
* Passwords
* Database credentials
* Private configuration

in frontend code.

Never add arbitrary JavaScript execution through CMS fields.

Never connect Vue directly to the ERP database.

## Responsive Design

Every implementation must keep:

* Desktop
* Tablet
* Mobile

layouts working correctly.

Do not fix one viewport by breaking another.

## Validation

After major changes:

1. Run the project/build.
2. Fix compilation errors.
3. Fix broken imports.
4. Fix missing assets.
5. Fix runtime errors.
6. Check browser console errors.
7. Verify the requested functionality.
8. Verify existing functionality has not been unnecessarily broken.

## General Development Principle

Always prefer:

**Configuration over hard-coding**

**Reusable components over duplication**

**Shared business logic over theme-specific logic**

**ERP/CMS data over duplicated frontend master data**

**Scalable architecture over quick hacks**

**Existing architecture over unnecessary rewrites**

## Final Instruction

For every task, first inspect the existing implementation and `CLAUDE.md`.

Then determine:

1. What already exists.
2. Which existing components/services/stores can be reused.
3. Which ERP APIs are already available.
4. Whether the requested functionality belongs in the shared business layer or theme UI layer.
5. What is the smallest clean change required.

Implement the feature without unnecessarily changing unrelated code.

`CLAUDE.md` remains the project's primary source of development rules.
