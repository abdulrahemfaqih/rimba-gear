import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, imageUrl, sortOrder, isActive } = body;

    await updateCategory(id, {
      name,
      imageUrl,
      sortOrder,
      isActive,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Category PUT error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete category" }, { status: 500 });
  }
}
