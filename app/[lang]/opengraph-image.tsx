import { notFound } from "next/navigation";

import { isLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const isAr = lang === "ar";
  return renderOgCard({
    locale: lang,
    eyebrow: isAr ? "تطبيقات · ويب · ذكاء اصطناعي" : "Apps · Web · AI",
    title: isAr
      ? "نبني تطبيقات ومواقع وحلول ذكاء اصطناعي لعملاء السعودية والإمارات وقطر"
      : "Apps, websites and AI systems for businesses in Saudi Arabia, the UAE and Qatar",
  });
}
