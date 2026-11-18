import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locale";

/** Set by the header's language switch; a visitor's explicit choice beats the browser setting. */
const LOCALE_COOKIE = "NEXT_LOCALE";

// Top-level route segments that exist under /[lang]. An un-prefixed but valid
// path (/about) is redirected into the visitor's language; anything else 404s.
const KNOWN_ROUTES = new Set(["about", "services", "portfolio", "blog", "contact", "privacy", "terms"]);

function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const best = acceptLanguage
      .split(",")
      .map((entry) => {
        const [tag, quality = "q=1"] = entry.trim().split(";");
        return { locale: tag.split("-")[0].toLowerCase(), quality: Number(quality.replace("q=", "")) || 0 };
      })
      .filter(({ locale }) => isLocale(locale))
      .sort((a, b) => b.quality - a.quality)[0]?.locale;
    if (best && isLocale(best)) return best;
  }
  return DEFAULT_LOCALE;
}

/**
 * Runs only for paths without a locale prefix (see the matcher), so ordinary
 * page views no longer pass through it. Uppercase prefixes such as /EN/ are
 * redirected in next.config.ts before the proxy runs.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first = ""] = pathname.split("/");
  const url = request.nextUrl.clone();

  // The bare root negotiates a language. Temporary, and marked as varying, so
  // caches and crawlers do not pin one visitor's language for everyone.
  if (pathname === "/") {
    url.pathname = `/${preferredLocale(request)}`;
    const response = NextResponse.redirect(url, { status: 307 });
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }

  if (KNOWN_ROUTES.has(first)) {
    url.pathname = `/${preferredLocale(request)}${pathname}`;
    const response = NextResponse.redirect(url, { status: 307 });
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }

  // Unknown paths fall through to the 404 page instead of being redirected home,
  // which hid broken links behind a 307.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|en(?:/|$)|ar(?:/|$)|.*\..*).*)"],
};
