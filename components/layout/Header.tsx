"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore, useEffect, type MouseEvent } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/data/navigation";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locale";

type Props = {
  lang: Locale;
  dictionary: Dictionary;
};

const THEME_EVENT = "apex-theme-change";

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    if (!localStorage.getItem("theme")) document.documentElement.classList.toggle("dark", media.matches);
    callback();
  };
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", syncSystemTheme);
  media.addEventListener("change", syncSystemTheme);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", syncSystemTheme);
    media.removeEventListener("change", syncSystemTheme);
  };
}

function getDarkMode() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );
}

// Resolves the effective theme the same way the pre-paint script in the layout
// does, so both agree on what "no stored preference" means.
function resolveStoredDark() {
  const stored = localStorage.getItem("theme");
  return stored
    ? stored === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function Header({ lang, dictionary }: Props) {
  const pathname = usePathname() || `/${lang}`;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const trigger = menuButtonRef.current;
    const focusable = () => Array.from(menu?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []);
    focusable()[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const items = focusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); trigger?.focus(); };
  }, [open]);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const darkMode = useSyncExternalStore(subscribeTheme, getDarkMode, () => false);

  // Switching language swaps the [lang] layout, and <html> is rendered there, so
  // the `dark` class set on documentElement is dropped on client-side navigation.
  // The layout's pre-paint script only runs on a full document load, so re-apply
  // the stored preference here whenever the path changes.
  useEffect(() => {
    const dark = resolveStoredDark();
    if (dark !== document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.toggle("dark", dark);
      window.dispatchEvent(new Event(THEME_EVENT));
    }
  }, [pathname]);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const buildUrl = (path: string) =>
    path === "/" || path === ""
      ? `/${lang}`
      : `/${lang}/${path}`.replace(/\/+/g, "/");

  const normalizePath = (value: string) =>
    value.endsWith("/") && value.length > 1 ? value.slice(0, -1) : value;

  const isActive = (path: string) => {
    const full = normalizePath(buildUrl(path));
    const current = normalizePath(pathname);
    if (full === `/${lang}`) return current === full;
    return current === full || current.startsWith(`${full}/`);
  };

  // Built from the pathname only. Reading useSearchParams() here would opt every
  // page out of static generation just to preserve a query string, so the current
  // search is appended at click time instead (see handleLanguageSwitch).
  const switchedHref = useMemo(() => {
    const target = lang === "ar" ? "en" : "ar";
    const segments = pathname.split("/");

    if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }

    return segments.join("/").replace(/\/+/g, "/");
  }, [lang, pathname]);

  const handleLanguageSwitch = (event: MouseEvent<HTMLAnchorElement>) => {
    const search = window.location.search;
    if (!search) return;
    event.preventDefault();
    window.location.assign(`${switchedHref}${search}`);
  };

  const navLinks = useMemo(
    () =>
      navigationItems.map((item) => ({
        key: item.key,
        path: item.path,
        label:
          dictionary.navigation[item.key as keyof typeof dictionary.navigation] ??
          item.key,
      })),
    [dictionary]
  );

  const isAr = lang === "ar";

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-400"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--color-background) 92%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--color-border)"
          : "1px solid transparent",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "70px" }}
        dir={isAr ? "rtl" : "ltr"}
      >
        <Link href={buildUrl("/")} className="shrink-0 flex items-center gap-2">
          <Image
            src="/images/Apex_logo.png"
            alt={isAr ? "أبيكس — شركة تطوير برمجيات في الخليج" : "Apex — Software Development Company in the Gulf"}
            width={110}
            height={36}
            priority
            quality={75}
            sizes="110px"
            style={{
              filter: darkMode
                ? "drop-shadow(0 0 10px color-mix(in srgb, var(--color-primary) 55%, transparent))"
                : undefined,
            }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={buildUrl(link.path)}
              className={`text-sm font-medium transition-colors duration-200 relative group ${
                isAr ? "font-ar" : "font-en"
              }`}
              style={{
                color: isActive(link.path)
                  ? "var(--color-primary)"
                  : "var(--color-primary-text)",
              }}
            >
              {link.label}
              <span
                className="absolute -bottom-0.5 left-0 right-0 h-px rounded-full transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"
                style={{
                  background: "var(--color-primary)",
                  transform: isActive(link.path) ? "scaleX(1)" : undefined,
                }}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={buildUrl("contact")}
            className="apex-btn hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              boxShadow: "0 4px 18px color-mix(in srgb, var(--color-primary) 38%, transparent)",
            }}
          >
            {dictionary.navigation.letsTalk}
          </Link>

          {isClient ? (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-full transition-colors"
              style={{
                color: "var(--color-gold)",
                background: "color-mix(in srgb, var(--color-gold) 10%, transparent)",
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          ) : (
            <div className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5" />
          )}

          <Link
            href={switchedHref}
            onClick={handleLanguageSwitch}
            className="px-4 py-3 md:px-4 md:py-3 text-xs font-bold rounded-full border transition-all min-w-[44px] min-h-[44px] text-center flex items-center justify-center"
            style={{
              color: "var(--color-lang-pill-text)",
              borderColor: "var(--color-lang-pill-border)",
              background: "var(--color-lang-pill-bg)",
            }}
            aria-label="Switch language"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </Link>

          <button
            ref={menuButtonRef}
            className="md:hidden p-3 rounded-md transition-colors"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{ color: "var(--color-primary-text)" }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.25)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "قائمة التنقل" : "Navigation menu"}
          className="md:hidden border-t"
          style={{
            background: "color-mix(in srgb, var(--color-background) 96%, transparent)",
            backdropFilter: "blur(20px)",
            borderColor: "var(--color-border)",
          }}
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="px-5 py-6 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={buildUrl(link.path)}
                className={`block px-4 min-h-[44px] flex items-center rounded-xl text-sm font-medium transition-colors ${
                  isAr ? "font-ar" : "font-en"
                }`}
                style={{
                  color: isActive(link.path)
                    ? "var(--color-primary)"
                    : "var(--color-primary-text)",
                  background: isActive(link.path)
                    ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                    : "transparent",
                }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href={buildUrl("contact")}
              className="mt-3 px-4 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-bold text-white text-center"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              }}
              onClick={() => setOpen(false)}
            >
              {dictionary.navigation.letsTalk}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
