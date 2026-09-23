import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query = includeInactive
      ? "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
      : "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC";

    const result = await db.execute(query);

    // Also get product counts per category
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

    const categories = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      imageUrl: String(row.image_url),
      sortOrder: Number(row.sort_order),
      isActive: Boolean(row.is_active),
      productCount: countMap[String(row.id)] || 0,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const body = await req.json();
    const { name, imageUrl, sortOrder = 0, isActive = 1 } = body;

    if (!name || !imageUrl) {
      return NextResponse.json({ error: "Name and Image URL are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const id = "cat-" + Date.now();

    await db.execute({
      sql: `INSERT INTO categories (id, name, slug, image_url, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, name, slug, imageUrl, Number(sortOrder), isActive ? 1 : 0],
    });

    return NextResponse.json({ success: true, id, slug });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
