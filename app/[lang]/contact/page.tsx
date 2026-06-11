import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/ContactSection";
import { ContactForm } from "@/components/contact/ContactForm";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang as "en" | "ar", {
    title: isAr ? "تواصل معنا — APEX" : "Contact Us — APEX",
    description: isAr
      ? "تواصل مع فريق APEX عبر نموذج تواصل ذكي أو واتساب أو البريد الإلكتروني."
      : "Get in touch with the APEX team via our smart form, WhatsApp, or email.",
    path: `/${lang}/contact`,
  });
}

export default async function ContactPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);
  const isAr = lang === "ar";

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "تواصل معنا" : "Contact Us", url: `${siteUrl}/${lang}/contact` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildLocalBusinessSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <ContactSection
        lang={lang}
        dictionary={dictionary}
        whatsapp={socialLinks.whatsapp}
      />
      <section
        className="relative py-16 md:py-24 px-6"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto">
          <ContactForm lang={lang} dictionary={dictionary} />
        </div>
      </section>
    </>
  );
}
