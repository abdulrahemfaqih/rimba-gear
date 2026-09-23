import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const db = getDb();
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

    await db.execute({
      sql: `UPDATE orders SET status = ? WHERE id = ?`,
      args: [finalStatus, id],
    });

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
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

    // Delete order items first (or cascade)
    await db.execute({
      sql: `DELETE FROM order_items WHERE order_id = ?`,
      args: [id],
    });

    // Delete order
    await db.execute({
      sql: `DELETE FROM orders WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
