import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locale";

const PUBLIC_FILE = /\.(.*)$/;

function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const locale = segments[1];

  if (SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;

  // 308 = permanent redirect — المتصفح يحفظه ولا يكرر الطلب
  return NextResponse.redirect(url, { status: 308 });
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|images|videos).*)",
  ],
};