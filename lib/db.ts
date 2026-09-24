import { getSupabaseAdmin } from "./supabase";
import { createClient, Client } from "@libsql/client";

// ==============================================================================
// CONFIGURATION & CLIENT RESOLUTION
// ==============================================================================

export const TABLE_PREFIX = "outdoor_";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

// Fallback SQLite client
let sqliteClient: Client | null = null;
function getSqliteDb(): Client {
  if (!sqliteClient) {
    const url = process.env.TURSO_DATABASE_URL || "file:rimbagear.db";
    const authToken = process.env.TURSO_AUTH_TOKEN;
    sqliteClient = createClient({ url, authToken });
  }
  return sqliteClient;
}

// Legacy getDb for backwards compatibility
export function getDb(): Client {
  return getSqliteDb();
}

export async function initDb(): Promise<void> {
  // If Supabase is configured, tables are managed via supabase_migration.sql
  if (isSupabaseConfigured()) {
    return;
  }
  // If SQLite is used, ensure tables exist
  const db = getSqliteDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      images TEXT NOT NULL,
      stock INTEGER DEFAULT 5,
      is_active INTEGER DEFAULT 1
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pricing_tiers (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      days INTEGER NOT NULL,
      price INTEGER NOT NULL
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
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
      created_at TEXT NOT NULL
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      days INTEGER NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
  `);
}

// ==============================================================================
// 1. CATEGORIES REPOSITORY
// ==============================================================================

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export async function getCategories(options: { includeInactive?: boolean } = {}): Promise<CategoryItem[]> {
  const { includeInactive = false } = options;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from(`${TABLE_PREFIX}categories`)
      .select(`*, ${TABLE_PREFIX}products(id, is_active)`)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => {
      const prods = row[`${TABLE_PREFIX}products`] || [];
      const activeProds = prods.filter((p: any) => p.is_active === 1);
      return {
        id: String(row.id),
        name: String(row.name),
        slug: String(row.slug),
        imageUrl: String(row.image_url),
        sortOrder: Number(row.sort_order || 0),
        isActive: Boolean(row.is_active),
        productCount: activeProds.length,
      };
    });
  }

  // Fallback SQLite
  const db = getSqliteDb();
  const query = includeInactive
    ? "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
    : "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC";

  const result = await db.execute(query);
  const countResult = await db.execute(`
    SELECT category_id, COUNT(*) as product_count 
    FROM products 
    WHERE is_active = 1 
    GROUP BY category_id
  `);

  const countMap: Record<string, number> = {};
  for (const row of countResult.rows) {
    countMap[String(row.category_id)] = Number(row.product_count);
  }

  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    imageUrl: String(row.image_url),
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
    productCount: countMap[String(row.id)] || 0,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(`${TABLE_PREFIX}categories`)
      .select("*")
      .eq("slug", slug)
      .eq("is_active", 1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      id: String(data.id),
      name: String(data.name),
      slug: String(data.slug),
      imageUrl: String(data.image_url),
      sortOrder: Number(data.sort_order || 0),
      isActive: Boolean(data.is_active),
    };
  }

  const db = getSqliteDb();
  const res = await db.execute({
    sql: "SELECT * FROM categories WHERE slug = ? AND is_active = 1 LIMIT 1",
    args: [slug],
  });
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    imageUrl: String(row.image_url),
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
  };
}

export async function createCategory(data: {
  name: string;
  imageUrl: string;
  sortOrder?: number;
  isActive?: boolean | number;
}): Promise<{ id: string; slug: string }> {
  const slug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const id = "cat-" + Date.now();
  const sortOrder = Number(data.sortOrder || 0);
  const isActive = data.isActive ? 1 : 0;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(`${TABLE_PREFIX}categories`).insert({
      id,
      name: data.name,
      slug,
      image_url: data.imageUrl,
      sort_order: sortOrder,
      is_active: isActive,
    });
    if (error) throw new Error(error.message);
    return { id, slug };
  }

  const db = getSqliteDb();
  await db.execute({
    sql: `INSERT INTO categories (id, name, slug, image_url, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, data.name, slug, data.imageUrl, sortOrder, isActive],
  });
  return { id, slug };
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean | number;
  }
): Promise<void> {
  const slug = data.name
    ? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    : undefined;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const updatePayload: Record<string, any> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (slug !== undefined) updatePayload.slug = slug;
    if (data.imageUrl !== undefined) updatePayload.image_url = data.imageUrl;
    if (data.sortOrder !== undefined) updatePayload.sort_order = Number(data.sortOrder);
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive ? 1 : 0;

    const { error } = await supabase
      .from(`${TABLE_PREFIX}categories`)
      .update(updatePayload)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = getSqliteDb();
  await db.execute({
    sql: `UPDATE categories 
          SET name = COALESCE(?, name),
              slug = COALESCE(?, slug),
              image_url = COALESCE(?, image_url),
              sort_order = COALESCE(?, sort_order),
              is_active = COALESCE(?, is_active)
          WHERE id = ?`,
    args: [
      data.name ?? null,
      slug ?? null,
      data.imageUrl ?? null,
      data.sortOrder !== undefined ? Number(data.sortOrder) : null,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
      id,
    ],
  });
}

export async function deleteCategory(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(`${TABLE_PREFIX}categories`)
      .update({ is_active: 0 })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = getSqliteDb();
  await db.execute({
    sql: "UPDATE categories SET is_active = 0 WHERE id = ?",
    args: [id],
  });
}

// ==============================================================================
// 2. PRODUCTS REPOSITORY
// ==============================================================================

export interface PricingTierItem {
  id?: string;
  days: number;
  price: number;
}

export interface ProductItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  stock: number;
  isActive: boolean;
  minPrice: number;
  pricingTiers: PricingTierItem[];
}

export async function getProducts(options: {
  categorySlug?: string | null;
  categoryId?: string | null;
  search?: string | null;
  includeInactive?: boolean;
  limit?: number;
} = {}): Promise<ProductItem[]> {
  const { categorySlug, categoryId, search, includeInactive = false, limit } = options;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from(`${TABLE_PREFIX}products`)
      .select(`
        *,
        category:${TABLE_PREFIX}categories!inner(id, name, slug, is_active),
        tiers:${TABLE_PREFIX}pricing_tiers(id, days, price)
      `)
      .order("name", { ascending: true });

    if (!includeInactive) {
      query = query.eq("is_active", 1).eq("category.is_active", 1);
    }
    if (categorySlug) {
      query = query.eq("category.slug", categorySlug);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => {
      let images: string[] = [];
      try {
        images = JSON.parse(String(row.images));
      } catch {
        images = [String(row.images)];
      }

      const tiers: PricingTierItem[] = (row.tiers || []).map((t: any) => ({
        id: String(t.id),
        days: Number(t.days),
        price: Number(t.price),
      }));
      tiers.sort((a, b) => a.days - b.days);

      const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : 0;

      return {
        id: String(row.id),
        categoryId: String(row.category_id),
        categoryName: String(row.category?.name || ""),
        categorySlug: String(row.category?.slug || ""),
        name: String(row.name),
        slug: String(row.slug),
        description: String(row.description),
        images,
        stock: Number(row.stock ?? 5),
        isActive: Boolean(row.is_active),
        minPrice,
        pricingTiers: tiers,
      };
    });
  }

  // Fallback SQLite
  const db = getSqliteDb();
  let sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const args: any[] = [];

  if (!includeInactive) {
    sql += " AND p.is_active = 1 AND c.is_active = 1";
  }
  if (categorySlug) {
    sql += " AND c.slug = ?";
    args.push(categorySlug);
  }
  if (categoryId) {
    sql += " AND p.category_id = ?";
    args.push(categoryId);
  }
  if (search) {
    sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
    args.push(`%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY p.name ASC";
  if (limit) {
    sql += ` LIMIT ${limit}`;
  }

  const productResult = await db.execute({ sql, args });
  const tiersResult = await db.execute("SELECT * FROM pricing_tiers ORDER BY days ASC");

  const tiersByProductId: Record<string, PricingTierItem[]> = {};
  for (const row of tiersResult.rows) {
    const pId = String(row.product_id);
    if (!tiersByProductId[pId]) tiersByProductId[pId] = [];
    tiersByProductId[pId].push({
      id: String(row.id),
      days: Number(row.days),
      price: Number(row.price),
    });
  }

  return productResult.rows.map((row) => {
    let images: string[] = [];
    try {
      images = JSON.parse(String(row.images));
    } catch {
      images = [String(row.images)];
    }
    const productId = String(row.id);
    const tiers = tiersByProductId[productId] || [];
    const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : 0;

    return {
      id: productId,
      categoryId: String(row.category_id),
      categoryName: String(row.category_name),
      categorySlug: String(row.category_slug),
      name: String(row.name),
      slug: String(row.slug),
      description: String(row.description),
      images,
      stock: Number(row.stock ?? 5),
      isActive: Boolean(row.is_active),
      minPrice,
      pricingTiers: tiers,
    };
  });
}

export async function getProductBySlugOrId(idOrSlug: string): Promise<ProductItem | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(`${TABLE_PREFIX}products`)
      .select(`
        *,
        category:${TABLE_PREFIX}categories(id, name, slug),
        tiers:${TABLE_PREFIX}pricing_tiers(id, days, price)
      `)
      .or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`)
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    let images: string[] = [];
    try {
      images = JSON.parse(String(data.images));
    } catch {
      images = [String(data.images)];
    }

    const tiers: PricingTierItem[] = (data.tiers || []).map((t: any) => ({
      id: String(t.id),
      days: Number(t.days),
      price: Number(t.price),
    }));
    tiers.sort((a, b) => a.days - b.days);
    const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : 0;

    return {
      id: String(data.id),
      categoryId: String(data.category_id),
      categoryName: String(data.category?.name || ""),
      categorySlug: String(data.category?.slug || ""),
      name: String(data.name),
      slug: String(data.slug),
      description: String(data.description),
      images,
      stock: Number(data.stock ?? 5),
      isActive: Boolean(data.is_active),
      minPrice,
      pricingTiers: tiers,
    };
  }

  const db = getSqliteDb();
  const productResult = await db.execute({
    sql: `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? OR p.slug = ?
      LIMIT 1
    `,
    args: [idOrSlug, idOrSlug],
  });
  if (productResult.rows.length === 0) return null;

  const row = productResult.rows[0];
  const productId = String(row.id);

  let images: string[] = [];
  try {
    images = JSON.parse(String(row.images));
  } catch {
    images = [String(row.images)];
  }

  const tiersResult = await db.execute({
    sql: "SELECT * FROM pricing_tiers WHERE product_id = ? ORDER BY days ASC",
    args: [productId],
  });

  const tiers = tiersResult.rows.map((t) => ({
    id: String(t.id),
    days: Number(t.days),
    price: Number(t.price),
  }));
  const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : 0;

  return {
    id: productId,
    categoryId: String(row.category_id),
    categoryName: String(row.category_name),
    categorySlug: String(row.category_slug),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    images,
    stock: Number(row.stock ?? 5),
    isActive: Boolean(row.is_active),
    minPrice,
    pricingTiers: tiers,
  };
}

export async function createProduct(data: {
  name: string;
  categoryId: string;
  description: string;
  images: string[];
  stock?: number;
  pricingTiers?: { days: number; price: number }[];
  isActive?: boolean | number;
}): Promise<{ id: string; slug: string }> {
  const id = "prod-" + Date.now();
  const slug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const stock = Number(data.stock ?? 5);
  const isActive = data.isActive !== false ? 1 : 0;
  const imagesJson = JSON.stringify(data.images);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error: prodError } = await supabase.from(`${TABLE_PREFIX}products`).insert({
      id,
      category_id: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      images: imagesJson,
      stock,
      is_active: isActive,
    });
    if (prodError) throw new Error(prodError.message);

    if (data.pricingTiers && data.pricingTiers.length > 0) {
      const tierRows = data.pricingTiers.map((t, idx) => ({
        id: `tier-${id}-${t.days}-${idx}`,
        product_id: id,
        days: Number(t.days),
        price: Number(t.price),
      }));
      const { error: tierError } = await supabase
        .from(`${TABLE_PREFIX}pricing_tiers`)
        .insert(tierRows);
      if (tierError) throw new Error(tierError.message);
    }
    return { id, slug };
  }

  const db = getSqliteDb();
  await db.execute({
    sql: `INSERT INTO products (id, category_id, name, slug, description, images, stock, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.categoryId, data.name, slug, data.description, imagesJson, stock, isActive],
  });

  if (data.pricingTiers && data.pricingTiers.length > 0) {
    for (const tier of data.pricingTiers) {
      const tierId = `tier-${id}-${tier.days}-${Date.now()}`;
      await db.execute({
        sql: "INSERT INTO pricing_tiers (id, product_id, days, price) VALUES (?, ?, ?, ?)",
        args: [tierId, id, Number(tier.days), Number(tier.price)],
      });
    }
  }
  return { id, slug };
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    categoryId?: string;
    description?: string;
    images?: string[];
    stock?: number;
    pricingTiers?: { days: number; price: number }[];
    isActive?: boolean | number;
  }
): Promise<void> {
  const slug = data.name
    ? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    : undefined;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const updatePayload: Record<string, any> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (slug !== undefined) updatePayload.slug = slug;
    if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.images !== undefined) updatePayload.images = JSON.stringify(data.images);
    if (data.stock !== undefined) updatePayload.stock = Number(data.stock);
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive ? 1 : 0;

    const { error: prodError } = await supabase
      .from(`${TABLE_PREFIX}products`)
      .update(updatePayload)
      .eq("id", id);
    if (prodError) throw new Error(prodError.message);

    if (data.pricingTiers && Array.isArray(data.pricingTiers)) {
      await supabase.from(`${TABLE_PREFIX}pricing_tiers`).delete().eq("product_id", id);
      const tierRows = data.pricingTiers.map((t, idx) => ({
        id: `tier-${id}-${t.days}-${Date.now()}-${idx}`,
        product_id: id,
        days: Number(t.days),
        price: Number(t.price),
      }));
      if (tierRows.length > 0) {
        const { error: tierError } = await supabase
          .from(`${TABLE_PREFIX}pricing_tiers`)
          .insert(tierRows);
        if (tierError) throw new Error(tierError.message);
      }
    }
    return;
  }

  const db = getSqliteDb();
  await db.execute({
    sql: `UPDATE products
          SET name = COALESCE(?, name),
              slug = COALESCE(?, slug),
              category_id = COALESCE(?, category_id),
              description = COALESCE(?, description),
              images = COALESCE(?, images),
              stock = COALESCE(?, stock),
              is_active = COALESCE(?, is_active)
          WHERE id = ?`,
    args: [
      data.name ?? null,
      slug ?? null,
      data.categoryId ?? null,
      data.description ?? null,
      data.images ? JSON.stringify(data.images) : null,
      data.stock !== undefined ? Number(data.stock) : null,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
      id,
    ],
  });

  if (data.pricingTiers && Array.isArray(data.pricingTiers)) {
    await db.execute({ sql: "DELETE FROM pricing_tiers WHERE product_id = ?", args: [id] });
    for (const tier of data.pricingTiers) {
      const tierId = `tier-${id}-${tier.days}-${Date.now()}`;
      await db.execute({
        sql: "INSERT INTO pricing_tiers (id, product_id, days, price) VALUES (?, ?, ?, ?)",
        args: [tierId, id, Number(tier.days), Number(tier.price)],
      });
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(`${TABLE_PREFIX}products`)
      .update({ is_active: 0 })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const db = getSqliteDb();
  await db.execute({ sql: "UPDATE products SET is_active = 0 WHERE id = ?", args: [id] });
}

// ==============================================================================
// 3. PRODUCT AVAILABILITY REPOSITORY
// ==============================================================================

export async function checkProductAvailability(
  productId: string,
  startDate?: string | null,
  endDate?: string | null
) {
  const prod = await getProductBySlugOrId(productId);
  if (!prod) return null;
  const totalStock = prod.stock ?? 5;

  if (!startDate || !endDate) {
    return {
      productId,
      totalStock,
      availableStock: totalStock,
      maxBooked: 0,
      startDate: null,
      endDate: null,
    };
  }

  let bookedRanges: { startDate: string; endDate: string; quantity: number }[] = [];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from(`${TABLE_PREFIX}orders`)
      .select(`
        id, start_date, end_date, status,
        items:${TABLE_PREFIX}order_items!inner(product_id, quantity)
      `)
      .in("status", ["dikonfirmasi", "bayar_dp", "ambil_barang"])
      .not("start_date", "is", null)
      .not("end_date", "is", null)
      .lte("start_date", endDate)
      .gte("end_date", startDate)
      .eq(`items.product_id`, productId);

    bookedRanges = (data || []).map((row: any) => {
      const item = (row.items || []).find((it: any) => it.product_id === productId);
      return {
        startDate: String(row.start_date),
        endDate: String(row.end_date),
        quantity: Number(item?.quantity || 1),
      };
    });
  } else {
    const db = getSqliteDb();
    const ordersRes = await db.execute({
      sql: `
        SELECT o.id, o.start_date, o.end_date, oi.quantity
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.product_id = ?
          AND o.status IN ('dikonfirmasi', 'bayar_dp', 'ambil_barang')
          AND o.start_date IS NOT NULL
          AND o.end_date IS NOT NULL
          AND o.start_date <= ?
          AND o.end_date >= ?
      `,
      args: [productId, endDate, startDate],
    });

    bookedRanges = ordersRes.rows.map((r) => ({
      startDate: String(r.start_date),
      endDate: String(r.end_date),
      quantity: Number(r.quantity || 1),
    }));
  }

  // Calculate day-by-day max booked units
  const days: string[] = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  let it = 0;
  while (curr <= end && it < 365) {
    days.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
    it++;
  }

  let maxBooked = 0;
  for (const day of days) {
    let dayCount = 0;
    for (const b of bookedRanges) {
      if (day >= b.startDate && day <= b.endDate) {
        dayCount += b.quantity;
      }
    }
    if (dayCount > maxBooked) maxBooked = dayCount;
  }

  const availableStock = Math.max(0, totalStock - maxBooked);
  return {
    productId,
    totalStock,
    maxBooked,
    availableStock,
    startDate,
    endDate,
  };
}

// ==============================================================================
// 4. ORDERS REPOSITORY
// ==============================================================================

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  days: number;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  phone: string;
  address: string | null;
  idPhotoUrl: string;
  totalPrice: number;
  startDate: string | null;
  endDate: string | null;
  dpPercentage: number;
  dpAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export async function getOrders(options: { status?: string | null } = {}): Promise<OrderRecord[]> {
  const { status } = options;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from(`${TABLE_PREFIX}orders`)
      .select(`
        *,
        items:${TABLE_PREFIX}order_items(*)
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "semua") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: String(row.id),
      customerName: String(row.customer_name),
      phone: String(row.phone),
      address: row.address ? String(row.address) : null,
      idPhotoUrl: String(row.id_photo_url),
      totalPrice: Number(row.total_price),
      startDate: row.start_date ? String(row.start_date) : null,
      endDate: row.end_date ? String(row.end_date) : null,
      dpPercentage: Number(row.dp_percentage ?? 30),
      dpAmount: Number(row.dp_amount ?? 0),
      status: String(row.status === "baru" ? "pending" : row.status),
      createdAt: String(row.created_at),
      items: (row.items || []).map((it: any) => ({
        id: String(it.id),
        orderId: String(it.order_id),
        productId: String(it.product_id),
        productName: String(it.product_name),
        days: Number(it.days),
        price: Number(it.price),
        quantity: Number(it.quantity || 1),
      })),
    }));
  }

  // Fallback SQLite
  const db = getSqliteDb();
  let sql = "SELECT * FROM orders";
  const args: any[] = [];
  if (status && status !== "semua") {
    sql += " WHERE status = ?";
    args.push(status);
  }
  sql += " ORDER BY created_at DESC";

  const ordersResult = await db.execute({ sql, args });
  const itemsResult = await db.execute("SELECT * FROM order_items");

  const itemsByOrderId: Record<string, OrderItem[]> = {};
  for (const item of itemsResult.rows) {
    const oId = String(item.order_id);
    if (!itemsByOrderId[oId]) itemsByOrderId[oId] = [];
    itemsByOrderId[oId].push({
      id: String(item.id),
      orderId: oId,
      productId: String(item.product_id),
      productName: String(item.product_name),
      days: Number(item.days),
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
    });
  }

  return ordersResult.rows.map((row) => ({
    id: String(row.id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    address: row.address ? String(row.address) : null,
    idPhotoUrl: String(row.id_photo_url),
    totalPrice: Number(row.total_price),
    startDate: row.start_date ? String(row.start_date) : null,
    endDate: row.end_date ? String(row.end_date) : null,
    dpPercentage: Number(row.dp_percentage ?? 30),
    dpAmount: Number(row.dp_amount ?? 0),
    status: String(row.status === "baru" ? "pending" : row.status),
    createdAt: String(row.created_at),
    items: itemsByOrderId[String(row.id)] || [],
  }));
}

export async function createOrder(
  order: {
    customerName: string;
    phone: string;
    address?: string | null;
    idPhotoUrl: string;
    totalPrice: number;
    startDate?: string | null;
    endDate?: string | null;
    dpPercentage?: number;
    dpAmount?: number;
  },
  items: {
    productId?: string;
    productName: string;
    days: number;
    price: number;
    quantity?: number;
  }[]
): Promise<{ orderId: string }> {
  const orderId = "ord-" + Date.now();
  const createdAt = new Date().toISOString();
  const dpPercentage = order.dpPercentage ?? 30;
  const dpAmount = order.dpAmount ?? Math.round((order.totalPrice * dpPercentage) / 100);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error: orderError } = await supabase.from(`${TABLE_PREFIX}orders`).insert({
      id: orderId,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address || null,
      id_photo_url: order.idPhotoUrl,
      total_price: order.totalPrice,
      start_date: order.startDate || null,
      end_date: order.endDate || null,
      dp_percentage: dpPercentage,
      dp_amount: dpAmount,
      status: "pending",
      created_at: createdAt,
    });
    if (orderError) throw new Error(orderError.message);

    if (items && items.length > 0) {
      const itemRows = items.map((it, idx) => ({
        id: `item-${orderId}-${idx}`,
        order_id: orderId,
        product_id: it.productId || null,
        product_name: it.productName,
        days: Number(it.days),
        price: Number(it.price),
        quantity: Number(it.quantity || 1),
      }));
      const { error: itemError } = await supabase
        .from(`${TABLE_PREFIX}order_items`)
        .insert(itemRows);
      if (itemError) throw new Error(itemError.message);
    }
    return { orderId };
  }

  const db = getSqliteDb();
  await db.execute({
    sql: `INSERT INTO orders (id, customer_name, phone, address, id_photo_url, total_price, start_date, end_date, dp_percentage, dp_amount, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    args: [
      orderId,
      order.customerName,
      order.phone,
      order.address || null,
      order.idPhotoUrl,
      order.totalPrice,
      order.startDate || null,
      order.endDate || null,
      dpPercentage,
      dpAmount,
      createdAt,
    ],
  });

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const itemId = `item-${orderId}-${i}`;
    await db.execute({
      sql: `INSERT INTO order_items (id, order_id, product_id, product_name, days, price, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [itemId, orderId, it.productId || null, it.productName, it.days, it.price, it.quantity || 1],
    });
  }
  return { orderId };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const finalStatus = status === "baru" ? "pending" : status;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(`${TABLE_PREFIX}orders`)
      .update({ status: finalStatus })
      .eq("id", orderId);
    if (error) throw new Error(error.message);
    return;
  }

  const db = getSqliteDb();
  await db.execute({
    sql: "UPDATE orders SET status = ? WHERE id = ?",
    args: [finalStatus, orderId],
  });
}

export async function deleteOrder(orderId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    await supabase.from(`${TABLE_PREFIX}order_items`).delete().eq("order_id", orderId);
    const { error } = await supabase.from(`${TABLE_PREFIX}orders`).delete().eq("id", orderId);
    if (error) throw new Error(error.message);
    return;
  }

  const db = getSqliteDb();
  await db.execute({ sql: "DELETE FROM order_items WHERE order_id = ?", args: [orderId] });
  await db.execute({ sql: "DELETE FROM orders WHERE id = ?", args: [orderId] });
}

// ==============================================================================
// 5. SETTINGS REPOSITORY
// ==============================================================================

export async function getSettings(): Promise<Record<string, string>> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from(`${TABLE_PREFIX}settings`).select("*");
    const map: Record<string, string> = {};
    for (const r of data || []) {
      map[String(r.key)] = String(r.value);
    }
    return map;
  }

  const db = getSqliteDb();
  const res = await db.execute("SELECT * FROM settings");
  const map: Record<string, string> = {};
  for (const r of res.rows) {
    map[String(r.key)] = String(r.value);
  }
  return map;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(`${TABLE_PREFIX}settings`)
      .upsert({ key, value });
    if (error) throw new Error(error.message);
    return;
  }

  const db = getSqliteDb();
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [key, value],
  });
}

// ==============================================================================
// 6. ADMIN AUTH REPOSITORY
// ==============================================================================

export async function verifyAdminCredentials(username: string, password: string): Promise<any | null> {
  const DEFAULT_USER = process.env.ADMIN_USERNAME || "admin";
  const DEFAULT_PASS = process.env.ADMIN_PASSWORD || "rimbagear2026";

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from(`${TABLE_PREFIX}admins`)
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .limit(1)
      .maybeSingle();

    if (data) return data;
  } else {
    const db = getSqliteDb();
    const adminRes = await db.execute({
      sql: "SELECT * FROM admins WHERE username = ? AND password = ? LIMIT 1",
      args: [username, password],
    });
    if (adminRes.rows.length > 0) return adminRes.rows[0];
  }

  if (username === DEFAULT_USER && password === DEFAULT_PASS) {
    return {
      id: "admin-default",
      username,
      name: "Administrator Outdoor",
      role: "admin",
    };
  }

  return null;
}

// ==============================================================================
// 7. ADMIN DASHBOARD STATS REPOSITORY
// ==============================================================================

export async function getAdminDashboardStats() {
  const orders = await getOrders();
  const products = await getProducts({ includeInactive: false });
  const categories = await getCategories({ includeInactive: false });
  const settings = await getSettings();

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "pending" || o.status === "baru").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "dibatalkan")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const dpPercentage = parseInt(settings["dp_percentage"] || "30", 10) || 30;

  // Calendar orders
  const calendarOrdersMap: Record<string, any> = {};
  for (const o of orders) {
    if (o.status === "dibatalkan") continue;
    const itemsList = o.items.map((it) => `${it.productName} (x${it.quantity})`).join(", ");
    calendarOrdersMap[o.id] = {
      id: o.id,
      customerName: o.customerName,
      phone: o.phone,
      startDate: o.startDate || "",
      endDate: o.endDate || "",
      totalPrice: o.totalPrice,
      dpAmount: o.dpAmount,
      status: o.status,
      items: o.items.map((it) => ({ productName: it.productName, quantity: it.quantity })),
    };
  }

  return {
    totalOrders,
    newOrders,
    totalRevenue,
    totalProducts: products.length,
    totalCategories: categories.length,
    dpPercentage,
    calendarOrders: Object.values(calendarOrdersMap),
    recentOrders: orders.slice(0, 5),
  };
}
