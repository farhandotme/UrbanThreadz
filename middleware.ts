import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value || "";
  if (request.nextUrl.pathname === "/admin/dashboard") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
}

export const config = {
  matcher: ["/admin/dashboard"],
};
