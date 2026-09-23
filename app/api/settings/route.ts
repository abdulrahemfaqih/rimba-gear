import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const res = await db.execute("SELECT * FROM settings");
    const settingsMap: Record<string, string> = {};
    for (const row of res.rows) {
      settingsMap[String(row.key)] = String(row.value);
    }

    const dpPercentage = parseInt(settingsMap["dp_percentage"] || "30", 10);

    return NextResponse.json({
      dpPercentage: isNaN(dpPercentage) ? 30 : dpPercentage,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const body = await req.json();
    const { dpPercentage } = body;

    if (typeof dpPercentage !== "number" || dpPercentage < 0 || dpPercentage > 100) {
      return NextResponse.json(
        { error: "dpPercentage harus berupa angka antara 0 dan 100" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `INSERT INTO settings (key, value) VALUES ('dp_percentage', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [String(dpPercentage)],
    });

    return NextResponse.json({ success: true, dpPercentage });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
