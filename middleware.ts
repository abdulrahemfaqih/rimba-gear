import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("rimbagear_admin_session");
  const isAuthenticated = sessionCookie?.value === "authenticated";

  // If user tries to access protected admin pages without authentication
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      // Optional: keep redirect target for post-login redirection
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is already authenticated and visits /admin/login, redirect to /admin dashboard
  if (pathname === "/admin/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
