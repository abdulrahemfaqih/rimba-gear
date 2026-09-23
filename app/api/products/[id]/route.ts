import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();

    // Query by id or slug
    const productResult = await db.execute({
      sql: `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? OR p.slug = ?
        LIMIT 1
      `,
      args: [id, id],
    });

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const row = productResult.rows[0];
    const productId = String(row.id);

    let images: string[] = [];
    try {
      images = JSON.parse(String(row.images));
    } catch {
      images = [String(row.images)];
    }

    const tiersResult = await db.execute({
      sql: `SELECT * FROM pricing_tiers WHERE product_id = ? ORDER BY days ASC`,
      args: [productId],
    });

    const pricingTiers = tiersResult.rows.map((t) => ({
      id: String(t.id),
      days: Number(t.days),
      price: Number(t.price),
    }));

    const minPrice = pricingTiers.length > 0 ? Math.min(...pricingTiers.map((t) => t.price)) : 0;

    const product = {
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
      pricingTiers,
      minPrice,
    };

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();
    const body = await req.json();
    const { name, categoryId, description, images, pricingTiers, isActive, stock } = body;

    const slug = name
      ? name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      : undefined;

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
        name ?? null,
        slug ?? null,
        categoryId ?? null,
        description ?? null,
        images ? JSON.stringify(images) : null,
        stock !== undefined ? Number(stock) : null,
        isActive !== undefined ? (isActive ? 1 : 0) : null,
        id,
      ],
    });

    if (pricingTiers && Array.isArray(pricingTiers)) {
      // Re-create pricing tiers
      await db.execute({
        sql: `DELETE FROM pricing_tiers WHERE product_id = ?`,
        args: [id],
      });

      for (const tier of pricingTiers) {
        const tierId = `tier-${id}-${tier.days}-${Date.now()}`;
        await db.execute({
          sql: `INSERT INTO pricing_tiers (id, product_id, days, price)
                VALUES (?, ?, ?, ?)`,
          args: [tierId, id, Number(tier.days), Number(tier.price)],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();

    // Toggle active
    await db.execute({
      sql: `UPDATE products SET is_active = 0 WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
