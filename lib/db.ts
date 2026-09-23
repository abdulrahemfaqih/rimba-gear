import { createClient, Client } from "@libsql/client";
import { seedData, seedAdmin } from "@/lib/seed";

let client: Client | null = null;
let currentUrl: string | undefined = undefined;
let currentToken: string | undefined = undefined;

export function getDb(): Client {
  const url = process.env.TURSO_DATABASE_URL || "file:rimbagear.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!client || currentUrl !== url || currentToken !== authToken) {
    currentUrl = url;
    currentToken = authToken;
    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

let isInitialized = false;

export async function initDb(): Promise<void> {
  const db = getDb();

  // Create tables if not exist
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
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pricing_tiers (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      days INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
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
      status TEXT DEFAULT 'baru',
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
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
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

  // Check if categories need seeding in this database
  const checkCat = await db.execute("SELECT COUNT(*) as count FROM categories");
  const count = Number(checkCat.rows[0]?.count ?? 0);

  if (count === 0) {
    await seedData(db);
  } else {
    // Ensure admin user is seeded even if categories already exist
    await seedAdmin(db);
  }

  isInitialized = true;
}
