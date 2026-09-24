-- ==============================================================================
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

-- DATA: outdoor_categories
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-1', 'Tenda', 'tenda', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80', 1, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-2', 'Carrier', 'carrier', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 2, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-3', 'Alat Masak', 'alat-masak', 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80', 3, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-4', 'Elektronik', 'elektronik', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', 4, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-5', 'Penerangan', 'penerangan', 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-6', 'Survival', 'survival', 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80', 6, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-7', 'Perlengkapan Pribadi', 'perlengkapan-pribadi', 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80', 7, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_categories (id, name, slug, image_url, sort_order, is_active) VALUES ('cat-8', 'Perlengkapan Tambahan', 'perlengkapan-tambahan', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80', 8, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active;

-- DATA: outdoor_products
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-1', 'cat-1', 'Bivak Set', 'bivak-set', 'Ukuran 3 x 4 meter. Paket lengkap: flysheet waterproof ripstop premium warna merah rimba, 2 set tiang duralumin teleskopik kokoh, 8 pasak pasak baja galvanis, dan 6 tali prusik reflektif + stopper aluminium. Sangat cocok untuk shelter darurat, bushcraft, dan camping praktis.', '["https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-2', 'cat-1', 'Tenda Dome 4 Orang', 'tenda-dome-4-orang', 'Tenda dome double layer kapasitas 4 orang dengan vestibule teras depan lapang untuk tempat memasak dan menyimpan sepatu/carrier. Material outer 210T Polyester PU 3000mm tahan hujan deras badai gunung. Lengkap dengan footprint dan tas jinjing.', '["https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-3', 'cat-1', 'Flysheet 4x6 Meter', 'flysheet-4x6-meter', 'Flysheet ukuran besar 4 x 6 meter bahan Taslan Milky waterproof coating. Dilengkapi dengan 19 titik loop webbing bertulang di setiap sisi dan sudut, sangat kokoh menahan terpaan angin dan hujan deras.', '["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-4', 'cat-7', 'Matras Camping Thermal', 'matras-camping-thermal', 'Matras isolasi thermal bahan aluminium foil bolak-balik busa IXPE tebal 4mm. Efektif memantulkan panas tubuh dan memblokir dinginnya hawa tanah pegunungan. Dimensi 200 x 100 cm.', '["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-5', 'cat-2', 'Carrier 60L Pro Series', 'carrier-60l-pro', 'Tas gunung ekspedisi 60 liter dengan frame aluminium ganda dan backsystem adjustable torso bersirkulasi udara dingin. Dilengkapi kompartemen bawah terpisah untuk sleeping bag dan gratis raincover waterproof.', '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-6', 'cat-3', 'Cooking Set Nesting DS-308', 'cooking-set-nesting-ds308', 'Paket alat masak outdoor lengkap berbahan hard anodized aluminium tebal dan food grade. Berisi: panci besar, panci sedang, wajan penggorengan, 3 mangkok kuah, centong sup, sendok kayu, dan busa cuci dalam tas jaring.', '["https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-7', 'cat-3', 'Kompor Windproof Ultralight', 'kompor-windproof-ultralight', 'Kompor gas portable model kelopak mawar anti-angin dengan leher selang fleksibel dan pemantik elektrik terintegrasi. Pembakaran merata dan hemat gas bahkan pada angin kencang.', '["https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-8', 'cat-5', 'Headlamp 300 Lumens Waterproof', 'headlamp-300-lumens', 'Senter kepala pendakian terang 300 lumens dengan sensor infrared lambaian tangan untuk menyalakan/mematikan tanpa sentuh. Rechargeable baterai Type-C tahan hingga 10 jam pemakaian.', '["https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-9', 'cat-7', 'Sleeping Bag Polar Dacron', 'sleeping-bag-polar-dacron', 'Kantong tidur model selimut dengan isian dacron 6oz empuk dan lapisan dalam polar fleece lembut menyerap kehangatan. Batas kenyamanan suhu 8°C hingga 12°C.', '["https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;
INSERT INTO outdoor_products (id, category_id, name, slug, description, images, stock, is_active) VALUES ('prod-10', 'cat-8', 'Trekking Pole Duralumin (Sepasang)', 'trekking-pole-duralumin', 'Sepasang tongkat pendakian duralumin alloy 7075 yang ringan namun kuat. Dilengkapi teknologi anti-shock peredam benturan dan handle busa EVA ergonomis.', '["https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"]', 5, 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, images = EXCLUDED.images, stock = EXCLUDED.stock, is_active = EXCLUDED.is_active;

-- DATA: outdoor_pricing_tiers
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-1-2', 'prod-1', 2, 38000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-1-3', 'prod-1', 3, 52000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-1-4', 'prod-1', 4, 62000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-1-5', 'prod-1', 5, 72000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-2-2', 'prod-2', 2, 55000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-2-3', 'prod-2', 3, 75000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-2-4', 'prod-2', 4, 90000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-2-5', 'prod-2', 5, 105000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-3-2', 'prod-3', 2, 45000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-3-3', 'prod-3', 3, 60000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-3-4', 'prod-3', 4, 75000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-4-2', 'prod-4', 2, 15000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-4-3', 'prod-4', 3, 20000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-4-4', 'prod-4', 4, 25000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-5-2', 'prod-5', 2, 65000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-5-3', 'prod-5', 3, 90000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-5-4', 'prod-5', 4, 110000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-5-5', 'prod-5', 5, 130000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-6-2', 'prod-6', 2, 25000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-6-3', 'prod-6', 3, 35000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-6-4', 'prod-6', 4, 45000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-7-2', 'prod-7', 2, 20000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-7-3', 'prod-7', 3, 28000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-7-4', 'prod-7', 4, 35000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-8-2', 'prod-8', 2, 18000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-8-3', 'prod-8', 3, 25000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-8-4', 'prod-8', 4, 30000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-9-2', 'prod-9', 2, 25000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-9-3', 'prod-9', 3, 35000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-9-4', 'prod-9', 4, 45000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-10-2', 'prod-10', 2, 20000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-10-3', 'prod-10', 3, 28000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;
INSERT INTO outdoor_pricing_tiers (id, product_id, days, price) VALUES ('tier-prod-10-4', 'prod-10', 4, 35000) ON CONFLICT (id) DO UPDATE SET days = EXCLUDED.days, price = EXCLUDED.price;

-- DATA: outdoor_orders
INSERT INTO outdoor_orders (id, customer_name, phone, address, id_photo_url, total_price, start_date, end_date, dp_percentage, dp_amount, status, created_at) VALUES ('ORD-2026-001', 'Dimas Prasetyo', '081298765432', 'Jl. Rinjani No. 14, Jakarta Selatan', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', 92000, NULL, NULL, 30, 0, 'baru', '2026-09-23T14:39:39.969Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO outdoor_orders (id, customer_name, phone, address, id_photo_url, total_price, start_date, end_date, dp_percentage, dp_amount, status, created_at) VALUES ('RMB-20260923-2977', 'Rizky Ramadhan', '081234567899', 'Jl. Merbabu No. 10', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', 114000, NULL, NULL, 30, 0, 'dikonfirmasi', '2026-09-23T14:44:46.988Z') ON CONFLICT (id) DO NOTHING;

-- DATA: outdoor_order_items
INSERT INTO outdoor_order_items (id, order_id, product_id, product_name, days, price, quantity) VALUES ('item-1', 'ORD-2026-001', 'prod-1', 'Bivak Set', 3, 52000, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO outdoor_order_items (id, order_id, product_id, product_name, days, price, quantity) VALUES ('item-2', 'ORD-2026-001', 'prod-2', 'Tenda Dome 4 Orang', 2, 40000, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO outdoor_order_items (id, order_id, product_id, product_name, days, price, quantity) VALUES ('item-RMB-20260923-2977-1', 'RMB-20260923-2977', 'prod-1', 'Bivak Set', 3, 52000, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO outdoor_order_items (id, order_id, product_id, product_name, days, price, quantity) VALUES ('item-RMB-20260923-2977-2', 'RMB-20260923-2977', 'prod-3', 'Flysheet 4x6 Meter', 3, 62000, 1) ON CONFLICT (id) DO NOTHING;

-- DATA: outdoor_admins
INSERT INTO outdoor_admins (id, username, password, name, role, created_at) VALUES ('admin-1', 'admin', 'rimbagear2026', 'Administrator Your Brand', 'admin', '2026-09-23T14:47:55.814Z') ON CONFLICT (id) DO NOTHING;

