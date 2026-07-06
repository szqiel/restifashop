# Project Context - Restifashop Development History

This document records the practical evolution of the Restifashop checkout, storefront, admin tooling, and visual system. It is intended to reflect what is actually in the codebase now, not only the original product idea.

---

## 1. Phase 1: Core Commerce Integrity
The first working version focused on making the shopping and checkout flow safe enough for real use.

* Stock is decremented after successful order creation in `src/app/api/orders/route.ts` so checkout reduces available inventory.
* WhatsApp order text is shortened when a cart contains more than three unique items, which avoids oversized URL failures and pushes customers to the confirmation page instead.
* Checkout validation was expanded to cover email format and international phone lengths while still sanitizing non-numeric characters.
* The cart store syncs across tabs by listening to `storage` events and rehydrating Zustand state when another tab changes `cart-storage`.

---

## 2. Phase 2: Hidden Admin Access
The admin flow was moved into a concealed route pair.

* Login lives at `/ibu-restifashop`.
* The dashboard lives at `/ibu-restifashop-dashboard`.
* The middleware now checks the authenticated Supabase user and only allows dashboard access when the user metadata role is `admin`.
* The login page still supports sign-up for admin accounts, but the route is now controlled by role-based middleware instead of just “any logged in user”.

---

## 3. Phase 3: Stable Supabase Integration
The repo was hardened for local development and Vercel-style production environments.

* All Supabase client creators now guard against placeholder or missing environment variables.
* The order API and middleware fall back safely when environment variables are not available, which prevents build-time or runtime crashes in non-production setups.
* The app uses server and browser Supabase helpers in `src/utils/supabase/`.

---

## 4. Phase 4: Product CMS and Catalog Editing
The admin dashboard evolved into a real content manager for the store.

* Admins can create, edit, and delete products directly in the dashboard.
* Products support categories, colors, sizes, stock, discounts, material, care instructions, and a custom `size_guide`.
* Product images can be uploaded to Supabase Storage and converted to public URLs.
* Custom category names are supported through the product form.
* The product detail page now shows a dedicated size guide modal and falls back to a default size table when no custom guide is set.

---

## 5. Phase 5: Brand Assets and Store Presentation
The storefront branding was aligned around the Restifashop identity.

* The logo was added as the favicon and used in the header and admin navbar.
* Promotional language around free shipping was removed from product content where it conflicted with the sale flow.
* The product and storefront surfaces were tuned toward a warm luxury bedding lookbook style.

---

## 6. Phase 6: Shared UI System Refresh
This is the most recent broad pass, and it touched the whole app shell.

* Global spacing, background, and panel treatment were updated in `src/app/globals.css` to create a more consistent premium surface.
* A reusable `section-shell` layout utility was added so the shared page width and gutters feel the same across pages.
* Gold buttons now keep the brand identity but use cleaner hover motion instead of generic heavy hover effects.
* The hero, shop filters, cart drawer, checkout modal, footer, order confirmation page, and product detail view all received spacing and hierarchy cleanup.
* Loading and content surfaces were shifted toward rounded 2xl panels and softer borders to avoid the old mixed-card look.

---

## 7. Phase 7: Image Optimization and Sharpness
The image pipeline and usage patterns were improved to reduce blur and pixelation.

* `Image` components now use explicit `sizes` where practical so Next can serve more appropriate source sets.
* Quality was normalized to `95` for primary storefront imagery, which helps preserve photographic detail on bedding textures.
* Hero and product images were adjusted to keep better framing while reducing aggressive cropping.
* Admin previews for uploaded images now use `next/image` instead of raw `<img>` elements where possible.

---

## 8. Phase 8: Structural Fixes from the Audit
The recent audit surfaced several structural issues that were then corrected.

* The app depended on `store_settings` in multiple places, but the original schema did not define it. A new migration now creates `store_settings` and seeds a default row.
* The schema and docs now acknowledge `home_collections`, `shop_banner`, `shipping_info`, and `return_info` as first-class store settings.
* RLS policies were tightened so `authenticated` is not treated as admin by default. Admin capabilities now depend on the `user_metadata.role = admin` check.
* The middleware access rule now matches the intended hidden-admin behavior more closely.

---

## 9. Phase 9: Current Verification State
The current codebase is in a better state than before this pass.

* `npm run build` succeeds.
* The app routes compile and render under Next.js 16.2.10.
* ESLint still reports a few remaining type-safety and cleanup issues, mainly in the dashboard and order API, but they no longer block the production build.
* The Next.js build still warns that the `middleware` file convention is deprecated and should eventually move to `proxy`.

---

## 10. What Changed Most Recently
The most recent work focused on making the app feel like one coherent product instead of a collection of separate pages.

* Shared background, spacing, and panel styling were normalized.
* The hero section was rewritten to be taller, cleaner, and sharper.
* The shop and home pages now use the same layout shell and clearer content hierarchy.
* The product detail page now includes related products, improved button treatment, sharper image handling, and a clearer size-guide modal.
* Checkout and order confirmation were cleaned up to better match the rest of the storefront.
* The admin dashboard image uploads now use safer file naming and more stable preview rendering.

