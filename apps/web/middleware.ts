import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED =
  /^\/(home|opportunities|applications|queue|session|resume|saved|networking|interview|calendar|analytics|settings|onboarding)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api")) return NextResponse.next();
  const hasSession = Boolean(request.cookies.get("ios_session")?.value);
  if (PROTECTED.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
