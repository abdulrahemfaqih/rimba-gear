import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/db";

const COOKIE_NAME = "rimbagear_admin_session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const admin = await verifyAdminCredentials(username, password);

    if (admin) {
      const response = NextResponse.json({
        success: true,
        user: {
          username: admin.username || username,
          name: admin.name || "Administrator Outdoor",
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
  } catch (error: any) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 500 });
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
