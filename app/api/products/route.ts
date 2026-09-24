import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const products = await getProducts({
      categorySlug,
      categoryId,
      search,
      includeInactive,
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, description, images = [], pricingTiers = [], isActive = 1, stock = 5 } = body;

    if (!name || !categoryId || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { id, slug } = await createProduct({
      name,
      categoryId,
      description,
      images,
      pricingTiers,
      isActive: Boolean(isActive),
      stock: Number(stock),
    });

    return NextResponse.json({ success: true, id, slug });
  } catch (error: any) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
  }
}
