import Link from "next/link";
import Image from "next/image";
import { getRtlClasses } from "@/lib/i18n/rtl";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

// Each slug is paired with the dictionary index it takes its label from, so
// reordering `services.items` in the dictionaries cannot silently repoint these
// links at the wrong service.
const FOOTER_SERVICES = [
  { slug: "web-development", titleIndex: 0 },
  { slug: "mobile-apps", titleIndex: 1 },
  { slug: "ai-solutions", titleIndex: 2 },
] as const;

export function Footer({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const rtl = getRtlClasses(lang);
  const { footer, services } = dictionary;
  const isAr = lang === "ar";

  // Pages are statically generated, so this is the build year. Accurate enough for
  // a copyright line; it refreshes on the next deploy.
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-apex-border bg-apex-bg py-12 md:py-16"
      dir={rtl.dirAttr}
      style={{ contain: "layout paint size", minHeight: "200px" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className={`grid grid-cols-1 gap-8 lg:gap-12 ${
          isAr 
            ? "lg:grid-cols-4 lg:text-right" 
            : "lg:grid-cols-4 lg:text-left"
        }`}>
          <div className={`flex flex-col ${rtl.flexRev}`}>
            <Link href={`/${lang}`} className="mb-6 flex items-center gap-2">
              <Image
                src="/images/Apex_logo.png"
                alt={isAr ? "أبيكس — شركة تطوير برمجيات في الخليج" : "Apex — Software Development Company in the Gulf"}
                width={120}
                height={40}
                quality={75}
                sizes="120px"
                loading="lazy"
              />
            </Link>
            <p className={`text-sm ${rtl.fontClass}`} style={{ opacity: 0.8, lineHeight: "1.625" }}>
              {footer.description}
            </p>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-lg" style={{ color: "var(--color-primary)", lineHeight: "1.4" }}>
              {footer.quickLinks}
            </h3>
            <ul className="space-y-2">
              {(Object.entries(dictionary.navigation || {}) as [string, string][])
                .filter(([key]) => key !== "letsTalk")
                .map(([key, label]) => {
                  const path = key === "home" ? "" : key;
                  return (
                    <li key={key}>
                      <Link
                        href={`/${lang}${path ? `/${path}` : ""}`}
                        className="text-sm transition-colors hover:text-apex-primary block py-3 min-h-[44px] flex items-center"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-bold text-lg" style={{ color: "var(--color-primary)", lineHeight: "1.4" }}>
              {services.title}
            </h3>
            <ul className="space-y-2">
              {FOOTER_SERVICES.map(({ slug, titleIndex }) => {
                const title = services.items[titleIndex]?.title;
                if (!title) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/${lang}/services/${slug}`}
                      className="text-sm transition-colors hover:text-apex-primary block py-3 min-h-[44px] flex items-center"
                    >
                      {title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={`${rtl.flexRev}`}>
            <h3 className="mb-6 font-bold text-lg" style={{ color: "var(--color-primary)", lineHeight: "1.4" }}>
              {footer.quickContact}
            </h3>
            <Link
              href={`/${lang}/contact`}
              className={`inline-flex items-center gap-2 text-sm font-bold transition-all px-5 py-3.5 rounded-full border-2 border-apex-primary text-apex-primary hover:bg-apex-primary hover:text-white ${rtl.fontClass}`}
            >
              {dictionary.navigation.letsTalk}
              <span className={`${rtl.arrowRotate}`} aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-apex-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-sm ${rtl.fontClass}`} style={{ opacity: 0.6, lineHeight: "1.5" }}>
            © {year} Apex. {footer.rights}
          </p>
          <div className="flex gap-4">
            <Link href={`/${lang}/privacy`} className="text-sm hover:text-apex-primary transition-colors py-2 min-h-[44px] flex items-center">
              {footer.privacy}
            </Link>
            <Link href={`/${lang}/terms`} className="text-sm hover:text-apex-primary transition-colors py-2 min-h-[44px] flex items-center">
              {footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

