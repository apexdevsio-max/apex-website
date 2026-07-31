import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

const PUBLIC_FILE = /\.(.*)$/;

// Top-level route segments that exist under /[lang]. An un-prefixed but otherwise
// valid path (/about) is worth redirecting to /en/about; an unrecognised one is not.
const KNOWN_ROUTES = new Set([
  "about",
  "services",
  "portfolio",
  "blog",
  "academy",
  "contact",
  "privacy",
  "terms",
]);

function getBrowserLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((entry) => {
        const [tag, quality = "q=1"] = entry.trim().split(";");
        return { locale: tag.split("-")[0].toLowerCase(), quality: Number(quality.replace("q=", "")) || 0 };
      })
      .filter(({ locale }) => locale === "ar" || locale === "en")
      .sort((a, b) => b.quality - a.quality)[0]?.locale;
    if (preferred === "ar") return "ar";
  }
  return DEFAULT_LOCALE;
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
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", firstSegment);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // No recognised locale prefix. Prefixing the path wholesale (/xx/about →
  // /en/xx/about) produced a permanent redirect to a 404, which crawlers cache.
  // A known route gets its locale prefix; anything else redirects to the locale
  // home, temporarily, so a bad URL is never enshrined as a 308.
  const url = request.nextUrl.clone();
  if (firstSegment && KNOWN_ROUTES.has(firstSegment)) {
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url, { status: 308 });
  }

  url.pathname = `/${DEFAULT_LOCALE}`;
  return NextResponse.redirect(url, { status: 307 });
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|images|videos).*)",
  ],
};
