import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();
    const body = await req.json();
    const { name, imageUrl, sortOrder, isActive } = body;

    const slug = name
      ? name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      : undefined;

    await db.execute({
      sql: `UPDATE categories 
            SET name = COALESCE(?, name),
                slug = COALESCE(?, slug),
                image_url = COALESCE(?, image_url),
                sort_order = COALESCE(?, sort_order),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
      args: [
        name ?? null,
        slug ?? null,
        imageUrl ?? null,
        sortOrder !== undefined ? Number(sortOrder) : null,
        isActive !== undefined ? (isActive ? 1 : 0) : null,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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

    // Toggle active or delete
    await db.execute({
      sql: `UPDATE categories SET is_active = 0 WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
