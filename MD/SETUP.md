# SETUP.md: Quick Start & Deployment Guide

**Document:** Development Setup & Deployment Instructions  
**Status:** Ready for developers  
**Last Updated:** [Today's date]

---

## 1. Project Structure

```
sprei-store/
├── frontend/                          # React + TypeScript app
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductModal.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── CartSidebar.tsx
│   │   │   ├── CheckoutModal.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Toast.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── OrderConfirmation.tsx
│   │   │   └── NotFound.tsx
│   │   ├── hooks/
│   │   │   ├── useCart.ts
│   │   │   ├── useProducts.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── services/
│   │   │   ├── api.ts              # All API calls
│   │   │   ├── supabase.ts         # Supabase client init
│   │   │   └── whatsapp.ts         # WhatsApp URL generation
│   │   ├── styles/
│   │   │   ├── globals.css         # Tailwind + custom globals
│   │   │   └── animations.css
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── .env.local (local dev, not committed)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── admin.ts
│   │   │   └── newsletter.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── logging.ts
│   │   ├── utils/
│   │   │   ├── orderNumber.ts
│   │   │   ├── whatsapp.ts
│   │   │   └── validators.ts
│   │   ├── db.ts                   # Supabase client
│   │   └── server.ts              # Express app setup
│   ├── .env.example
│   ├── .env (local dev, not committed)
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_add_indexes.sql
│   └── config.toml
│
├── docs/
│   ├── PRD.md                      # Product requirements
│   ├── DESIGN.md                   # Design system
│   ├── API.md                      # API specification
│   └── SETUP.md                    # This file
│
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                  # GitHub Actions CI/CD
│       └── deploy.yml
│
└── README.md
```

---

## 2. Prerequisites

### Required Tools
- **Node.js:** v18+ (download from https://nodejs.org/)
- **pnpm:** v8+ (install with `npm install -g pnpm`)
- **Git:** v2+ (download from https://git-scm.com/)
- **Supabase CLI:** (optional, for local dev)

### Required Accounts
- **Supabase:** https://supabase.com/ (free tier works fine)
- **Vercel:** https://vercel.com/ (for frontend hosting)
- **Railway/Render:** https://railway.app/ or https://render.com/ (for backend hosting)
- **GitHub:** https://github.com/ (for version control)

---

## 3. Local Development Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/sprei-store.git
cd sprei-store
```

### Step 2: Setup Frontend

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev
```

**Frontend .env.local:**
```
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (get from Supabase dashboard)
VITE_WHATSAPP_PHONE=628777750028
```

### Step 3: Setup Backend

```bash
cd ../backend

# Copy environment template
cp .env.example .env

# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev
```

**Backend .env:**
```
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJ... (public key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret key, never expose)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt_hash_of_password>
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
WHATSAPP_PHONE_NUMBER=628777750028
```

**Generate admin password hash:**
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your_password_123', 10);
console.log(hash);
// Copy output to ADMIN_PASSWORD_HASH in .env
```

### Step 4: Setup Supabase

1. Go to https://supabase.com/ → Create new project
2. Choose **Singapore** region (closer to Indonesia)
3. Wait for project to initialize (2-3 minutes)
4. Go to **SQL Editor** → New Query
5. Copy & paste entire contents of `supabase/migrations/001_initial_schema.sql`
6. Click "Run"
7. Verify tables created: Go to **Table Editor** (should see `products`, `orders`, `order_items`, `emails`)
8. Get API keys: **Settings → API** → Copy `URL` and `anon key`

**Enable Row Level Security (RLS):**

In SQL Editor, run:
```sql
-- Allow public to read products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_read_products" ON products FOR SELECT USING (true);

-- Allow public to insert orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert_orders" ON orders FOR INSERT WITH CHECK (true);

-- Allow public to insert order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Allow public to insert newsletters
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert_emails" ON emails FOR INSERT WITH CHECK (true);
```

### Step 5: Seed Sample Products

1. In Supabase SQL Editor, run:

```sql
INSERT INTO products (name, description, price, discount_percentage, category, colors, sizes, images, material, care_instructions, stock, sold_count)
VALUES
  (
    'Sprei Katun Premium Double',
    'Sprei dengan bahan katun 100% berkualitas tinggi, lembut dan nyaman untuk tidur panjang. Cocok untuk kasur ukuran double/full size.',
    184000,
    8,
    'sprei',
    '["blue", "green", "white"]'::jsonb,
    '["single", "double", "queen"]'::jsonb,
    '["https://via.placeholder.com/300?text=Sprei+Blue"]'::jsonb,
    '100% Cotton',
    'Cuci dengan air hangat, jangan pemutih, keringkan di tempat teduh',
    45,
    280
  ),
  (
    'Bedcover Rumbai Queen',
    'Bedcover premium dengan hiasan rumbai tepi, elegan dan mewah. Material katun lembut dan tahan lama untuk penggunaan sehari-hari.',
    350000,
    5,
    'bedcover',
    '["green", "pink", "cream"]'::jsonb,
    '["double", "queen", "king"]'::jsonb,
    '["https://via.placeholder.com/300?text=Bedcover+Green"]'::jsonb,
    '100% Cotton',
    'Cuci normal dengan detergen lembut, jangan pemutih',
    30,
    150
  );
```

2. Verify: Go to **Table Editor → products** → should see 2 sample products

### Step 6: Test Locally

1. Frontend: http://localhost:5173 → Should see products
2. Backend health check: `curl http://localhost:3000/api/products` → Returns product list
3. Admin login: Go to http://localhost:5173/admin → Try login with `admin` / `your_password_123`

---

## 4. Deployment

### Frontend: Deploy to Vercel

1. Push code to GitHub (assuming you have repo set up)
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to https://vercel.com → Sign in with GitHub → "New Project"

3. Select `sprei-store` repo → Click "Import"

4. Configure environment variables:
   - Click "Environment Variables"
   - Add all variables from `.env.example`:
     ```
     VITE_API_URL=https://sprei-api.railway.app/api  (or your backend URL)
     VITE_SUPABASE_URL=https://[project].supabase.co
     VITE_SUPABASE_ANON_KEY=eyJ...
     VITE_WHATSAPP_PHONE=628777750028
     ```

5. Click "Deploy" → Wait 2-3 minutes
6. Get live URL: `https://your-project-name.vercel.app`

### Backend: Deploy to Railway

1. Go to https://railway.app → Sign in with GitHub

2. Click "New Project" → "Deploy from GitHub repo"

3. Select `sprei-store` repo → Click "Deploy"

4. Railway auto-detects Node.js → Click "Deploy" again

5. Add environment variables:
   - Go to project **Variables** tab
   - Add all from `.env.example`:
     ```
     NODE_ENV=production
     PORT=3000
     SUPABASE_URL=https://[project].supabase.co
     SUPABASE_ANON_KEY=eyJ...
     SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret)
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD_HASH=<bcrypt>
     JWT_SECRET=<random_min_32_chars>
     WHATSAPP_PHONE_NUMBER=628777750028
     ```

6. Click "Deploy" → Wait 5-10 minutes

7. Get backend URL:
   - Go to **Deployment** → Copy public URL (e.g., `https://sprei-api-production.up.railway.app`)
   - Update frontend `VITE_API_URL` in Vercel env vars

### Database: Backup & Monitoring

1. **Automatic Backups (Supabase):**
   - Go to Supabase **Settings → Backups**
   - Daily backups auto-enabled
   - Retention: 7 days free tier

2. **Manual Backup:**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login
   supabase login

   # Backup database
   supabase db dump --db-url "postgresql://..." > backup.sql
   ```

3. **Monitoring:**
   - Supabase **Dashboard:** View CPU, memory, connection count
   - Railway **Metrics:** View CPU, memory, network
   - Vercel **Analytics:** View page load times, errors

---

## 5. Environment Variables Reference

### Frontend (.env.local)
```
# API
VITE_API_URL=http://localhost:3000/api        # Dev: localhost, Prod: backend domain
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Business
VITE_WHATSAPP_PHONE=628777750028
VITE_BUSINESS_NAME=Sprei Mom

# Optional
VITE_GA_ID=G-XXXXXXXXXX                       # Google Analytics (optional)
VITE_HOTJAR_ID=                               # Hotjar (optional)
```

### Backend (.env)
```
# Server
NODE_ENV=development|production
PORT=3000

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ... (public)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret)

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$... (bcrypt)
JWT_SECRET=min_32_character_random_secret_key

# Business
WHATSAPP_PHONE_NUMBER=628777750028

# Logging (Optional)
SENTRY_DSN=https://xxx@sentry.io/yyy
LOG_LEVEL=info|debug|warn|error
```

---

## 6. Common Commands

### Frontend
```bash
cd frontend

# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm preview                # Preview production build locally
pnpm lint                   # Run ESLint
pnpm format                 # Run Prettier

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e               # Run end-to-end tests (Cypress)
```

### Backend
```bash
cd backend

# Development
pnpm dev                    # Start dev server with nodemon
pnpm build                  # Compile TypeScript to JS
pnpm start                  # Run compiled JS

# Testing
pnpm test                   # Run unit tests
pnpm test:watch             # Watch mode

# Database
pnpm db:migrate             # Run pending migrations
pnpm db:seed                # Seed sample data
pnpm db:reset               # Drop & recreate (dev only!)
```

---

## 7. Database Migrations

### Create New Migration

```bash
cd backend

# Generate migration file
npx supabase migration new add_product_tags

# Edit: supabase/migrations/003_add_product_tags.sql
# Add SQL:
# ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]';

# Apply locally
supabase db push

# Push to prod (Supabase)
supabase db push --linked
```

---

## 8. Troubleshooting

### Frontend won't connect to backend
- ✅ Check `VITE_API_URL` in `.env.local`
- ✅ Verify backend is running (`localhost:3000`)
- ✅ Check CORS in backend `server.ts`
- ✅ Check browser console for network errors

### Can't login to admin
- ✅ Verify `ADMIN_USERNAME` & `ADMIN_PASSWORD_HASH` match
- ✅ Check JWT_SECRET is set and consistent
- ✅ Clear browser localStorage/cookies: `localStorage.clear()`

### Products not showing
- ✅ Verify Supabase tables created (SQL migration ran)
- ✅ Verify sample products inserted
- ✅ Check RLS policies allow public read: `SELECT * FROM products` in SQL Editor
- ✅ Check `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` are correct

### WhatsApp link not opening
- ✅ Verify phone number format: `62...` (no +, no -)
- ✅ Test URL manually: `https://wa.me/628777750028?text=test`
- ✅ Check message text is URL encoded

### Deployment fails on Railway
- ✅ Check `Procfile` exists or `package.json` has `start` script
- ✅ Check all env vars are set (no undefined references)
- ✅ View logs: Railway **Deployment → Logs**
- ✅ Rebuild: Click "Redeploy" or push new commit to GitHub

---

## 9. Performance Optimization

### Frontend
```javascript
// Enable lazy loading for routes
import { lazy, Suspense } from 'react';

const AdminPage = lazy(() => import('./pages/Admin'));

// Use in routes
<Suspense fallback={<Loading />}>
  <AdminPage />
</Suspense>

// Lazy load product images
<img src="..." loading="lazy" />

// Compress images before upload
// Use: https://tinypng.com/ or Cloudinary
```

### Backend
```javascript
// Cache product list (5 min)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getProductsWithCache = async () => {
  if (cache.has('products') && Date.now() - cache.get('products').time < CACHE_TTL) {
    return cache.get('products').data;
  }
  const data = await supabase.from('products').select();
  cache.set('products', { data, time: Date.now() });
  return data;
};

// Paginate results (don't fetch 1000 products at once)
// Use limit & offset in API
```

---

## 10. Monitoring & Alerts

### Setup Email Alerts (Railway)
1. Go to **Project Settings → Notifications**
2. Add email address
3. Select alerts: Deployment failure, High CPU, etc.

### Setup Uptime Monitoring (Free)
```bash
# Use pingdom.com or uptime.com
# Monitor: https://yourdomain.com/api/health
# Check interval: 5 mins
# Alert email: mom's email
```

---

## 11. Maintenance Checklist (Weekly)

- [ ] Check admin dashboard for new orders
- [ ] Review error logs (if set up)
- [ ] Verify products inventory is accurate
- [ ] Test WhatsApp checkout flow
- [ ] Monitor database performance (Supabase dashboard)
- [ ] Check uptime monitoring alerts
- [ ] Review customer feedback/emails

---

## 12. Security Checklist (Before Launch)

- [ ] HTTPS enabled on both frontend & backend
- [ ] Admin password changed from default
- [ ] JWT secret is strong (random, 32+ chars)
- [ ] Environment variables never committed to Git
- [ ] `.env` added to `.gitignore`
- [ ] Supabase RLS policies enabled
- [ ] CORS only allows your domain (not `*`)
- [ ] Rate limiting enabled on API
- [ ] SQL injection prevented (use parameterized queries)
- [ ] XSS prevention (escape user input, use React's built-in escaping)
- [ ] Database backups configured
- [ ] Error messages don't leak sensitive info
- [ ] WhatsApp phone number masked in frontend (show as 0877-775-00028)
- [ ] Customer email optional (don't force)

---

## 13. Post-Launch Support

### Bug Reporting
- Create GitHub issue with template:
  ```
  **Environment:** Production / Staging / Local
  **Browser:** Chrome 120 / Safari / Firefox
  **Device:** iPhone 14 / Desktop / Tablet
  **Steps to reproduce:**
  1. Go to...
  2. Click...
  3. See error...
  
  **Expected:** 
  **Actual:**
  **Screenshot/Video:**
  ```

### Hotfix Process
```bash
# 1. Create hotfix branch
git checkout -b hotfix/order-calculation-bug

# 2. Fix bug, test locally
pnpm test

# 3. Commit & push
git commit -m "Fix: order calculation for multi-item carts"
git push origin hotfix/order-calculation-bug

# 4. Create pull request → Merge to main → Auto-deploys
```

---

**Document Version:** 1.0  
**Last Updated:** [Today's date]  
**Status:** Ready for handoff  

---

## Quick Links

- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **GitHub Repo:** https://github.com/yourusername/sprei-store
- **Sentry (Errors):** https://sentry.io/organizations/...

End of SETUP.md
