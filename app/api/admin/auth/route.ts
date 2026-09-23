import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

const DEFAULT_USER = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_PASS = process.env.ADMIN_PASSWORD || "rimbagear2026";
const COOKIE_NAME = "rimbagear_admin_session";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const db = getDb();
    const { username, password } = await req.json();

    // Check credentials against database admins table
    const adminRes = await db.execute({
      sql: `SELECT * FROM admins WHERE username = ? AND password = ? LIMIT 1`,
      args: [username, password],
    });

    const isMatch =
      adminRes.rows.length > 0 ||
      (username === DEFAULT_USER && password === DEFAULT_PASS);

    if (isMatch) {
      const admin = adminRes.rows[0];
      const response = NextResponse.json({
        success: true,
        user: {
          username: admin?.username || username,
          name: admin?.name || "Administrator Rimba Gear",
        },
      });

      response.cookies.set(COOKIE_NAME, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME);
  const isAuthenticated = cookie?.value === "authenticated";
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
