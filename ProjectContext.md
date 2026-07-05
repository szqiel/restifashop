# Project Context — Restifashop Development History

This document details the chronological record of changes, fixes, and features implemented from the beginning of the workspace setup to the current production stage.

---

## 1. Phase 1: Technical & Checkout Integrity
We resolved five critical bugs affecting the shopping cart, checkout flow, and database integrity:

*   **Stock Decrement Integration**: Added logic in `/api/orders/route.ts` to loop through cart items and decrement their `stock` quantity inside the `products` table upon checkout success, preventing overselling.
*   **WhatsApp Link Truncation Safeguard**: Upgraded `src/lib/whatsapp.ts` and the order API. When a customer orders more than 3 unique items, we truncate the WhatsApp message text to a simple summary and link to `/order-confirmation?orderNumber=[id]` to prevent browser character limit crashes (which happen when URLs exceed 2000 characters).
*   **Edge Middleware Security Hardening**: Rewrote `src/middleware.ts` to ensure development fallbacks are strictly blocked in production (`process.env.NODE_ENV === 'production'`), preventing unauthorized access to the admin dashboard if Supabase credentials are not configured.
*   **Checkout Validation Upgrades**: Added standard email format checking and expanded phone validation to support international numbers (9–15 digits) while sanitizing input characters.
*   **Multi-Tab Cart Synchronization**: Configured a `storage` listener in the `Navbar.tsx` that rehydrates the Zustand cart store, syncing the cart item count immediately across all open browser tabs.

---

## 2. Phase 2: Hidden Portals & Admin Dashboard
Implemented a secure administrative portal and aligned it with the store's visual styling:

*   **Secret Administrative Entrance**: Moved the login page to `/ibu-restifashop` and enabled self-registration for new credentials.
*   **Secret Dashboard Routing**: Renamed the `/admin` path to `/ibu-restifashop-dashboard` to conceal it from brute-force attackers. Unauthenticated attempts to access it are intercepted by `middleware.ts` and redirected to `/ibu-restifashop`.
*   **Aligned Aesthetics**: Styled the dashboard canvas using warm, translucent linen cards and serif stats headers, matching the main lookbook storefront.

---

## 3. Phase 3: Performance & Load Optimizations
Resolved slow dynamic loading times and Vercel build crashes:

*   **Vercel Build Protection**: Added URL string validation checks in all Supabase client creators to prevent build-time crashes when cloud variables are missing.
*   **Edge Middleware Stability**: Wrapped Edge middleware database checks in `try-catch` blocks. If Supabase variables are unconfigured on Vercel, it defaults to warning logs instead of crashing with a `500 MIDDLEWARE_INVOCATION_FAILED` error.
*   **Instant UI Skeletons**: Created `loading.tsx` skeleton pages inside `/shop` and `/product/[id]` directories to enable instant page transitions.
*   **Parallel Query Caching**: Rewrote the collection loader to fetch products and unique categories in parallel (`Promise.all`) and wrapped them in Next.js's memory-caching `unstable_cache`. This reduced database load times from 5000ms to less than 50ms.

---

## 4. Phase 4: Product Catalog CMS
Created a comprehensive product manager for the admin portal:

*   **Kelola Produk Tab**: Added product management controls next to the Order tracker.
*   **Supabase Storage Image Upload**: Integrated a file selector inside the **Tambah Produk** modal that automatically uploads files to the public `product-images` bucket in Supabase Storage and returns the public URL.
*   **Dynamic Categories**: Supported custom category inputs. Selecting "Kategori Baru..." reveals a text input. Any newly created category is saved to the database and automatically populates the shop's filtering dropdowns.
*   **Sizing Guide Modal & Editor**:
    *   Created a **Panduan Ukuran** popup modal on the product page. If no size guide exists, it falls back to a clean bedding sizing table.
    *   Added a custom text editor inside the admin panel to specify unique dimensions per product.
    *   Added the `size_guide` column to database schemas and TS types.
*   **Custom Color Selectors**: Rewrote the color dot parser to support standard English and Indonesian names (e.g. `pink`, `merah`, `yellow`, `kuning`), including typo corrections (`whithe` -> `#ffffff`), and using raw string color fallbacks.

---

## 5. Phase 5: Branding Assets & Cleanup
*   **Favicon & Logo**: Replaced the default favicon with `icon.svg` based on `Restifashop_Logo.svg` for automatic favicon compilation. Added logo rendering next to headers in the Navbar and Admin Dashboard.
*   **Promo Cleanup**: Stripped out all `free shipping` (gratis ongkir) marketing text from product pages and detail accordions.
