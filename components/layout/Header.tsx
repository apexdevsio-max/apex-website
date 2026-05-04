"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

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
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  media.addEventListener("change", callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}

function getDarkMode() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );
}

export function Header({ lang, dictionary }: Props) {
  const pathname = usePathname() || `/${lang}`;
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const darkMode = useSyncExternalStore(subscribeTheme, getDarkMode, () => false);

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

  const switchedHref = useMemo(() => {
    const target = lang === "ar" ? "en" : "ar";
    const segments = pathname.split("/");

    if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }

    const next = segments.join("/").replace(/\/+/g, "/");
    const query = searchParams.toString();
    return query ? `${next}?${query}` : next;
  }, [lang, pathname, searchParams]);

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
            src="/images/Apex_logo.webp"
            alt="APEX"
            width={110}
            height={36}
            priority
            quality={70}
            style={{
              filter: darkMode
                ? "drop-shadow(0 0 10px color-mix(in srgb, var(--color-primary) 55%, transparent))"
                : "brightness(0.75)",
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

          {isClient && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full transition-colors"
              style={{
                color: "var(--color-gold)",
                background: "color-mix(in srgb, var(--color-gold) 10%, transparent)",
              }}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          <Link
            href={switchedHref}
            className="px-3 py-1.5 text-xs font-bold rounded-full border transition-all"
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
            className="md:hidden p-2 rounded-md transition-colors"
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
          id="mobile-menu"
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
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
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
              className="mt-3 px-4 py-3 rounded-xl text-sm font-bold text-white text-center"
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
