import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, deleteOrder } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const allowedStatuses = [
      "pending",
      "dikonfirmasi",
      "bayar_dp",
      "ambil_barang",
      "selesai",
      "dibatalkan",
      "baru",
    ];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const finalStatus = status === "baru" ? "pending" : status;
    await updateOrderStatus(id, finalStatus);

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error: any) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order status" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete order" }, { status: 500 });
  }
}
