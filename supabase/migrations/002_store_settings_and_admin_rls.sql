-- Store settings needed by the homepage, shop promo banner, and dashboard customization panel.
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  home_collections JSONB DEFAULT '[]'::jsonb,
  shop_banner JSONB DEFAULT '{}'::jsonb,
  shipping_info TEXT,
  return_info TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO store_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Helper for Supabase JWT metadata based admin checks.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin';
$$;

-- Rebuild the policies so authenticated does not mean "admin".
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated admins to write products" ON products;
DROP POLICY IF EXISTS "Allow public to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated admins to view/update orders" ON orders;
DROP POLICY IF EXISTS "Allow public to insert order_items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated admins to view/update order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public to subscribe to newsletter" ON emails;
DROP POLICY IF EXISTS "Allow authenticated admins to view/update emails" ON emails;

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to store settings" ON store_settings;
DROP POLICY IF EXISTS "Allow authenticated admins to manage store settings" ON store_settings;

CREATE POLICY "Allow public read access to store settings" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admins to manage store settings" ON store_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated admins to write products" ON products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow public to insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to view/update orders" ON orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow public to insert order_items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to view/update order_items" ON order_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Allow public to subscribe to newsletter" ON emails
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated admins to view/update emails" ON emails
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
