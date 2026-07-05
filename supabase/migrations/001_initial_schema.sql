-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage INT DEFAULT 0,
  category TEXT NOT NULL, -- 'sprei', 'bedcover', 'selimut', 'aksesoris'
  colors JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  material TEXT,
  care_instructions TEXT,
  stock INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_email TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);

-- 3. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  color_selected VARCHAR(50),
  size_selected VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create emails table (for newsletter signups)
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- 7. Define RLS Policies

-- PRODUCTS policies
CREATE POLICY "Allow public read access to products" ON products 
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admins to write products" ON products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ORDERS policies
CREATE POLICY "Allow public to insert orders" ON orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to view/update orders" ON orders 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ORDER_ITEMS policies
CREATE POLICY "Allow public to insert order_items" ON order_items 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to view/update order_items" ON order_items 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- EMAILS policies
CREATE POLICY "Allow public to subscribe to newsletter" ON emails 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to view/update emails" ON emails 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Seed sample bedding products
INSERT INTO products (id, name, description, price, discount_percentage, category, colors, sizes, images, material, care_instructions, stock, sold_count)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Aurelian Signature Bedcover Set',
    'Set bedcover premium dengan detail rumbai tepi berbahan katun mesir 100%. Sangat lembut, sejuk, dan memberikan kenyamanan tidur kelas hotel bintang lima di kamar Anda.',
    1250000,
    10,
    'bedcover',
    '["Champagne Gold", "Soft Cream", "Linen Grey"]'::jsonb,
    '["Queen", "King", "Extra King"]'::jsonb,
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuCrek7Dy8_zyxu3nxRwJe45p0oG3TFSzpglayS6e-CVhyfTsPjiXR6iX0XdCgEyr1aY1Wrwd3nmcCBylN1fcYhtsUWeQuY7IUNPaeqSoLq1yUHpg7L4JyLsGCT2wqXZP66B9ieH-kOQwSw8OnnDF27OXqGl64LXASLqT--s-aUu3i2uT2R6DaT8hFrlhzFAOOzns3lIQyEl_4Q613Uy4s5YxPdDa7uNpq30EJLOnHEly-62fwYh22va"]'::jsonb,
    '100% Egyptian Cotton',
    'Cuci dengan detergen cair lembut, jangan gunakan pemutih, setrika suhu sedang jika diperlukan.',
    25,
    142
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Signature Linen Sprei Set',
    'Sprei linen premium jacquard dengan motif minimalis modern. Memiliki ketebalan yang pas dan sejuk digunakan sepanjang malam.',
    850000,
    0,
    'sprei',
    '["Pure White", "Sage Green", "Charcoal Grey"]'::jsonb,
    '["Single", "Queen", "King"]'::jsonb,
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuD0lizvIe2RxGvzVSlHZg5GpfdxBcQFfH8P97TUlTZSmKrgOezV5GU13V4y3I7JjMQj5Zu2mAx_SxK3k8m0lIHEGPcSNJnFYMc1B7UXVdgh5paiu93IM1I1Or64iKaMEQYqVxvkw89x-uc7t2BwFkG7j3pi3Z1TfzWKqiUW-xJNYxF5Tw6FJqaXU69xxgBZ7dxbXbRdsLMWrwcKE_gaJU1bMcEeIBpGyegWUwG2S8pVxozsghDIaLlK"]'::jsonb,
    '100% Cotton Jacquard',
    'Cuci terpisah saat pencucian pertama, jemur di tempat teduh terhindar dari matahari langsung.',
    40,
    285
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Serene Flannel Selimut',
    'Selimut bulu flannel super halus yang ringan namun hangat. Cocok untuk menemani tidur Anda di ruangan ber-AC.',
    650000,
    15,
    'selimut',
    '["Taupe", "Sage Green", "Linen Grey"]'::jsonb,
    '["Single", "Double"]'::jsonb,
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDabY6pXY4s7d_2CPda7FFq1wb3IJmApt5hU-7Nr_NMjmLVyHar69sOHR0X0QarjSbQVDSu9m1ANU3DmpYTvRNg1xmjZ-86C-HcWg6IelhV3kU6Xpr6MK8AevcjazjldMFNAnrAdl9rdiRwQRjZrtzSSrBQAsy-2--k58KK7TYfg-4nCFWZftns6w6IS3e5T2WCB9kXGCR8h8j9Qf1k5ACFFPXhs31DAclD42erpJLZWX2M9rMB5td3"]'::jsonb,
    'Microfiber Flannel',
    'Cuci menggunakan mesin cuci mode lembut, jangan disetrika.',
    15,
    88
  )
ON CONFLICT (id) DO NOTHING;
