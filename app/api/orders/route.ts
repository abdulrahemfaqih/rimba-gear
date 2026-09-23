import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let sql = `SELECT * FROM orders`;
    const args: any[] = [];

    if (status && status !== "semua") {
      sql += ` WHERE status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY created_at DESC`;

    const ordersResult = await db.execute({ sql, args });

    // Fetch items for all orders
    const itemsResult = await db.execute(`SELECT * FROM order_items`);
    const itemsByOrderId: Record<string, any[]> = {};

    for (const item of itemsResult.rows) {
      const orderId = String(item.order_id);
      if (!itemsByOrderId[orderId]) {
        itemsByOrderId[orderId] = [];
      }
      itemsByOrderId[orderId].push({
        id: String(item.id),
        productId: String(item.product_id),
        productName: String(item.product_name),
        days: Number(item.days),
        price: Number(item.price),
        quantity: Number(item.quantity || 1),
      });
    }

    const orders = ordersResult.rows.map((row) => ({
      id: String(row.id),
      customerName: String(row.customer_name),
      phone: String(row.phone),
      address: row.address ? String(row.address) : null,
      idPhotoUrl: String(row.id_photo_url),
      totalPrice: Number(row.total_price),
      status: String(row.status),
      createdAt: String(row.created_at),
      items: itemsByOrderId[String(row.id)] || [],
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const body = await req.json();
    const { customerName, phone, address, idPhotoUrl, totalPrice, items } = body;

    if (!customerName || !phone || !idPhotoUrl || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `RMB-${dateStr}-${randomSuffix}`;
    const createdAt = now.toISOString();

    await db.execute({
      sql: `INSERT INTO orders (id, customer_name, phone, address, id_photo_url, total_price, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'baru', ?)`,
      args: [orderId, customerName, phone, address || null, idPhotoUrl, totalPrice, createdAt],
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = `item-${orderId}-${i + 1}`;
      await db.execute({
        sql: `INSERT INTO order_items (id, order_id, product_id, product_name, days, price, quantity)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          itemId,
          orderId,
          item.productId || null,
          item.name || item.productName,
          Number(item.days || item.selectedDays),
          Number(item.price || item.selectedPrice),
          Number(item.quantity || 1),
        ],
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
