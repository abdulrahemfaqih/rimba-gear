import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const includeInactive = searchParams.get("includeInactive") === "true";

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (!includeInactive) {
      sql += ` AND p.is_active = 1 AND c.is_active = 1`;
    }

    if (categorySlug) {
      sql += ` AND c.slug = ?`;
      args.push(categorySlug);
    }

    if (categoryId) {
      sql += ` AND p.category_id = ?`;
      args.push(categoryId);
    }

    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      args.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.name ASC`;

    const productResult = await db.execute({ sql, args });

    // Fetch all pricing tiers
    const tiersResult = await db.execute(`
      SELECT * FROM pricing_tiers ORDER BY days ASC
    `);

    const tiersByProductId: Record<string, { days: number; price: number }[]> = {};
    for (const row of tiersResult.rows) {
      const pId = String(row.product_id);
      if (!tiersByProductId[pId]) {
        tiersByProductId[pId] = [];
      }
      tiersByProductId[pId].push({
        days: Number(row.days),
        price: Number(row.price),
      });
    }

    const products = productResult.rows.map((row) => {
      const pId = String(row.id);
      let images: string[] = [];
      try {
        images = JSON.parse(String(row.images));
      } catch {
        images = [String(row.images)];
      }

      const tiers = tiersByProductId[pId] || [];
      const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : 0;

      return {
        id: pId,
        categoryId: String(row.category_id),
        categoryName: String(row.category_name),
        categorySlug: String(row.category_slug),
        name: String(row.name),
        slug: String(row.slug),
        description: String(row.description),
        images,
        isActive: Boolean(row.is_active),
        pricingTiers: tiers,
        minPrice,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const body = await req.json();
    const { name, categoryId, description, images = [], pricingTiers = [], isActive = 1 } = body;

    if (!name || !categoryId || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const id = "prod-" + Date.now();

    await db.execute({
      sql: `INSERT INTO products (id, category_id, name, slug, description, images, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        categoryId,
        name,
        slug,
        description,
        JSON.stringify(images),
        isActive ? 1 : 0,
      ],
    });

    // Insert pricing tiers
    for (const tier of pricingTiers) {
      const tierId = `tier-${id}-${tier.days}-${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO pricing_tiers (id, product_id, days, price)
              VALUES (?, ?, ?, ?)`,
        args: [tierId, id, Number(tier.days), Number(tier.price)],
      });
    }

    return NextResponse.json({ success: true, id, slug });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
