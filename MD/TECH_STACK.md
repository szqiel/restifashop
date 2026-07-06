# TECH_STACK.md: Architecture & Technology Decisions

**Document:** Technology Stack Overview  
**Status:** Ready for development  
**Last Updated:** [Today's date]

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browsers                         │
│                    (Mobile + Desktop)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼ (HTTPS REST API)
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React)                           │
│              Vercel CDN + Automatic Scaling                 │
│        React Router, Tailwind CSS, TypeScript               │
│              State: Zustand + localStorage                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼ (REST API calls)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node/Express)                    │
│              Railway + Auto-scaling Containers              │
│         TypeScript, JWT Auth, Rate Limiting                 │
└────────────┬──────────────────────────────────────────┬────┘
             │                                          │
             ▼                                          ▼
    ┌─────────────────┐                    ┌──────────────────┐
    │  Supabase DB    │                    │  WhatsApp API    │
    │  (PostgreSQL)   │                    │  (Direct Links)  │
    │  Row Security   │                    │  Browser Opens   │
    │  Auto Backups   │                    │  wa.me/phone     │
    └─────────────────┘                    └──────────────────┘
```

---

## 2. Frontend Stack

### Framework & Language
- **React 18** (latest stable)
  - **Why:** Industry standard, large ecosystem, component-based
  - **Alternative considered:** Vue (lighter, but less job market)
  - **TypeScript:** Full type safety, fewer runtime bugs

- **React Router v6**
  - **Why:** Client-side routing, page transitions without reload
  - Routes: Home, ProductDetail, OrderConfirmation, Admin/Login, Admin/Orders

- **Vite** (build tool)
  - **Why:** 10x faster than Create React App, modern ESM-first
  - Build time: <1s hot reload, <10s production build

### State Management
- **Zustand** (lightweight) OR **Context API**
  - Cart state: `{ items, subtotal, isOpen }`
  - UI state: `{ isModalOpen, selectedProduct, filters }`
  - Why: No boilerplate (Zustand), no prop drilling (Context)
  - Alternative: Redux (overkill for this project)

- **localStorage**
  - Persist cart across page refreshes
  - Key: `cart_v1`, `user_preferences`
  - Custom hook: `useLocalStorage(key, defaultValue)`

### Styling
- **Tailwind CSS v4**
  - Utility-first CSS, consistent design tokens
  - Config maps to DESIGN.md colors/spacing
  - PostCSS for nesting, autoprefixer
  
- **CSS Animations**
  - Smooth transitions: 200-300ms
  - Respects `prefers-reduced-motion`
  - No external animation library (keep it minimal)

### UI Components
- **Headless UI** or **Radix UI** (optional, for modals/dropdowns)
  - Unstyled, fully customizable
  - Full control over styling (Tailwind)
  - Keyboard accessible out of the box
  
- **Shadcn/ui** (optional preset components)
  - Pre-built Tailwind components (buttons, cards, forms)
  - Or build from scratch with Headless UI

### HTTP & API
- **Fetch API** (built-in, no external dependency)
  - OR **Axios** if you prefer (thin wrapper, nice interceptors)
  - Custom hook: `useFetch(url, options)`
  - Error handling: User-friendly messages, retry logic

- **Supabase Client (JavaScript)**
  - Direct database reads: `supabase.from('products').select()`
  - Real-time subscriptions (optional future)
  - Authentication helpers

### Other Libraries
| Library | Purpose | Size |
|---------|---------|------|
| `react-router-dom` | Client-side routing | 68kb |
| `zustand` | State management | 3kb |
| `tailwindcss` | Styling | 0kb (dev only) |
| `clsx` | Conditional classnames | 2kb |
| `date-fns` | Date formatting | 10kb |
| `zod` | Form validation | 15kb |
| `react-hook-form` | Form handling | 9kb |
| `framer-motion` | Animations (optional) | 60kb |

**Total JS (gzipped): ~150-200kb**

### Development Tools
```json
{
  "devDependencies": {
    "typescript": "^5.0",
    "@types/react": "^18",
    "vite": "^5",
    "tailwindcss": "^4",
    "eslint": "^8",
    "prettier": "^3",
    "@testing-library/react": "^14",
    "vitest": "^1",
    "cypress": "^13"
  }
}
```

---

## 3. Backend Stack

### Runtime & Framework
- **Node.js 18+** (LTS version)
  - **Why:** JavaScript ecosystem, npm/pnpm packages, fast event loop
  - **Alternative:** Python Flask (heavier, slower startup)

- **Express.js** (minimal framework)
  - **Why:** Lightweight, 3 lines to start server, huge middleware ecosystem
  - **Alternative:** Fastify (faster, but smaller ecosystem)

- **TypeScript**
  - Compile-time type checking, auto-documentation
  - Dev: `ts-node` for hot reload
  - Prod: Compiled to JavaScript

### Database
- **Supabase (PostgreSQL)**
  - **Why:** 
    - Managed PostgreSQL (no DevOps)
    - Built-in Auth, Row-Level Security (RLS)
    - Real-time subscriptions (future)
    - Free tier supports ~1000 requests/min
  - **Connection pooling:** Via Supabase (Pgbouncer)
  - **Backup:** Auto daily backups, 7-day retention

- **Migrations**
  - SQL files in `supabase/migrations/`
  - Manual execution in Supabase SQL Editor
  - Or: `supabase db push` via CLI

### Authentication
- **JWT Tokens** (admin login)
  - Secret: `process.env.JWT_SECRET` (32+ chars, random)
  - Payload: `{ id: 'admin', username, iat, exp }`
  - Storage: localStorage on frontend
  - Sent via: `Authorization: Bearer <token>` header

- **Bcrypt** (password hashing)
  - Hash rounds: 10 (balance between speed & security)
  - Compare on login: `await bcrypt.compare(password, hash)`

### Middleware & Utilities
| Purpose | Package | Notes |
|---------|---------|-------|
| CORS | `cors` | Allow frontend domain |
| Body Parsing | Express built-in | JSON, URL-encoded |
| Rate Limiting | `express-rate-limit` | 100 req/15min per IP |
| Error Handling | Custom middleware | Consistent error format |
| Logging | `morgan` | HTTP request logging |
| Environment | `dotenv` | Load `.env` variables |
| Validation | `zod` or `joi` | Input validation schemas |

### File Structure
```
backend/
├── src/
│   ├── server.ts                 # Express app setup
│   ├── db.ts                     # Supabase client init
│   ├── routes/
│   │   ├── products.ts           # GET /api/products
│   │   ├── orders.ts             # POST /api/orders
│   │   ├── admin.ts              # GET /api/admin/orders
│   │   ├── auth.ts               # POST /api/auth/login
│   │   └── newsletter.ts         # POST /api/newsletter
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── logging.ts
│   ├── utils/
│   │   ├── orderNumber.ts        # ORD-20250107-001 generator
│   │   ├── whatsapp.ts           # Message builder
│   │   └── validators.ts
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── tests/
│   ├── products.test.ts
│   └── orders.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Testing
- **Jest** (unit tests)
  - Test files: `*.test.ts` or `*.spec.ts`
  - Coverage: Aim for >80% critical paths
  
- **Supertest** (API testing)
  ```javascript
  const res = await request(app).get('/api/products');
  expect(res.statusCode).toBe(200);
  ```

---

## 4. Database (Supabase/PostgreSQL)

### Schema
```
┌──────────────────┐     ┌──────────────────┐
│    products      │     │     orders       │
├──────────────────┤     ├──────────────────┤
│ id (UUID, PK)    │     │ id (UUID, PK)    │
│ name (VARCHAR)   │ ┌──→│ customer_name    │
│ price (DECIMAL)  │ │   │ customer_phone   │
│ category (VARCHAR)     │ customer_address │
│ colors (JSONB)   │ │   │ subtotal (DECIMAL)
│ sizes (JSONB)    │ │   │ status (VARCHAR) │
│ images (JSONB)   │ │   │ created_at       │
│ stock (INT)      │ │   └──────────────────┘
│ sold_count (INT) │ │   ┌──────────────────┐
│ created_at       │ │   │  order_items     │
└──────────────────┘ │   ├──────────────────┤
                     └──→│ order_id (FK)    │
                         │ product_id (FK)  │
                         │ quantity (INT)   │
                         │ price_at_purchase
                         └──────────────────┘
```

### Indexes
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### Row Level Security (RLS)
```sql
-- Products: Everyone can read
CREATE POLICY "allow_read" ON products FOR SELECT USING (true);

-- Orders: Anyone can insert, admin can read/update
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read" ON orders FOR SELECT USING (current_user_id = 'admin');

-- Similar for order_items
```

---

## 5. Deployment & Hosting

### Frontend: Vercel

**Why Vercel:**
- Automatic deployments from GitHub
- Global CDN (fast worldwide)
- Edge functions (future feature)
- Environment variables management
- Free tier: 100 GB bandwidth/month
- Zero-config for Next.js/React

**Process:**
1. Push to GitHub main → Auto-deploy
2. Preview URL for each PR
3. Automatic HTTPS
4. Instant rollback if needed

**Cost:** Free (generous free tier) → $20/month (pro)

### Backend: Railway or Render

**Why Railway:**
- Simple UI, one-click deploy
- Auto-scales containers
- Integrated PostgreSQL (not needed here)
- Free credits monthly ($5 value)
- Cost: ~$5-10/month for always-on

**Why Render (Alternative):**
- Free tier with 15min sleep limit (fine for MVP)
- Paid: ~$7/month for always-on
- Similar to Railway

**Process:**
1. Connect GitHub → Deploy
2. Environment variables in dashboard
3. Auto-deploys on push to main
4. Logs & monitoring in dashboard

**Cost:** Free (with limits) → $7-20/month (prod)

### Database: Supabase

**Why Supabase:**
- Managed PostgreSQL (no DevOps)
- Free tier: 500MB storage, 50K rows/month queries
- Built-in auth & RLS
- Auto backups
- Shared: $25/month → Dedicated: $599/month

**Cost:** Free (MVP) → $25-99/month (prod depending on scale)

---

## 6. Total Cost Breakdown (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Vercel (Frontend)** | $0 | $20 |
| **Railway (Backend)** | $0 (2 deploys) | $10 |
| **Supabase (Database)** | $0 | $25 |
| **Domain** (optional) | N/A | $12/year |
| **Email (transactional)** | N/A | $0-30 |
| **Analytics** | $0 | $0-100 |
| **TOTAL (MVP)** | **$0-1** | **$45-47/month** |

*Notes:*
- All services auto-scale within free limits
- Upgrade only when you hit limits
- Excellent for first 3-6 months

---

## 7. Security Decisions

| Concern | Decision | Why |
|---------|----------|-----|
| Passwords | Bcrypt (10 rounds) | Industry standard, slow by design |
| Sessions | JWT tokens | Stateless, scalable, no server session storage |
| Database | Supabase RLS | Built-in, no SQL injection risk |
| API Keys | Environment variables | Never commit secrets, rotate regularly |
| HTTPS | Enforced | Vercel/Railway auto-handle |
| CORS | Whitelist domains | Only allow your frontend domain |
| Rate limiting | Express middleware | Prevent brute force, DDoS |
| Input validation | Zod schemas | Catch bad data early |
| Error messages | Generic (prod) | Don't leak internals |

---

## 8. Performance Decisions

### Frontend
| Decision | Why |
|----------|-----|
| Lazy load images | Reduce initial page load |
| Code splitting | Load only needed chunks |
| Minified CSS | Tailwind purges unused classes |
| Gzip compression | Vercel auto-enables |
| Caching headers | Static assets cached 1 year |
| localStorage cart | Instant cart restore |

**Target:** Lighthouse score >90

### Backend
| Decision | Why |
|----------|-----|
| PostgreSQL indexes | Fast product queries (category, price) |
| Connection pooling | Reuse DB connections |
| Response caching | 5-min cache for product list |
| Pagination (limit 10) | Don't fetch 1000 items at once |
| Gzip responses | Reduce bandwidth |
| Redis caching | (optional future) |

**Target:** API response <200ms, 99.9% uptime

---

## 9. Monitoring & Observability

### Free Tier
- **Sentry (Error tracking):** Catch bugs in production
- **Google Analytics:** Traffic, user behavior
- **Uptime monitoring:** PingDom, UptimeRobot (free plans)
- **Railway logs:** View backend errors
- **Vercel analytics:** Page performance

### Paid Tier
- **Datadog:** Full observability
- **New Relic:** APM + monitoring
- **LogRocket:** Session replay

---

## 10. Future Tech (Post-MVP)

### Phase 2 (Month 4-6)
- [ ] Email notifications (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Product reviews & ratings
- [ ] Analytics dashboard
- [ ] A/B testing (Optimizely)
- [ ] Wishlist feature
- [ ] Multi-language support

### Phase 3 (Month 7+)
- [ ] Payment processing (Stripe, Midtrans)
- [ ] Live chat (Intercom, Drift)
- [ ] Chatbot (OpenAI)
- [ ] Recommendation engine (Algolia)
- [ ] Inventory management system
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

---

## 11. Known Limitations (MVP)

| Limitation | Why | Future Fix |
|-----------|-----|-----------|
| No payment gateway | Reduce complexity | Integrate Stripe/Midtrans month 3 |
| Manual inventory | Easier for mom | Auto-decrement when order placed |
| No email notifications | No email service cost | Add SendGrid month 2 |
| No shipping integration | Mom ships manually | Integrate Shipper API month 4 |
| WhatsApp only (no SMS) | WhatsApp free, SMS costs | Add Twilio month 3 |
| Single admin user | Simpler auth | Add Supabase Auth month 2 |
| No product variants | Simplified schema | Add variant images month 3 |

---

## 12. Development Workflow

### Git Branches
```
main (production, protected)
  ↑
staging (pre-production, tested)
  ↑
feature/product-grid
feature/checkout
feature/admin-dashboard
```

### Commit Convention
```
feat: add product search
fix: cart total calculation bug
docs: update API docs
chore: upgrade dependencies
test: add order validation tests
```

### PR Checklist
- [ ] Feature complete & tested
- [ ] Responsive (mobile + desktop)
- [ ] Accessibility checked (a11y)
- [ ] Performance acceptable (Lighthouse)
- [ ] No console errors/warnings
- [ ] Environment variables documented
- [ ] Database migrations included (if needed)

---

## 13. Alternatives Considered & Rejected

| Tool | Why Considered | Why Rejected |
|------|-----------------|-------------|
| **Next.js** | Better for SEO | Overkill for this project; Vite simpler |
| **Shopify** | Full e-commerce | Too expensive, inflexible |
| **Firebase** | Real-time DB | Overkill; Supabase more flexible |
| **AWS** | Most powerful | Too complex for MVP; Railway simpler |
| **Heroku** | Easy deploy | Expensive; Railway/Render better |
| **Redux** | Popular state mgmt | Too much boilerplate; Zustand lighter |
| **Stripe** (payment) | Industry standard | Direct WhatsApp simpler for MVP |
| **Sendgrid** (email) | Email service | Future; WhatsApp sufficient for MVP |

---

## 14. Version Management

### Node.js
- **Development:** Node 18.17+ (use `.nvmrc`)
  ```
  18.17.0
  ```
- **Production:** Railway/Vercel auto-use latest stable

### Package Manager
- **pnpm** (faster, better lockfile)
- Lock all dependencies (no `^` or `~` in production)

### Dependency Updates
- **Security patches:** Apply immediately
- **Minor updates:** Weekly checks
- **Major updates:** Quarterly, test thoroughly
- Use `pnpm audit` to check vulnerabilities

---

**Document Version:** 1.0  
**Last Updated:** [Today's date]  
**Status:** Ready for implementation  

---

End of TECH_STACK.md
