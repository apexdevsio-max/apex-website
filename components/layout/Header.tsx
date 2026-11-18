"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { navigationItems } from "@/data/navigation";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locale";
import { onMediaChange, readStorage, writeStorage } from "@/lib/browser";

type Props = {
  lang: Locale;
  /** Only the navigation strings; the full dictionary used to be serialised into every page. */
  navigation: Dictionary["navigation"];
};

const THEME_EVENT = "apex-theme-change";
const HEADER_HEIGHT = 70;

/** Read by proxy.ts so a bare URL opens in the language the visitor last chose. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

// Resolves the effective theme the same way the pre-paint script in the layout does.
function resolveStoredDark() {
  const stored = readStorage("theme");
  return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme() {
  const dark = resolveStoredDark();
  if (dark !== document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.toggle("dark", dark);
  }
}

function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  // A change in another tab (storage) or in the OS setting (media) both re-resolve.
  const sync = () => {
    applyTheme();
    callback();
  };
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", sync);
  const stopMedia = onMediaChange(media, sync);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", sync);
    stopMedia();
  };
}

const getDarkMode = () => document.documentElement.classList.contains("dark");

const LABELS = {
  en: {
    nav: "Main navigation",
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toDark: "Switch to dark theme",
    toLight: "Switch to light theme",
    switchLang: "العربية — switch to Arabic",
    home: "APEX — home",
  },
  ar: {
    nav: "التنقل الرئيسي",
    menu: "القائمة",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    toDark: "التبديل إلى الوضع الداكن",
    toLight: "التبديل إلى الوضع الفاتح",
    switchLang: "English — التبديل إلى الإنجليزية",
    home: "أبيكس — الصفحة الرئيسية",
  },
} as const;

export function Header({ lang, navigation }: Props) {
  const pathname = usePathname() || `/${lang}`;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = LABELS[lang];
  const isAr = lang === "ar";

  // An IntersectionObserver on a sentinel reports the scroll crossing without
  // reading layout in a scroll handler.
  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Menu side effects: scroll lock, Escape, focus return, and closing when the
  // viewport grows past the breakpoint (otherwise the lock outlives the menu).
  useEffect(() => {
    if (!open) return;
    const trigger = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    const stopMedia = onMediaChange(desktop, onBreakpoint);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      stopMedia();
      trigger?.focus();
    };
  }, [open]);

  const isClient = useSyncExternalStore(() => () => {}, () => true, () => false);
  const darkMode = useSyncExternalStore(subscribeTheme, getDarkMode, () => false);

  // Switching language swaps the [lang] layout, which re-renders <html> without
  // the `dark` class, so the stored preference is re-applied on every path change.
  useEffect(() => {
    applyTheme();
    window.dispatchEvent(new Event(THEME_EVENT));
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    writeStorage("theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const buildUrl = (path: string) => (path === "/" || path === "" ? `/${lang}` : `/${lang}/${path}`);

  const isActive = (path: string) => {
    const full = buildUrl(path);
    const current = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    if (full === `/${lang}`) return current === full;
    return current === full || current.startsWith(`${full}/`);
  };

  const targetLang: Locale = isAr ? "en" : "ar";

  // Built from the pathname only; reading useSearchParams() would opt every page
  // out of static generation. The query string is appended at click time.
  const switchedHref = useMemo(() => {
    const segments = pathname.split("/");
    if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1] as Locale)) segments[1] = targetLang;
    else segments.splice(1, 0, targetLang);
    return segments.join("/").replace(/\/+/g, "/");
  }, [pathname, targetLang]);

  const handleLanguageSwitch = (event: MouseEvent<HTMLAnchorElement>) => {
    document.cookie = `${LOCALE_COOKIE}=${targetLang}; path=/; max-age=31536000; samesite=lax`;
    const search = window.location.search;
    if (!search) return;
    event.preventDefault();
    router.push(`${switchedHref}${search}`);
  };

  const links = navigationItems.map((item) => ({
    key: item.key,
    href: buildUrl(item.path),
    label: navigation[item.key],
    active: isActive(item.path),
  }));

  return (
    <>
      {/* Zero-height marker at the 56px scroll mark, watched by the observer above. */}
      <div
        ref={scrollSentinelRef}
        aria-hidden="true"
        style={{ position: "absolute", top: "56px", height: "1px", width: "1px", pointerEvents: "none" }}
      />
      <header
        className="fixed top-0 inset-x-0 z-50 transition-[background-color,border-color] duration-300"
        style={{
          background: scrolled || open ? "color-mix(in srgb, var(--color-background) 94%, transparent)" : "transparent",
          borderBottom: `1px solid ${scrolled || open ? "var(--color-border)" : "transparent"}`,
        }}
      >
        {/* The blur lives on a child, not on <header>: a backdrop-filter on the
            header makes it the containing block for fixed descendants. */}
        {(scrolled || open) && <div aria-hidden="true" className="absolute inset-0 -z-10 backdrop-blur-xl" />}
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: HEADER_HEIGHT }}>
          <Link href={buildUrl("/")} className="shrink-0 flex items-center" aria-label={t.home}>
            <Image src="/images/Apex_logo.png" alt="" width={110} height={41} preload sizes="110px" />
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label={t.nav}>
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={`relative group text-sm font-medium transition-colors ${
                  link.active ? "text-apex-primary" : "text-apex-text hover:text-apex-primary"
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-1 inset-x-0 h-0.5 rounded-full bg-apex-primary transition-transform duration-300 ltr:origin-left rtl:origin-right ${
                    link.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href={buildUrl("contact")} className="apex-btn-primary hidden md:inline-flex px-5 py-2">
              {navigation.letsTalk}
            </Link>

            {isClient ? (
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={darkMode ? t.toLight : t.toDark}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-apex-text hover:bg-apex-card transition-colors"
              >
                {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              </button>
            ) : (
              <div className="min-h-[44px] min-w-[44px]" />
            )}

            <Link
              href={switchedHref}
              onClick={handleLanguageSwitch}
              hrefLang={targetLang}
              lang={targetLang}
              aria-label={t.switchLang}
              className="min-w-[44px] min-h-[44px] px-3 flex items-center justify-center rounded-full border border-apex-border text-xs font-bold text-apex-text hover:border-apex-primary transition-colors"
            >
              {isAr ? "EN" : "عربي"}
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-apex-text"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? t.closeMenu : t.openMenu}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop and panel are siblings of <header>, not children. Inside it, the
          backdrop painted above the panel, so every tap on a link landed on the
          backdrop and only closed the menu. Both start below the header so the
          toggle stays reachable. */}
      {open && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-x-0 bottom-0 z-40 bg-black/30 md:hidden"
            style={{ top: HEADER_HEIGHT }}
            onClick={() => setOpen(false)}
          />
          <nav
            ref={menuRef}
            id="mobile-menu"
            aria-label={t.menu}
            className="fixed inset-x-0 z-50 overflow-y-auto border-b border-apex-border bg-apex-bg md:hidden"
            style={{ top: HEADER_HEIGHT, maxHeight: `calc(100dvh - ${HEADER_HEIGHT}px)` }}
          >
            <div className="px-5 py-5 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={`px-4 min-h-[48px] flex items-center rounded-xl text-base font-medium ${
                    link.active ? "text-apex-primary bg-apex-card" : "text-apex-text"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href={buildUrl("contact")} className="apex-btn-primary mt-3 min-h-[48px]" onClick={() => setOpen(false)}>
                {navigation.letsTalk}
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
