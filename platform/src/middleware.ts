import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/app")) return NextResponse.next();
  if (!req.cookies.get("st_session")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
