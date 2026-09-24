const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function generateSql() {
  const db = createClient({ url: 'file:rimbagear.db' });

  let sql = `-- ==============================================================================
-- SUPABASE MIGRATION SCRIPT UNTUK RENTAL OUTDOOR (PREFIX: outdoor_)
-- Jalankan script ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. BUAT STORAGE BUCKET: outdoor (jika belum ada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('outdoor', 'outdoor', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy agar siapapun bisa membaca/melihat gambar (Public Read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Outdoor Bucket'
  ) THEN
    CREATE POLICY "Public Access Outdoor Bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'outdoor');
  END IF;
END $$;

-- Policy agar upload diizinkan ke bucket outdoor
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Uploads Outdoor Bucket'
  ) THEN
    CREATE POLICY "Allow Uploads Outdoor Bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'outdoor');
  END IF;
END $$;

-- Policy agar update diizinkan di bucket outdoor
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Updates Outdoor Bucket'
  ) THEN
    CREATE POLICY "Allow Updates Outdoor Bucket" ON storage.objects
    FOR UPDATE USING (bucket_id = 'outdoor');
  END IF;
END $$;

-- 2. TABEL: outdoor_categories
CREATE TABLE IF NOT EXISTS outdoor_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

-- 3. TABEL: outdoor_products
CREATE TABLE IF NOT EXISTS outdoor_products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES outdoor_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  images TEXT NOT NULL,
  stock INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1
);

-- 4. TABEL: outdoor_pricing_tiers
CREATE TABLE IF NOT EXISTS outdoor_pricing_tiers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES outdoor_products(id) ON DELETE CASCADE,
  days INTEGER NOT NULL,
  price INTEGER NOT NULL
);

-- 5. TABEL: outdoor_orders
CREATE TABLE IF NOT EXISTS outdoor_orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  id_photo_url TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  start_date TEXT,
  end_date TEXT,
  dp_percentage INTEGER DEFAULT 30,
  dp_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL: outdoor_order_items
CREATE TABLE IF NOT EXISTS outdoor_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES outdoor_orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  days INTEGER NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1
);

-- 7. TABEL: outdoor_settings
CREATE TABLE IF NOT EXISTS outdoor_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 8. TABEL: outdoor_admins
CREATE TABLE IF NOT EXISTS outdoor_admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Settings
INSERT INTO outdoor_settings (key, value)
VALUES ('dp_percentage', '30')
ON CONFLICT (key) DO NOTHING;

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_outdoor_products_cat ON outdoor_products(category_id);
CREATE INDEX IF NOT EXISTS idx_outdoor_pricing_prod ON outdoor_pricing_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_outdoor_orders_status ON outdoor_orders(status);
CREATE INDEX IF NOT EXISTS idx_outdoor_order_items_order ON outdoor_order_items(order_id);

-- Enable Row Level Security (RLS) & Berikan Kebijakan Akses
ALTER TABLE outdoor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_admins ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS agar aplikasi bisa membaca katalog secara publik
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_categories' AND policyname = 'Public Read Categories') THEN
    CREATE POLICY "Public Read Categories" ON outdoor_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_products' AND policyname = 'Public Read Products') THEN
    CREATE POLICY "Public Read Products" ON outdoor_products FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_pricing_tiers' AND policyname = 'Public Read Tiers') THEN
    CREATE POLICY "Public Read Tiers" ON outdoor_pricing_tiers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_orders' AND policyname = 'Public Access Orders') THEN
    CREATE POLICY "Public Access Orders" ON outdoor_orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_order_items' AND policyname = 'Public Access Order Items') THEN
    CREATE POLICY "Public Access Order Items" ON outdoor_order_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_settings' AND policyname = 'Public Access Settings') THEN
    CREATE POLICY "Public Access Settings" ON outdoor_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outdoor_admins' AND policyname = 'Public Access Admins') THEN
    CREATE POLICY "Public Access Admins" ON outdoor_admins FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

`;

  // Helper escape
  const esc = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return "'" + String(val).replace(/'/g, "''") + "'";
  };

  // Export categories
  const cats = await db.execute('SELECT * FROM categories');
  if (cats.rows.length > 0) {
    sql += '-- DATA: outdoor_categories\n';
    for (const r of cats.rows) {
      sql += `INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES (${esc(r.id)}, ${esc(r.name)}, ${esc(r.slug)}, ${esc(r.image_url)}, ${r.sort_order || 0}, ${r.is_active ?? 1}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;\n`;
    }
    sql += '\n';
  }

  // Export products
  const prods = await db.execute('SELECT * FROM products');
  if (prods.rows.length > 0) {
    sql += '-- DATA: outdoor_products\n';
    for (const r of prods.rows) {
      sql += `INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES (${esc(r.id)}, ${esc(r.category_id)}, ${esc(r.name)}, ${esc(r.slug)}, ${esc(r.description)}, ${esc(r.images)}, ${r.stock || 5}, ${r.is_active ?? 1}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;\n`;
    }
    sql += '\n';
  }

  // Export pricing tiers
  const tiers = await db.execute('SELECT * FROM pricing_tiers');
  if (tiers.rows.length > 0) {
    sql += '-- DATA: outdoor_pricing_tiers\n';
    for (const r of tiers.rows) {
      sql += `INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES (${esc(r.id)}, ${esc(r.product_id)}, ${r.days}, ${r.price}) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;\n`;
    }
    sql += '\n';
  }

  // Export orders
  const orders = await db.execute('SELECT * FROM orders');
  if (orders.rows.length > 0) {
    sql += '-- DATA: outdoor_orders\n';
    for (const r of orders.rows) {
      sql += `INSERT INTO outdoor_orders (id, customer_name, phone, address, id_photo_url, total_price, start_date, end_date, dp_percentage, dp_amount, status, created_at) VALUES (${esc(r.id)}, ${esc(r.customer_name)}, ${esc(r.phone)}, ${esc(r.address)}, ${esc(r.id_photo_url)}, ${r.total_price}, ${esc(r.start_date)}, ${esc(r.end_date)}, ${r.dp_percentage ?? 30}, ${r.dp_amount ?? 0}, ${esc(r.status)}, ${esc(r.created_at)}) ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';
  }

  // Export order items
  const items = await db.execute('SELECT * FROM order_items');
  if (items.rows.length > 0) {
    sql += '-- DATA: outdoor_order_items\n';
    for (const r of items.rows) {
      sql += `INSERT INTO outdoor_order_items (id, order_id, product_id, product_name, days, price, quantity) VALUES (${esc(r.id)}, ${esc(r.order_id)}, ${esc(r.product_id)}, ${esc(r.product_name)}, ${r.days}, ${r.price}, ${r.quantity || 1}) ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';
  }

  // Export admins
  const admins = await db.execute('SELECT * FROM admins');
  if (admins.rows.length > 0) {
    sql += '-- DATA: outdoor_admins\n';
    for (const r of admins.rows) {
      sql += `INSERT INTO outdoor_admins (id, username, password, name, role, created_at) VALUES (${esc(r.id)}, ${esc(r.username)}, ${esc(r.password)}, ${esc(r.name)}, ${esc(r.role || 'admin')}, ${esc(r.created_at)}) ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';
  }

  fs.writeFileSync(path.join(process.cwd(), 'supabase_migration.sql'), sql, 'utf8');
  console.log('Successfully generated supabase_migration.sql!');
}

generateSql().catch(console.error);
