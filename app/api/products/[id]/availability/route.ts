import { NextRequest, NextResponse } from "next/server";
import { checkProductAvailability } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const availability = await checkProductAvailability(productId, startDate, endDate);

    if (!availability) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(availability);
  } catch (error: any) {
    console.error("Availability GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check product availability" },
      { status: 500 }
    );
  }
}
