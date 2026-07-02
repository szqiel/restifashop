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
INSERT INTO products (name, description, price, discount_percentage, category, colors, sizes, images, material, care_instructions, stock, sold_count)
VALUES
  (
    'Aurelian Signature Bedcover Set',
    'Set bedcover premium dengan detail rumbai tepi berbahan katun mesir 100%. Sangat lembut, sejuk, dan memberikan kenyamanan tidur kelas hotel bintang lima di kamar Anda.',
    350000,
    15,
    'bedcover',
    '["Champagne Satin", "Soft Cream", "Linen Grey"]'::jsonb,
    '["Queen", "King", "Extra King"]'::jsonb,
    '["https://res.cloudinary.com/demo/image/upload/v1620000000/bedcover_champagne.jpg"]'::jsonb,
    '100% Egyptian Cotton',
    'Cuci dengan detergen cair lembut, jangan gunakan pemutih, setrika suhu sedang jika diperlukan.',
    25,
    142
  ),
  (
    'Luxe Sprei Katun Premium',
    'Sprei katun premium jacquard dengan motif minimalis modern. Memiliki ketebalan yang pas dan sejuk digunakan sepanjang malam.',
    184000,
    10,
    'sprei',
    '["Sage Green", "Dusty Pink", "Chalk White"]'::jsonb,
    '["Single", "Double", "Queen", "King"]'::jsonb,
    '["https://res.cloudinary.com/demo/image/upload/v1620000000/sprei_sage.jpg"]'::jsonb,
    '100% Cotton Jacquard',
    'Cuci terpisah saat pencucian pertama, jemur di tempat teduh terhindar dari matahari langsung.',
    40,
    285
  ),
  (
    'Serene Selimut Bulu Halus',
    'Selimut bulu flannel super halus yang ringan namun hangat. Cocok untuk menemani tidur Anda di ruangan ber-AC.',
    120000,
    5,
    'selimut',
    '["Taupe", "Sage Green", "Linen Grey"]'::jsonb,
    '["Single", "Double"]'::jsonb,
    '["https://res.cloudinary.com/demo/image/upload/v1620000000/selimut_grey.jpg"]'::jsonb,
    'Microfiber Flannel',
    'Cuci menggunakan mesin cuci mode lembut, jangan disetrika.',
    15,
    88
  ),
  (
    'Bantal Microgel Bulu Angsa Sintetis',
    'Bantal tidur dengan isi microgel serat halus pengganti bulu angsa. Sangat empuk, hipoalergenik, dan menopang leher dengan sempurna.',
    85000,
    0,
    'aksesoris',
    '["White Only"]'::jsonb,
    '["Standard Size"]'::jsonb,
    '["https://res.cloudinary.com/demo/image/upload/v1620000000/bantal_white.jpg"]'::jsonb,
    'Microgel & Cotton Cover',
    'Bisa dicuci kering (dry clean) atau tepuk-tepuk secara berkala agar kembali mengembang.',
    50,
    340
  )
ON CONFLICT DO NOTHING;
