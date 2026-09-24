import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const orders = await getOrders({ status });
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      address,
      idPhotoUrl,
      totalPrice,
      startDate,
      endDate,
      dpPercentage = 30,
      dpAmount = 0,
      items,
    } = body;

    if (!customerName || !phone || !idPhotoUrl || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderItems = items.map((it: any) => ({
      productId: it.productId || null,
      productName: it.name || it.productName,
      days: Number(it.days || it.selectedDays || 1),
      price: Number(it.price || it.selectedPrice || 0),
      quantity: Number(it.quantity || 1),
    }));

    const { orderId } = await createOrder(
      {
        customerName,
        phone,
        address,
        idPhotoUrl,
        totalPrice: Number(totalPrice),
        startDate,
        endDate,
        dpPercentage: Number(dpPercentage),
        dpAmount: Number(dpAmount),
      },
      orderItems
    );

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
