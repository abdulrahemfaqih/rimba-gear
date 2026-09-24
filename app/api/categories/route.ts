import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const categories = await getCategories({ includeInactive });
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, imageUrl, sortOrder = 0, isActive = 1 } = body;

    if (!name || !imageUrl) {
      return NextResponse.json({ error: "Name and Image URL are required" }, { status: 400 });
    }

    const { id, slug } = await createCategory({
      name,
      imageUrl,
      sortOrder: Number(sortOrder),
      isActive: Boolean(isActive),
    });

    return NextResponse.json({ success: true, id, slug });
  } catch (error: any) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create category" }, { status: 500 });
  }
}
