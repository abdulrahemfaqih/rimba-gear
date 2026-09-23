import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id: productId } = await params;
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 1. Fetch product to get total stock
    const prodRes = await db.execute({
      sql: `SELECT id, name, stock FROM products WHERE id = ?`,
      args: [productId],
    });

    if (prodRes.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = prodRes.rows[0];
    const totalStock = Number(product.stock ?? 5);

    // If no dates provided, return totalStock as availableStock
    if (!startDate || !endDate) {
      return NextResponse.json({
        productId,
        totalStock,
        availableStock: totalStock,
        maxBooked: 0,
      });
    }

    // 2. Fetch all active orders overlapping with this date range
    // Overlap condition: order.start_date <= endDate AND order.end_date >= startDate
    // Status must be confirmed / active booking: 'dikonfirmasi', 'bayar_dp', 'ambil_barang'
    const sql = `
      SELECT o.id, o.start_date, o.end_date, oi.quantity
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.product_id = ?
        AND o.status IN ('dikonfirmasi', 'bayar_dp', 'ambil_barang')
        AND o.start_date IS NOT NULL
        AND o.end_date IS NOT NULL
        AND o.start_date <= ?
        AND o.end_date >= ?
    `;

    const ordersRes = await db.execute({
      sql,
      args: [productId, endDate, startDate],
    });

    // 3. Calculate max booked units on any day in the requested range
    const days: string[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);

    // Safety guard to avoid runaway loop if dates are invalid
    let iterations = 0;
    while (curr <= end && iterations < 365) {
      days.push(curr.toISOString().slice(0, 10));
      curr.setDate(curr.getDate() + 1);
      iterations++;
    }

    let maxBooked = 0;
    for (const day of days) {
      let bookedOnDay = 0;
      for (const row of ordersRes.rows) {
        const orderStart = String(row.start_date);
        const orderEnd = String(row.end_date);
        const qty = Number(row.quantity || 1);

        if (day >= orderStart && day <= orderEnd) {
          bookedOnDay += qty;
        }
      }
      if (bookedOnDay > maxBooked) {
        maxBooked = bookedOnDay;
      }
    }

    const availableStock = Math.max(0, totalStock - maxBooked);

    return NextResponse.json({
      productId,
      totalStock,
      maxBooked,
      availableStock,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json(
      { error: "Failed to check product availability" },
      { status: 500 }
    );
  }
}
