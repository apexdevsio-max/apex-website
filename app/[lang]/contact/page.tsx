
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/ContactSection";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { buildPageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "تواصل معنا — APEX" : "Contact Us — APEX",
    description: isAr
      ? "تواصل مع فريق APEX عبر واتساب أو البريد الإلكتروني."
      : "Get in touch with the APEX team via WhatsApp or email.",
    path: `/${lang}/contact`,
  });
}

export default async function ContactPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam;
  const dictionary = await getDictionary(lang);

  return (
    <ContactSection
      lang={lang}
      dictionary={dictionary}
      email={socialLinks.email}
      whatsapp={socialLinks.whatsapp}
    />
  );
}
