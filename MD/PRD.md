# PRD: Sprei & Bedcover E-Commerce Store

**Product:** Mom's Sprei/Bedcover Online Store  
**Owner:** [Your mom's name/business]  
**Status:** POC → MVP  
**Target Launch:** 2-3 weeks  
**Reference:** Kintakun.co.id (Shopify-based competitor)

---

## 1. Executive Summary

A lightweight e-commerce website enabling customers to browse and order sprei, bedcovers, and related sleep products. **No payment processing**—checkout redirects directly to WhatsApp for order confirmation and payment arrangement. Database tracks orders for admin visibility.

**Key differentiator:** Direct WhatsApp integration instead of complex payment gateway. Faster to market, easier to manage, personal touch.

---

## 2. Product Vision

### Problem
Mom's bedding business is growing via Instagram & WhatsApp but lacks a professional, premium storefront. Customers must manually inquire for each product; no centralized catalog, order history, or perceived brand authority. Opportunity: elevate to "luxury bedding boutique" positioning.

### Solution
A **premium e-commerce site** (designed like a high-end hotel/editorial brand) where:
- Customers **browse & filter** 30+ products in a luxe-feeling interface
- Add to **persistent cart** (localStorage, remember across sessions)
- **Checkout redirects to WhatsApp** with pre-filled order details (seamless, no friction)
- Mom sees orders in a **simple admin dashboard** (password-protected, easy management)
- All orders logged in database for fulfillment tracking + future analytics
- **Brand positioning:** "Quiet luxury bedding for the discerning home" (not just budget retailer)

### Success Metrics
- ≥50 orders/month in first 2 months via site
- WhatsApp conversion rate > 40% (from browse to WhatsApp send)
- <5min time from landing to WhatsApp checkout
- Mom can manage orders in <10 min/day via admin panel
- High-end aesthetic increases perceived value + justifies premium pricing

---

## 3. User Personas

### Primary: End Customer (B2C)
- **Demographics:** 20–50 year-old Indonesian women, middle-class household, city/suburb
- **Behavior:** Browses Instagram, searches for bed linens, wants to see all options before deciding
- **Need:** Easy product discovery, clear pricing, fast checkout, reassurance (reviews, contact info)
- **Pain point:** Unsure which size/color to order; wants to compare

### Secondary: Mom (Admin/Seller)
- **Demographics:** Business owner, non-technical, focuses on inventory & customer service
- **Behavior:** Checks orders daily, replies on WhatsApp, ships via courier
- **Need:** Simple order list, customer contact info, order status tracking
- **Pain point:** Manually tracking orders in spreadsheets; missing repeat orders

---

## 4. Core Features

### 4.1 Frontend (Customer Facing)

#### Product Browsing
- **Product Grid** (mobile-responsive, 2 columns mobile / 3-4 desktop)
  - Product image (first photo in gallery)
  - Name
  - Price (discounted + original strikethrough)
  - Discount badge (e.g., "54%")
  - "Sold X+" badge if high volume
  - Stock status (in stock / out of stock)
- **Filters & Sorting**
  - **Category filter:** Sprei, Bedcover, Selimut, Aksesoris, etc. (mirror Kintakun's structure)
  - **Price range slider:** Rp 50K – Rp 500K
  - **Color filter:** e.g., Blue, Green, White, Pink, etc.
  - **Size filter:** Single, Double, Queen, King
  - **Sort:** Price (low-high, high-low), Newest, Most Sold

#### Product Details
- **Two view options:**
  1. **Modal view (quick view):** Image gallery, name, price, color/size selector, "Add to Cart" button
  2. **Full page:** Above + detailed description, materials, care instructions, customer reviews (optional), related products
- **Image gallery:** Multiple images with thumbnail slider
- **Variant selection:** Color + size dropdowns, real-time price update
- **In-stock indicator:** Gray out unavailable variants
- **"Add to Cart" action:**
  - Adds to localStorage
  - Shows toast notification ("Added to cart")
  - Cart count badge updates in navbar

#### Shopping Cart
- **Sidebar cart (persistent, always accessible)**
  - Product thumbnail + name + selected variant
  - Quantity +/- buttons (min 1)
  - Line item price
  - Remove item button (trash icon)
  - **Subtotal** (sum of all items)
  - **"Proceed to Checkout" button**
  - **"Continue Shopping" button** (collapses sidebar)
- **Cart persists across page refreshes** (localStorage key: `cart_items`)

#### Checkout Flow
- **Checkout Modal** (appears on "Proceed to Checkout" click)
  - **Customer Info Section:**
    - Name (required)
    - Phone number (required, format: 62812345... or 0812345...)
    - Address/delivery notes (required, multi-line)
    - Email (optional)
  - **Order Summary:**
    - Item list (product name × qty = line total)
    - Subtotal
    - Note: "Shipping cost calculated by seller via WhatsApp"
  - **Buttons:**
    - "Confirm & Send to WhatsApp" → generates WhatsApp link, saves order to DB, opens WhatsApp
    - "Cancel" → close modal

#### Navigation & Header
- **Logo & branding** (left)
- **Search bar** (center): Global product search
- **Right side:**
  - Login/Account icon (optional for MVP, skip if not needed)
  - Wishlist icon (optional, skip for MVP)
  - **Cart icon** with item count badge
  - **Mobile menu toggle** (hamburger)

#### Navigation Menu
- **Categories** (collapsible on mobile):
  - Sprei
  - Bedcover
  - Selimut
  - Aksesoris Tidur
  - Perlengkapan Rumah (optional, skip if mom only sells bed products)
  - New Arrival
  - Blog/Articles (link to external blog or Notion)

#### Footer
- **Links:** About, Contact, Return Policy, Warranty Info, Size Guide, Reseller Info
- **Social media:** Instagram, WhatsApp, TikTok, etc. (mirror Kintakun's footer)
- **Newsletter signup:** Email input + "Subscribe" button → saves to Supabase `emails` table
- **Contact info:** WhatsApp numbers, email address

#### Additional Pages
- **Homepage hero banner** (hero section with background image + CTA)
- **Product category landing pages** (e.g., `/category/sprei` shows only sprei)
- **Order Confirmation Page** (after WhatsApp redirect):
  - "Your order has been sent to our WhatsApp chat!"
  - Order ID (generated on backend)
  - Estimated response time ("We'll reply within 1 hour")
  - Link back to shop
- **Wishlist page** (optional, skip for MVP)
- **Account/Login** (optional, skip for MVP)

### 4.2 Backend (API)

#### Endpoints

**GET /api/products**
- Returns all products with filters
- Query params: `category`, `minPrice`, `maxPrice`, `color`, `size`, `sort`, `search`
- Response: `{ products: [...], total: N }`

**GET /api/products/:id**
- Returns single product with full details + related products

**GET /api/categories**
- Returns list of available categories

**POST /api/orders**
- Creates new order from checkout form
- Body: `{ customer_name, phone, address, email?, cart_items: [{product_id, quantity, price_at_purchase}] }`
- Returns: `{ order_id, order_number, whatsapp_message }`
- **Side effect:** Saves to `orders` + `order_items` tables in Supabase
- **Also:** Generates WhatsApp message URL

**POST /api/orders/confirm-whatsapp**
- Optional: Called after customer clicks WhatsApp link (marks order as "sent to whatsapp")

### 4.3 Database (Supabase)

#### Tables

**`products`**
```
id (UUID, PK)
name (TEXT)
description (TEXT)
price (DECIMAL 10,2)
discount_percentage (INT, default 0)  -- for badges
category (TEXT) -- "sprei", "bedcover", "selimut", etc.
colors (JSON array) -- ["blue", "green", "white"]
sizes (JSON array) -- ["single", "double", "queen"]
images (JSON array) -- URLs
material (TEXT)
care_instructions (TEXT)
stock (INT)
sold_count (INT) -- for "Sold X+" badges
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**`orders`**
```
id (UUID, PK)
order_number (VARCHAR, unique) -- "ORD-20250107-001"
customer_name (TEXT)
customer_phone (TEXT)
customer_address (TEXT)
customer_email (TEXT, nullable)
subtotal (DECIMAL 10,2)
status (VARCHAR) -- "pending", "confirmed", "shipped", "completed", "cancelled"
whatsapp_sent (BOOLEAN, default false)
whatsapp_message (TEXT) -- stored message for reference
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
notes (TEXT) -- internal notes from mom (e.g., "paid via transfer 20K")
```

**`order_items`**
```
id (UUID, PK)
order_id (UUID, FK → orders.id)
product_id (UUID, FK → products.id)
quantity (INT)
price_at_purchase (DECIMAL 10,2)
color_selected (VARCHAR)
size_selected (VARCHAR)
created_at (TIMESTAMP)
```

**`emails`** (for newsletter signup)
```
id (UUID, PK)
email (TEXT, unique)
subscribed (BOOLEAN, default true)
created_at (TIMESTAMP)
```

### 4.4 Admin Dashboard

#### Features
- **Simple login** (username + password, hardcoded or env var for MVP)
- **Orders list page:**
  - Table with columns: Order ID, Customer Name, Date, Status, Total, Action
  - **Filters:** Status (pending/confirmed/shipped), Date range
  - **Bulk actions:** Mark as shipped, export to CSV
  - **Click order → order detail modal:**
    - Full order info (customer name, phone, address)
    - Item list (product name, color, size, qty, price)
    - Order status dropdown (change status)
    - Notes field (mom can add internal notes)
    - "Copy WhatsApp text" button (copy pre-formatted message to clipboard)
- **Dashboard summary:**
  - Total orders (this month)
  - Total revenue (this month)
  - Pending orders count (urgency badge)
  - Top-selling products (small chart or list)
- **Products management** (optional for MVP, skip if not needed):
  - List products with price, stock, image
  - Edit product (basic form for price, stock, description)
  - Add new product

#### Authentication
- Simple login: Username + hardcoded password stored in `.env`
- Session stored in localStorage (JWT token if backend, or simple cookie)
- No password reset for MVP (mom manages this manually)

---

## 5. Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **State:** Zustand (lightweight) or Context API
- **Styling:** Tailwind CSS
- **UI Library:** Shadcn/ui or Headless UI (minimal, clean design)
- **HTTP Client:** Fetch API or Axios
- **Router:** React Router v6
- **Deployment:** Vercel

### Backend
- **Framework:** Node.js + Express (or Python + FastAPI for alternativ)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (for admin) or simple JWT
- **Hosting:** Railway, Render, or Vercel Serverless
- **Env:** dotenv for secrets

### Tools
- **Version Control:** Git + GitHub
- **Package Manager:** pnpm (faster than npm)
- **Build:** Vite
- **Database Migrations:** Supabase CLI or raw SQL

---

## 6. WhatsApp Integration

### Checkout → WhatsApp Flow

1. **Customer fills checkout form** → clicks "Confirm & Send to WhatsApp"
2. **Backend generates:**
   - Unique Order ID (e.g., `ORD-20250107-001`)
   - Order details message:
     ```
     *Pesanan Sprei & Bedcover*
     
     Nama: [Customer Name]
     No HP: [Phone]
     Alamat: [Address]
     
     *Detail Pesanan:*
     - 2x Sprei Katun Premium (Blue, Double) = Rp 184.000
     - 1x Bedcover Rumbai (Green, Queen) = Rp 350.000
     
     *Subtotal: Rp 534.000*
     (Ongkos kirim akan dikonfirmasi)
     
     Order ID: ORD-20250107-001
     ```
3. **Saves order to DB** with status `pending`
4. **Generates WhatsApp link:** `https://wa.me/628777750028?text=[URL_ENCODED_MESSAGE]`
5. **Redirects customer** to WhatsApp (or shows "Order sent! Check your WhatsApp" message)
6. **Mom receives message** in WhatsApp chat → replies with:
   - Shipping cost
   - Payment method (transfer, COD, etc.)
   - Payment proof request
7. **Mom updates order status** in admin dashboard (pending → confirmed → shipped → completed)

### WhatsApp Numbers
- Primary: `+62-877-7750-0028` (primary contact number, from Kintakun footer)
- Secondary: (optional, if mom has 2 numbers)

---

## 7. Non-Functional Requirements

### Performance
- Page load < 2s (Lighthouse Core Web Vitals)
- Cart operations instant (localStorage)
- Product search results in <500ms

### Scalability
- Support 1000+ products
- Support 100+ concurrent users
- Database designed for future growth (Supabase auto-scales)

### Security
- HTTPS only
- Supabase RLS (Row Level Security) for database
- Admin password hashed (bcrypt)
- No PII stored unnecessarily
- CSRF tokens on forms

### Mobile-First Design
- Responsive breakpoints: mobile (< 640px), tablet (640-1024px), desktop (>1024px)
- Touch-friendly buttons (min 44×44px)
- Fast tap response

### Accessibility
- WCAG 2.1 Level AA compliance
- Alt text on all product images
- Keyboard navigation support
- Color contrast ratios ≥4.5:1

---

## 8. Wireframes / User Flows

### User Flow: Browse → Add to Cart → Checkout
```
Home
  → Browse/Filter Products
    → Click Product (modal OR full page)
      → Select Variant (color, size)
        → Add to Cart
          → Cart sidebar shows item
            → Click "Checkout"
              → Fill Customer Info
                → Click "Confirm & Send to WhatsApp"
                  → Redirects to WhatsApp Web
                    → Order Confirmation Page ("Order sent!")
```

### Admin Flow: View Orders → Update Status
```
Login
  → Dashboard (overview)
    → Click "Orders"
      → Order List Table
        → Click Order Row
          → Order Detail Modal
            → Change Status Dropdown
              → Save
                → Status updated in DB + email mom notification (optional)
```

---

## 9. MVP Scope (Must Have)

- [x] Product browsing with grid + image gallery
- [x] Filters (category, price, color, size)
- [x] Shopping cart (localStorage)
- [x] Checkout form → WhatsApp redirect
- [x] Order database storage
- [x] Admin login + order list view
- [x] Responsive mobile design
- [x] Search bar
- [x] Newsletter signup
- [x] Footer with social links

## 10. Post-MVP Scope (Nice to Have)

- [ ] Product reviews/ratings
- [ ] Wishlist functionality
- [ ] Email notifications (order confirmation, shipping update)
- [ ] SMS notifications via Twilio
- [ ] Inventory auto-decrement on order
- [ ] Variant images (e.g., show "blue" image when color selected)
- [ ] Related products section
- [ ] FAQ / Help page
- [ ] Analytics (Google Analytics, Hotjar heatmaps)
- [ ] A/B testing (product descriptions, CTAs)
- [ ] Loyalty program (points, repeat discount)
- [ ] Live chat / Chatbot
- [ ] Multi-language support
- [ ] Multiple payment integrations (later)

---

## 11. Success Criteria & KPIs

### Month 1
- Site live and accessible
- ≥10 orders via site
- <5 support requests via site
- 100% uptime

### Month 2
- ≥30 orders via site
- 2+ repeat customers
- <2% cart abandonment rate
- Avg order value ≥ Rp 200K

### Month 3
- ≥50 orders via site
- 5+ repeat customers
- SEO: Home page ranked for "sprei [city]" keywords
- Mom spending <10 min/day on admin tasks

---

## 12. Competitive Advantage

**vs Kintakun (Shopify):**
- Simpler, faster checkout (direct WhatsApp)
- Lower overhead (no payment processing fees)
- Personal touch (direct mom conversation)
- Faster to build & iterate

**vs WhatsApp-only model:**
- Centralized product catalog (easier discovery)
- Order tracking & history
- Professional storefront
- SEO benefit (organic traffic)

---

## 13. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Design & Architecture | 3-5 days | Figma mockups, DB schema, API spec |
| Frontend Build | 1 week | Home, product pages, cart, checkout |
| Backend Build | 1 week | API, database, admin auth |
| Integration & Testing | 3-5 days | End-to-end testing, bug fixes |
| Deployment & Training | 2-3 days | Deploy to Vercel/Railway, train mom |
| **Total** | **2-3 weeks** | **Live MVP** |

---

## 14. Assumptions & Constraints

### Assumptions
- Mom has existing product photos (at least 1 per product)
- Mom has inventory list (product names, prices, stocks)
- Mom uses WhatsApp Business or personal WhatsApp (both work)
- 30-50 initial products (not 1000+)
- Payment handled offline (bank transfer, COD)

### Constraints
- No budget for payment gateway integration (MVP only)
- No budget for advanced shipping integration (mom ships manually)
- No live inventory sync (mom updates manually)
- Simple admin (no bulk product import initially)

### Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| WhatsApp API changes | Low | Medium | Use web.whatsapp.com links (free, stable) |
| Database downtime | Low | High | Supabase 99.9% SLA; backup to email alerts |
| Site gets hammered | Low | Medium | Vercel auto-scales; Supabase handles load |
| Mom forgets admin password | Medium | Low | Store in team LastPass or Notion |

---

## 15. Contact & Decision Makers

| Role | Name | Email |
|------|------|-------|
| Business Owner | Mom | [tbd] |
| Product Owner | [You] | [your email] |
| Lead Developer | [Agent/Team] | [agent email] |

---

**Document Version:** 1.0  
**Last Updated:** [Today's date]  
**Status:** Approved for MVP development  

---

## Appendix A: Feature Priorities (MoSCoW)

**Must Have:**
- Product browsing + filters
- Shopping cart
- Checkout → WhatsApp
- Admin order view

**Should Have:**
- Newsletter signup
- Search
- Mobile optimization

**Could Have:**
- Wishlist
- Product reviews
- Related products

**Won't Have (MVP):**
- Payment processing
- Inventory sync
- Email notifications
- Multi-language

---

## Appendix B: Brand Voice & Visual Direction

**Tone:** Sophisticated, serene, exclusive (editorial luxury magazine aesthetic)  
**Messaging:** "Quiet Luxury Bedding for the Discerning Home" (English) / "Kemewahan Tenang untuk Rumah Impian" (Bahasa Indonesia)  

**Visual Direction:**
- **Color Accent:** Champagne Gold (#d4af37)—signals premium, craftsmanship, timelessness
- **Fonts:** Libre Caslon Text (serif, heritage) + DM Sans (clean, modern)
- **Spacing:** Aggressive whitespace (80-120px between sections) → expensive, breathable feel
- **Imagery Style:** Editorial product photography, natural lighting, on-model or styled flat-lay (like In Bed magazine, not Shopee bargains)
- **Aesthetic:** Minimalist with tactile micro-interactions, high-end boutique hotel vibe

**Why Premium Positioning?**
- Justifies higher price points (Mom's products are HIGH-QUALITY, deserve premium perception)
- Attracts affluent, design-conscious buyers (higher lifetime value)
- Differentiates from competitors (Kintakun is generic Shopify; we're editorial luxury)
- Creates emotional connection to "self-care" ritual (not just "buying bedding")

**Logo:** (TBD—recommend serif + gold, minimalist mark)

---

End of PRD
