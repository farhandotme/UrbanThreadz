import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value || "";
  const path = request.nextUrl.pathname;

  // Admin dashboard protection
  if (path === "/admin/dashboard") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Protect cart API routes
  if (path.startsWith("/api/users/cart")) {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value || 
                       request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (!sessionToken) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
}

export const config = {
  matcher: [
    "/admin/dashboard",
    "/api/:path*",
    "/api/users/cart/:path*"
  ],
};
