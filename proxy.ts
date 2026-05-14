import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SUPPORTED_LOCALES } from "@/lib/i18n/locale";

const PUBLIC_FILE = /\.(.*)$/;

function getBrowserLocale(request: NextRequest): "en" | "ar" {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")[0]
      ?.split("-")[0]
      ?.trim()
      .toLowerCase();
    if (preferred === "ar") return "ar";
  }
  return "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const firstSegment = segments[1];

  // Root path → detect browser language and redirect
  if (pathname === "/") {
    const locale = getBrowserLocale(request);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Known locale → set header
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as (typeof SUPPORTED_LOCALES)[number])) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", firstSegment);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Unknown locale → default to English with redirect
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, { status: 308 });
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|images|videos).*)",
  ],
};
