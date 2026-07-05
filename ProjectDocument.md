# Project Document — Restifashop

This document provides a comprehensive summary of Restifashop's product requirements, system architecture, database schema, design system, and current application stage.

---

## 1. Project Overview & Architecture
Restifashop is a premium bedding and sleep essentials e-commerce storefront. The system is built using a modern decoupled serverless architecture:

*   **Frontend & Routing**: Next.js 16 (App Router) + TypeScript + Zustand (state management) + Tailwind CSS. Hosted on Vercel.
*   **Database**: Supabase (PostgreSQL) with Row Level Security (RLS) policies.
*   **Integrations**: Direct WhatsApp deep-linking checkout flow. Order totals are validated and locked on the server, generating a formatted WhatsApp link redirecting buyers to the seller's chat with their itemized order. No external payment gateways are required.

---

## 2. Directory Structure
The active codebase follows the standard Next.js directory convention:

```
restifashop/
├── public/                            # Public assets (logo.svg, etc.)
├── src/
│   ├── app/                           # App Router pages
│   │   ├── (admin)/                   # Admin routing group
│   │   │   ├── ibu-restifashop/       # Hidden Admin Login portal (self-service signup)
│   │   │   └── ibu-restifashop-dashboard/ # Hidden Admin Dashboard (Kelola Pesanan & Kelola Produk)
│   │   ├── (customer)/                # Customer storefront group
│   │   │   ├── product/[id]/          # Product details page (Skeletons & Size Guide)
│   │   │   └── shop/                  # Collections catalog page (Skeletons & dynamic filters)
│   │   ├── api/orders/                # Checkout processing API (Service role validation)
│   │   ├── order-confirmation/        # Post-checkout landing page
│   │   ├── globals.css                # Global Tailwind CSS custom styles
│   │   └── layout.tsx                 # Root layout & Metadata
│   ├── components/                    # Reusable components (Navbar, Footer, CartSidebar, CheckoutModal)
│   ├── lib/                           # Shared utility libraries (supabase.ts, whatsapp.ts)
│   ├── store/                         # Global Zustand stores (useCartStore.ts)
│   └── types/                         # TypeScript interfaces (index.ts)
├── supabase/
│   └── migrations/                    # SQL schema definitions (001_initial_schema.sql)
├── next.config.ts                     # Next.js configurations (image whitelist patterns)
├── package.json                       # Project configuration & scripts
└── tsconfig.json                      # TypeScript configuration
```

---

## 3. Database Schema & Security
The database is hosted on Supabase (PostgreSQL) and comprises four core tables:

### 3.1 Tables Structure

1.  **`products`**
    *   `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
    *   `name`: `TEXT` (Not Null)
    *   `description`: `TEXT`
    *   `price`: `DECIMAL(10,2)` (Not Null)
    *   `discount_percentage`: `INT` (Default: `0`)
    *   `category`: `TEXT` (Not Null, e.g., `'sprei'`, `'bedcover'`, `'selimut'`, `'aksesoris'`)
    *   `colors`: `JSONB` array of strings (Default: `[]`)
    *   `sizes`: `JSONB` array of strings (Default: `[]`)
    *   `images`: `JSONB` array of image URLs (Default: `[]`)
    *   `material`: `TEXT`
    *   `care_instructions`: `TEXT`
    *   `size_guide`: `TEXT` (Optional custom dimensions)
    *   `stock`: `INT` (Default: `0`)
    *   `sold_count`: `INT` (Default: `0`)
    *   `created_at` / `updated_at`: `TIMESTAMP WITH TIME ZONE`

2.  **`orders`**
    *   `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
    *   `order_number`: `VARCHAR(50)` (Unique, Not Null)
    *   `customer_name`: `TEXT` (Not Null)
    *   `customer_phone`: `TEXT` (Not Null)
    *   `customer_address`: `TEXT` (Not Null)
    *   `customer_email`: `TEXT` (Optional)
    *   `subtotal`: `DECIMAL(10,2)` (Not Null)
    *   `status`: `VARCHAR(50)` (Default: `'pending'`)
    *   `whatsapp_sent`: `BOOLEAN` (Default: `false`)
    *   `whatsapp_message`: `TEXT`
    *   `notes`: `TEXT` (Internal seller tracking notes)
    *   `created_at` / `updated_at`: `TIMESTAMP WITH TIME ZONE`

3.  **`order_items`**
    *   `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
    *   `order_id`: `UUID` (Foreign Key -> `orders.id` ON DELETE CASCADE)
    *   `product_id`: `UUID` (Foreign Key -> `products.id` ON DELETE RESTRICT)
    *   `quantity`: `INT` (Not Null)
    *   `price_at_purchase`: `DECIMAL(10,2)` (Not Null)
    *   `color_selected`: `VARCHAR(50)`
    *   `size_selected`: `VARCHAR(50)`
    *   `created_at`: `TIMESTAMP WITH TIME ZONE`

4.  **`emails`** (Newsletter Signups)
    *   `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
    *   `email`: `VARCHAR(255)` (Unique, Not Null)
    *   `subscribed`: `BOOLEAN` (Default: `true`)
    *   `created_at`: `TIMESTAMP WITH TIME ZONE`

### 3.2 Row Level Security (RLS) Policies
*   **`products`**: Read access open to the public (`SELECT true`). Write access disabled for public.
*   **`orders`**: Insert access open to the public (`INSERT true`). Read/Update only allowed for authenticated admins.
*   **`order_items`**: Insert access open to the public (`INSERT true`). Read/Update only allowed for authenticated admins.
*   **`emails`**: Insert access open to the public (`INSERT true`). Read/Update only allowed for authenticated admins.

---

## 4. Design System & Aesthetics
The website is styled using a modern lookbook design language:

*   **Color Palette**: Curated neutral warm tones (linen white `#faf9f9`, subtle borders `#e3e2e2`, and champagne gold `#d4af37` active highlights).
*   **Typography**: Serif font style headers (`Libre Caslon Text` / `Georgia`) paired with clean geometric body texts (`DM Sans`).
*   **Micro-interactions**: Hover effects utilize smooth spring scaling animations, and pressable CTA buttons scale to `0.97` to offer a tactile response.
*   **Brand Icon**: A customized vector circle gold monogram emblem (`logo.svg`) displayed in browser tabs as the favicon and in the header navbar next to the brand name.

---

## 5. Current App Stage & Working Features
The application is fully operational and has been optimized for production:

1.  **Instant Page Transitions**: Implemented animated loading skeletons (`loading.tsx`) on `/shop` and `/product/[id]` pages. Navigating between collections is immediate.
2.  **Optimized Parallel Caching**: Database queries on `/shop` utilize Next.js's `unstable_cache` running in parallel via `Promise.all`, dropping page rendering times to under 50ms.
3.  **Hidden Admin Portals**: Replaced guessable paths with secret routes. Accessing `/ibu-restifashop-dashboard` requires admin authorization, verified at the serverless edge via `middleware.ts`.
4.  **Product CMS & Media Upload**: The admin panel has a dedicated tab to view, delete, or create products. Creating a product supports file uploads directly to Supabase public storage bucket `product-images`, and supports typing dynamic custom categories.
5.  **Multi-Tab Syncing & Validation**: The cart instantly syncs across multiple open tabs. Checkout inputs validate email format and support international country codes.
