import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { getDictionary } from "@/lib/i18n/i18n";
import { getServices } from "@/lib/content/content-loader";
import { isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "خدماتنا — APEX" : "Our Services — APEX",
    description: isAr
      ? "نقدم حلولاً رقمية متكاملة: تطوير ويب، تطبيقات موبايل، ذكاء اصطناعي، تصميم UI/UX، متاجر إلكترونية، وصناعة محتوى."
      : "We offer integrated digital solutions: web development, mobile apps, AI, UI/UX design, e-commerce, and content creation.",
    path: `/${lang}/services`,
  });
}

export default async function ServicesPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam;
  const dictionary = await getDictionary(lang);
  const mdxItems = await getServices(lang);

  return (
    <ServicesGrid
      lang={lang}
      dictionary={dictionary}
      mdxItems={mdxItems}
    />
  );
}
