import Link from "next/link";
import Image from "next/image";
import { useRtl } from "@/hooks/useRtl";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

export function Footer({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const rtl = useRtl(lang);
  const { footer } = dictionary;
  const isAr = lang === "ar";

  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-apex-border bg-apex-surface py-12 md:py-16"
      dir={rtl.dirAttr}
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
                src="/images/Apex_logo.webp"
                alt="Apex"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className={`text-sm ${rtl.fontClass}`} style={{ opacity: 0.8 }}>
              {footer.description}
            </p>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-lg" style={{ color: "var(--color-primary)" }}>
              {footer.quickLinks}
            </h4>
            <ul className="space-y-2">
              {Object.entries(dictionary.navigation || {}).map(([key, label]) => (
                <li key={key}>
                  <Link 
                    href={`/${lang}${key === 'home' ? '' : `/${key.replace(/^[a-z]+/, '')}`}`}
                    className="text-sm transition-colors hover:text-apex-primary block py-1"
                  >
                    {label as string}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-lg" style={{ color: "var(--color-primary)" }}>
              Services
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/services`} className="text-sm transition-colors hover:text-apex-primary block py-1">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services`} className="text-sm transition-colors hover:text-apex-primary block py-1">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services`} className="text-sm transition-colors hover:text-apex-primary block py-1">
                  AI Solutions
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${rtl.flexRev}`}>
            <h4 className="mb-6 font-bold text-lg" style={{ color: "var(--color-primary)" }}>
              {footer.quickContact}
            </h4>
            <div className="flex gap-4 mb-8">
              No social links available
            </div>
            <Link 
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 text-sm font-bold transition-all px-4 py-2.5 rounded-full border-2 border-apex-primary text-apex-primary hover:bg-apex-primary hover:text-white"
            >
              Get Quote
              <span className={`${rtl.arrowRotate || ''}`}>→</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-apex-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className={`text-xs ${rtl.fontClass}`} style={{ opacity: 0.6 }}>
            © {year} Apex. {footer.rights}. {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
          </p>
          <div className="flex gap-4">
            <Link href={`/${lang}/privacy`} className="text-xs hover:text-apex-primary transition-colors">
              {footer.privacy}
            </Link>
            <Link href={`/${lang}/terms`} className="text-xs hover:text-apex-primary transition-colors">
              {footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

