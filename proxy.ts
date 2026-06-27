import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "neiro_admin_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ログインページ自体は素通しする
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = req.cookies.get(COOKIE_NAME);
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
