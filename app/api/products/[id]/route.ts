import { NextRequest, NextResponse } from "next/server";
import { getProductBySlugOrId, updateProduct, deleteProduct } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductBySlugOrId(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, categoryId, description, images, pricingTiers, isActive, stock } = body;

    await updateProduct(id, {
      name,
      categoryId,
      description,
      images,
      pricingTiers,
      isActive,
      stock,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete product" }, { status: 500 });
  }
}
