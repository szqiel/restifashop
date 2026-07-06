# Project Document - Restifashop

This document describes the current application architecture, schema, design system, and implementation state of Restifashop after the recent UI, auth, and image-quality pass.

---

## 1. Project Overview
Restifashop is a premium bedding and sleep essentials storefront built with Next.js, TypeScript, Zustand, Tailwind CSS v4, and Supabase.

The application combines:

* A customer storefront for browsing products and placing orders.
* A WhatsApp-based checkout flow instead of card payments.
* A hidden admin portal for login, order management, product management, and store customization.
* Supabase as the database, auth provider, and storage backend.

The current implementation is production-oriented, but still intentionally lightweight enough to run as a single codebase.

---

## 2. Runtime Architecture

### 2.1 Frontend
* Next.js 16.2.10 App Router
* React 19.2.4
* TypeScript
* Tailwind CSS v4
* Zustand for cart state

### 2.2 Backend and Data
* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage for product images
* Server route for order creation at `src/app/api/orders/route.ts`

### 2.3 Store Flow
1. User browses home, shop, or product detail pages.
2. User adds items to the cart.
3. User opens checkout modal and submits customer details.
4. Server creates the order and order items.
5. WhatsApp deep link is generated.
6. Customer is redirected to the order confirmation page.

---

## 3. Directory Structure

```text
restifashop/
├── public/
│   ├── images/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   ├── (customer)/
│   │   ├── api/orders/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── utils/supabase/
├── supabase/
│   └── migrations/
├── MD/
└── Designs/
```

---

## 4. Database Schema

### 4.1 Core Tables

#### `products`
Stores bedding catalog data.

Fields include:
* `id`
* `name`
* `description`
* `price`
* `discount_percentage`
* `category`
* `colors`
* `sizes`
* `images`
* `material`
* `care_instructions`
* `size_guide`
* `stock`
* `sold_count`
* `created_at`
* `updated_at`

#### `orders`
Stores customer order headers.

Fields include:
* `id`
* `order_number`
* `customer_name`
* `customer_phone`
* `customer_address`
* `customer_email`
* `subtotal`
* `status`
* `whatsapp_sent`
* `whatsapp_message`
* `notes`
* `created_at`
* `updated_at`

#### `order_items`
Stores each product line inside an order.

Fields include:
* `id`
* `order_id`
* `product_id`
* `quantity`
* `price_at_purchase`
* `color_selected`
* `size_selected`
* `created_at`

#### `emails`
Stores newsletter signups.

Fields include:
* `id`
* `email`
* `subscribed`
* `created_at`

#### `store_settings`
Added in the follow-up migration and used by the storefront and dashboard.

Fields include:
* `id`
* `home_collections`
* `shop_banner`
* `shipping_info`
* `return_info`
* `updated_at`

---

## 5. Security Model

### 5.1 Current Access Pattern
* Public users can read products.
* Public users can insert orders, order items, and newsletter emails.
* Admin-only access now depends on `user_metadata.role = admin`.

### 5.2 Important Change
The earlier “any authenticated user” style policies were replaced with a stricter `is_admin()` check in the migration. This better matches the hidden-admin design and prevents normal logged-in accounts from getting dashboard privileges.

### 5.3 Middleware
The middleware now:
* Redirects unauthenticated or non-admin traffic away from `/ibu-restifashop-dashboard`.
* Redirects logged-in admins away from the login route and into the dashboard.

---

## 6. Design System

### 6.1 Brand Direction
The visual language is still anchored in:
* Warm neutral surfaces
* Champagne gold conversion accents
* Editorial serif headlines
* Clean sans-serif utility text
* Quiet luxury bedding presentation

### 6.2 Global Tokens
`src/app/globals.css` now carries the shared visual foundation:
* Soft off-white surfaces
* Warm outlines and subtle borders
* A background gradient with a faint atmospheric texture
* A reusable `section-shell` layout helper
* A `gold-button` utility for brand-consistent CTA motion
* A `surface-panel` utility for frosted, premium containers

### 6.3 Spacing and Layout
The current refresh favors:
* Larger section breathing room
* Rounded 2xl containers
* More consistent max-width handling
* Less visual fragmentation between pages

### 6.4 Motion
Motion is intentionally restrained:
* Buttons lift slightly on hover
* Press states keep the tactile `scale(0.97)` behavior
* Hero and hero-like surfaces use soft entrance motion
* Heavy motion was avoided in favor of clarity and polish

---

## 7. Key UI Surfaces

### 7.1 Home Page
The home page now has:
* A taller hero carousel
* Better image framing and sharper hero image serving
* A cleaner curated collections section
* A more balanced new arrivals section

### 7.2 Shop Page
The shop page now has:
* A cleaner page header
* A refined filter toolbar
* Better product card spacing
* A premium banner block integrated into the grid
* Higher-fidelity image handling for product cards

### 7.3 Product Detail Page
The product page now has:
* Improved image sharpness and gallery behavior
* Better CTA styling
* Cleaner size guide modal styling
* Related product suggestions
* More coherent spacing between sections

### 7.4 Cart and Checkout
The cart drawer and checkout modal now feel more consistent with the rest of the site:
* Softer panels
* Better spacing
* Gold CTA behavior kept intact
* Clearer summary areas
* Less visual mismatch between overlay components

### 7.5 Order Confirmation
The confirmation page now uses the same visual language as the rest of the app instead of feeling like a leftover system page.

### 7.6 Admin Dashboard
The dashboard still functions as the primary administrative surface for:
* Viewing orders
* Editing order status and notes
* Managing products
* Uploading images to storage
* Editing store customization settings

It also received a few stability improvements:
* Safer file names using `crypto.randomUUID()`
* Safer image preview rendering
* More consistent panel styling

---

## 8. Image Strategy

### 8.1 Problems Addressed
The recent work targeted blurry or overly compressed imagery by improving the image delivery and sizing strategy.

### 8.2 What Changed
* Most important storefront images now use `quality={95}`.
* `sizes` attributes were added or normalized where needed.
* Hero and grid imagery now use better framing so photos do not feel clipped or stretched.
* Admin previews were converted toward `next/image` in places where that was practical.

### 8.3 Result
The app should now serve more appropriate image variants and preserve more detail on bedding textures, which matters a lot for this brand.

---

## 9. Verification Status

### 9.1 Successful
* `npm run build` passes.
* The Next.js app compiles successfully.
* Routes are generated correctly.
* The app is stable enough to ship a production build.

### 9.2 Still Outstanding
* ESLint still reports some `any` usage in the admin dashboard and order API.
* The Next.js build warns that the `middleware` file convention is deprecated and should eventually move to `proxy`.

---

## 10. Current Implementation Summary
The codebase now better reflects the intended product:

* The storefront feels visually unified.
* The gold brand accent remains intact.
* Image presentation is sharper.
* Admin access is more defensible.
* The missing `store_settings` schema is now documented and backed by migration.
* The checkout and product flow are cleaner and more coherent.

