import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

import { socialLinks } from "@/data/social-links";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Home contact block. A server component with real links: the email used to be a
 * button that set window.location, so the address was never visible or copyable.
 * The always-on "available now, within 2 hours" badge contradicted the contact
 * page's one-business-day promise and is gone.
 */
export function ContactSection({ lang, copy }: { lang: Locale; copy: Dictionary["contact"] }) {
  const whatsappDigits = socialLinks.whatsapp.replace(/[^\d]/g, "");
  return (
    <section id="contact" className="apex-section">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-apex-border bg-apex-card p-6 sm:p-10 md:grid-cols-2 md:p-14">
        <div>
          <p className="apex-eyebrow">{copy.badge}</p>
          <h2 className="apex-section-title">{copy.title}</h2>
          <p className="apex-section-subtitle mt-4">{copy.description}</p>
        </div>
        <div className="flex flex-col gap-3 self-center">
          <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="apex-btn-whatsapp min-h-[56px] justify-start px-6 text-base">
            <MessageCircle size={20} aria-hidden="true" />
            <span>{copy.whatsapp}</span>
            <span dir="ltr" className="ms-auto font-normal opacity-90">{socialLinks.whatsapp}</span>
          </a>
          <a href={`mailto:${socialLinks.email}`} className="apex-btn-outline min-h-[56px] justify-start px-6 text-base">
            <Mail size={20} aria-hidden="true" />
            <span>{copy.email}</span>
            <span dir="ltr" className="ms-auto truncate font-normal">{socialLinks.email}</span>
          </a>
          <Link href={`/${lang}/contact`} className="apex-btn-primary min-h-[56px] text-base">
            {copy.formLink}
          </Link>
        </div>
      </div>
    </section>
  );
}
