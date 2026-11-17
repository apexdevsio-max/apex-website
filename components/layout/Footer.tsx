import Link from "next/link";
import Image from "next/image";

import { ConsentSettingsButton } from "@/components/analytics/ConsentSettingsButton";
import { navigationItems } from "@/data/navigation";
import { socialLinks } from "@/data/social-links";
import { getServices } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

const linkClass = "text-sm transition-colors hover:text-apex-primary flex items-center min-h-[44px]";

export async function Footer({ lang, dictionary }: { lang: Locale; dictionary: Dictionary }) {
  const { footer, navigation } = dictionary;
  const isAr = lang === "ar";
  const services = await getServices(lang);
  const whatsappDigits = socialLinks.whatsapp.replace(/[^\d]/g, "");

  // Statically generated, so this is the build year; it refreshes on the next deploy.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-apex-border bg-apex-bg py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-4">
            <Link href={`/${lang}`} className="inline-flex w-fit">
              <Image
                src="/images/Apex_logo.png"
                alt={isAr ? "أبيكس — الصفحة الرئيسية" : "APEX — home"}
                width={120}
                height={44}
                sizes="120px"
              />
            </Link>
            <p className="text-sm leading-relaxed text-apex-muted">{footer.description}</p>
            <p className="text-sm leading-relaxed text-apex-muted">{footer.location}</p>
          </div>

          <nav aria-label={footer.quickLinks}>
            <h2 className="apex-footer-heading">{footer.quickLinks}</h2>
            <ul>
              {navigationItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.path === "/" ? `/${lang}` : `/${lang}/${item.path}`} className={linkClass}>
                    {navigation[item.key]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/${lang}/about`} className={linkClass}>
                  {navigation.about}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={footer.servicesHeading}>
            <h2 className="apex-footer-heading">{footer.servicesHeading}</h2>
            <ul>
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/${lang}/services/${service.slug}`} className={linkClass}>
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="apex-footer-heading">{footer.quickContact}</h2>
            <ul>
              <li>
                <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp: <span dir="ltr" className="ms-1">{socialLinks.whatsapp}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${socialLinks.email}`} className={linkClass}>
                  {footer.emailLabel}: <span dir="ltr" className="ms-1">{socialLinks.email}</span>
                </a>
              </li>
            </ul>
            <Link href={`/${lang}/contact`} className="apex-btn-outline mt-4">
              {navigation.letsTalk}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-apex-border pt-8 md:flex-row">
          <p className="text-sm text-apex-muted">
            © {year} APEX. {footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-6">
            <Link href={`/${lang}/privacy`} className={linkClass}>
              {footer.privacy}
            </Link>
            <Link href={`/${lang}/terms`} className={linkClass}>
              {footer.terms}
            </Link>
            <ConsentSettingsButton label={footer.privacySettings} />
          </div>
        </div>
      </div>
    </footer>
  );
}
