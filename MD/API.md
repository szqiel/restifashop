# API.md: Backend API Specification

**Document:** REST API & Backend Architecture  
**Status:** Ready for development  
**Last Updated:** [Today's date]

---

## 1. Overview

This document specifies all backend endpoints, request/response formats, authentication, and database interactions for the sprei e-commerce store.

**Tech Stack:**
- Runtime: Node.js 18+
- Framework: Express.js
- Database: Supabase (PostgreSQL)
- Authentication: JWT (admin), Supabase Auth (public)
- Hosting: Railway / Render / Vercel Serverless

---

## 2. Base Configuration

### Server Setup
```javascript
// .env
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJ... (public, safe to expose)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (secret, never expose)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=bcrypt_hash_here
WHATSAPP_PHONE_NUMBER=628777750028
JWT_SECRET=your_secret_key_here
NODE_ENV=production
PORT=3000
```

### CORS Configuration
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev
    'https://yourdomain.com',
  ],
  credentials: true,
}));
```

---

## 3. Authentication

### Admin Login (Username + Password)

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "mom_password_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "admin",
    "username": "admin",
    "role": "admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Username atau password salah"
}
```

**Implementation:**
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Simple check (for MVP, can use Supabase Auth later)
  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: 'admin', username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    token,
    expiresIn: 86400,
    user: { id: 'admin', username, role: 'admin' }
  });
});
```

### Middleware: Verify Admin Token
```javascript
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"
  
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.use('/api/admin', verifyToken); // Protect admin routes
```

---

## 4. Public Endpoints (No Auth Required)

### 4.1 GET /api/products

**Description:** Fetch all products with optional filters and sorting

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | null | Filter by category (e.g., "sprei", "bedcover") |
| `minPrice` | number | 0 | Filter by minimum price (Rp) |
| `maxPrice` | number | 999999999 | Filter by maximum price (Rp) |
| `color` | string | null | Filter by color |
| `size` | string | null | Filter by size |
| `sort` | string | "newest" | Sort order: "newest", "price-asc", "price-desc", "popular" |
| `search` | string | null | Search by product name |
| `page` | number | 1 | Pagination (10 items per page) |
| `limit` | number | 10 | Items per page |

**Example Requests:**
```
GET /api/products
GET /api/products?category=sprei&minPrice=100000&maxPrice=300000
GET /api/products?sort=popular&page=2
GET /api/products?search=katun&color=blue
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Sprei Katun Premium Double",
      "description": "Sprei dengan bahan katun 100% berkualitas tinggi...",
      "price": 184000,
      "discount_percentage": 8,
      "original_price": 200000,
      "category": "sprei",
      "colors": ["blue", "green", "white"],
      "sizes": ["single", "double", "queen"],
      "images": [
        "https://cdn.example.com/product1-blue.jpg",
        "https://cdn.example.com/product1-green.jpg"
      ],
      "material": "100% Cotton",
      "care_instructions": "Cuci dengan air hangat, jangan pemutih",
      "stock": 45,
      "sold_count": 280,
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2025-01-05T14:30:00Z"
    },
    { /* ... more products */ }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid minPrice value"
}
```

**Implementation:**
```javascript
router.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, size, sort, search, page = 1, limit = 10 } = req.query;
    
    let query = supabase.from('products').select('*');
    
    // Apply filters
    if (category) query = query.eq('category', category);
    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));
    if (color) query = query.contains('colors', [color]);
    if (size) query = query.contains('sizes', [size]);
    if (search) query = query.ilike('name', `%${search}%`);
    
    // Apply sorting
    if (sort === 'price-asc') query = query.order('price', { ascending: true });
    else if (sort === 'price-desc') query = query.order('price', { ascending: false });
    else if (sort === 'popular') query = query.order('sold_count', { ascending: false });
    else query = query.order('created_at', { ascending: false }); // newest
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
```

### 4.2 GET /api/products/:id

**Description:** Fetch single product by ID

**Example Request:**
```
GET /api/products/uuid-1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "name": "Sprei Katun Premium Double",
    "description": "Sprei dengan bahan katun 100% berkualitas tinggi, lembut dan nyaman untuk tidur panjang...",
    "price": 184000,
    "discount_percentage": 8,
    "original_price": 200000,
    "category": "sprei",
    "colors": ["blue", "green", "white"],
    "sizes": ["single", "double", "queen"],
    "images": [
      "https://cdn.example.com/product1-1.jpg",
      "https://cdn.example.com/product1-2.jpg",
      "https://cdn.example.com/product1-3.jpg"
    ],
    "material": "100% Cotton",
    "care_instructions": "Cuci dengan air hangat, jangan pemutih, keringkan di tempat teduh",
    "stock": 45,
    "sold_count": 280,
    "created_at": "2024-12-15T10:00:00Z",
    "updated_at": "2025-01-05T14:30:00Z"
  },
  "related_products": [
    { /* similar products, max 4 */ }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 4.3 GET /api/categories

**Description:** Fetch all available product categories

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Sprei",
      "slug": "sprei",
      "icon": "https://cdn.example.com/icon-sprei.svg",
      "product_count": 15
    },
    {
      "id": "cat-2",
      "name": "Bedcover",
      "slug": "bedcover",
      "icon": "https://cdn.example.com/icon-bedcover.svg",
      "product_count": 12
    },
    { /* ... more categories */ }
  ]
}
```

### 4.4 POST /api/orders

**Description:** Create new order (checkout)

**Request:**
```json
{
  "customer_name": "Siti Nurhaliza",
  "customer_phone": "628777750028",
  "customer_address": "Jl. Raya Ampel No 45, Semarang, Jawa Tengah 50123",
  "customer_email": "siti@example.com",
  "cart_items": [
    {
      "product_id": "uuid-1",
      "quantity": 2,
      "color_selected": "blue",
      "size_selected": "double",
      "price_at_purchase": 184000
    },
    {
      "product_id": "uuid-2",
      "quantity": 1,
      "color_selected": "green",
      "size_selected": "queen",
      "price_at_purchase": 350000
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "order_id": "ORD-20250107-001",
    "order_uuid": "uuid-order-1",
    "customer_name": "Siti Nurhaliza",
    "customer_phone": "628777750028",
    "subtotal": 718000,
    "status": "pending",
    "created_at": "2025-01-07T10:30:00Z",
    "whatsapp_message": "Pesanan dari Siti Nurhaliza...",
    "whatsapp_link": "https://wa.me/628777750028?text=Pesanan%20dari%20Siti..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: customer_phone, cart_items"
}
```

**Implementation:**
```javascript
router.post('/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address, customer_email, cart_items } = req.body;
    
    // Validation
    if (!customer_name || !customer_phone || !customer_address || !cart_items?.length) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // Generate order number
    const orderNumber = await generateOrderNumber();
    
    // Calculate subtotal
    const subtotal = cart_items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
    
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name,
        customer_phone,
        customer_address,
        customer_email,
        subtotal,
        status: 'pending',
        whatsapp_sent: false
      }])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Insert order items
    const orderItems = cart_items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      color_selected: item.color_selected,
      size_selected: item.size_selected,
      price_at_purchase: item.price_at_purchase
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Generate WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(order, cart_items);
    const whatsappLink = `https://wa.me/${customer_phone}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Update order with WhatsApp message
    await supabase
      .from('orders')
      .update({ whatsapp_message: whatsappMessage })
      .eq('id', order.id);
    
    res.status(201).json({
      success: true,
      data: {
        order_id: orderNumber,
        order_uuid: order.id,
        customer_name,
        customer_phone,
        subtotal,
        status: 'pending',
        created_at: order.created_at,
        whatsapp_message: whatsappMessage,
        whatsapp_link: whatsappLink
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Helper: Generate order number
async function generateOrderNumber() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact' })
    .gte('created_at', new Date().toISOString().split('T')[0]);
  
  const sequence = String((count || 0) + 1).padStart(3, '0');
  return `ORD-${date}-${sequence}`;
}

// Helper: Generate WhatsApp message
function generateWhatsAppMessage(order, items) {
  let message = `*Pesanan Sprei & Bedcover*\n\n`;
  message += `Nama: ${order.customer_name}\n`;
  message += `No HP: ${order.customer_phone}\n`;
  message += `Alamat: ${order.customer_address}\n\n`;
  message += `*Detail Pesanan:*\n`;
  
  items.forEach(item => {
    // Fetch product name (can be passed in request)
    message += `- ${item.quantity}x ${item.product_name} (${item.color_selected}, ${item.size_selected}) = Rp ${item.price_at_purchase.toLocaleString('id-ID')}\n`;
  });
  
  message += `\n*Subtotal: Rp ${order.subtotal.toLocaleString('id-ID')}*\n`;
  message += `(Ongkos kirim akan dikonfirmasi)\n\n`;
  message += `Order ID: ${order.order_number}`;
  
  return message;
}
```

### 4.5 POST /api/newsletter

**Description:** Subscribe to newsletter

**Request:**
```json
{
  "email": "customer@example.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Terima kasih, Anda sudah berlangganan newsletter kami"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email sudah terdaftar"
}
```

---

## 5. Admin Endpoints (Requires JWT Token)

### 5.1 GET /api/admin/orders

**Description:** Fetch all orders with filters (admin only)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | null | Filter by status (pending, confirmed, shipped, completed) |
| `dateFrom` | string | null | Filter orders created from this date (ISO 8601) |
| `dateTo` | string | null | Filter orders created until this date |
| `page` | number | 1 | Pagination page |
| `limit` | number | 20 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-order-1",
      "order_number": "ORD-20250107-001",
      "customer_name": "Siti Nurhaliza",
      "customer_phone": "628777750028",
      "customer_address": "Jl. Raya Ampel No 45, Semarang",
      "customer_email": "siti@example.com",
      "subtotal": 718000,
      "status": "pending",
      "whatsapp_sent": true,
      "created_at": "2025-01-07T10:30:00Z",
      "updated_at": "2025-01-07T10:30:00Z",
      "notes": null
    },
    { /* ... more orders */ }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Example Requests:**
```
GET /api/admin/orders
GET /api/admin/orders?status=pending
GET /api/admin/orders?dateFrom=2025-01-01&dateTo=2025-01-07&page=2
```

### 5.2 GET /api/admin/orders/:id

**Description:** Fetch single order with full details and items

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid-order-1",
      "order_number": "ORD-20250107-001",
      "customer_name": "Siti Nurhaliza",
      "customer_phone": "628777750028",
      "customer_address": "Jl. Raya Ampel No 45, Semarang",
      "customer_email": "siti@example.com",
      "subtotal": 718000,
      "status": "pending",
      "notes": "Pelanggan meminta dikirim Senin pagi",
      "created_at": "2025-01-07T10:30:00Z"
    },
    "items": [
      {
        "id": "uuid-item-1",
        "product_id": "uuid-prod-1",
        "product_name": "Sprei Katun Premium Double",
        "quantity": 2,
        "color_selected": "blue",
        "size_selected": "double",
        "price_at_purchase": 184000
      },
      {
        "id": "uuid-item-2",
        "product_id": "uuid-prod-2",
        "product_name": "Bedcover Rumbai Queen",
        "quantity": 1,
        "color_selected": "green",
        "size_selected": "queen",
        "price_at_purchase": 350000
      }
    ]
  }
}
```

### 5.3 PATCH /api/admin/orders/:id

**Description:** Update order status or notes

**Request:**
```json
{
  "status": "confirmed",
  "notes": "Pembayaran sudah diterima via transfer BNI"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

**Implementation:**
```javascript
router.patch('/orders/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
```

### 5.4 GET /api/admin/dashboard

**Description:** Get dashboard summary stats

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_orders_month": 15,
    "total_revenue_month": 2850000,
    "pending_orders_count": 3,
    "top_selling_products": [
      {
        "product_id": "uuid-1",
        "product_name": "Sprei Katun Premium Double",
        "sold_count": 28,
        "revenue": 5152000
      },
      { /* ... more */ }
    ],
    "recent_orders": [
      {
        "order_number": "ORD-20250107-001",
        "customer_name": "Siti Nurhaliza",
        "total": 718000,
        "status": "pending",
        "created_at": "2025-01-07T10:30:00Z"
      }
    ]
  }
}
```

### 5.5 GET /api/admin/export/orders

**Description:** Export orders to CSV (admin only)

**Query Parameters:**
- `dateFrom` (optional)
- `dateTo` (optional)
- `status` (optional)

**Response:** CSV file download
```
Order ID,Date,Customer Name,Phone,Address,Total,Status
ORD-20250107-001,2025-01-07,Siti Nurhaliza,628777750028,Jl. Raya Ampel...,718000,pending
...
```

---

## 6. Error Handling

### Standard Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "An unexpected error occurred"
}
```

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});
```

---

## 7. Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Terlalu banyak request, coba lagi nanti'
});

app.use('/api/', limiter);

// Stricter limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  message: 'Terlalu banyak percobaan login'
});

app.post('/api/auth/login', authLimiter, loginHandler);
```

---

## 8. Logging & Monitoring

### Request Logging
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));

// Custom logger for important events
const logEvent = (event, data) => {
  console.log(`[${new Date().toISOString()}] ${event}:`, data);
  // TODO: Send to external logging service (Sentry, Datadog, etc.)
};

// Usage in order creation
logEvent('ORDER_CREATED', { orderId: orderNumber, customerId: customer_phone });
```

### Sentry Integration (Error Tracking)
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## 9. Database Schema Reference

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage INT DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  colors JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  material VARCHAR(255),
  care_instructions TEXT,
  stock INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_category (category),
  INDEX idx_price (price),
  INDEX idx_created_at (created_at)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_email VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_message TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_customer_phone (customer_phone)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  color_selected VARCHAR(100),
  size_selected VARCHAR(100),
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);
```

---

## 10. Deployment Checklist

- [ ] Environment variables configured (.env on server)
- [ ] Database migrations run (Supabase)
- [ ] CORS properly configured (frontend domain)
- [ ] Rate limiting enabled
- [ ] Error logging configured (Sentry or similar)
- [ ] HTTPS enforced
- [ ] Admin password hashed (bcrypt)
- [ ] JWT secret generated (strong random)
- [ ] WhatsApp number verified
- [ ] Database backups configured (Supabase auto)
- [ ] Monitoring & alerts set up
- [ ] Health check endpoint tested

---

## 11. Testing

### Example Test Cases (Jest)

```javascript
describe('GET /api/products', () => {
  it('should return all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should filter by category', async () => {
    const res = await request(app).get('/api/products?category=sprei');
    expect(res.body.data.every(p => p.category === 'sprei')).toBe(true);
  });

  it('should sort by price ascending', async () => {
    const res = await request(app).get('/api/products?sort=price-asc');
    const prices = res.body.data.map(p => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

describe('POST /api/orders', () => {
  it('should create order with valid data', async () => {
    const res = await request(app).post('/api/orders').send({
      customer_name: 'Test User',
      customer_phone: '628777750028',
      customer_address: 'Test Address',
      cart_items: [{
        product_id: 'uuid-1',
        quantity: 1,
        price_at_purchase: 100000
      }]
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.order_number).toBeDefined();
  });

  it('should reject missing required fields', async () => {
    const res = await request(app).post('/api/orders').send({
      customer_name: 'Test'
      // missing other fields
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

---

**Document Version:** 1.0  
**Last Updated:** [Today's date]  
**Status:** Ready for implementation  

End of API.md
