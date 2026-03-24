// file: app/[lang]/services/page.tsx
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getDictionary } from "@/lib/i18n/i18n";
import { getServices }   from "@/lib/content/content-loader";
import { isLocale }      from "@/lib/i18n/locale";
import { ServicesGrid }  from "@/components/sections/ServicesGrid";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return {
    title: isAr ? "خدماتنا — APEX" : "Our Services — APEX",
    description: isAr
      ? "خدمات APEX: تطوير ويب، تطبيقات موبايل، ذكاء اصطناعي، تصميم UI/UX، متاجر إلكترونية، صناعة محتوى."
      : "APEX services: web development, mobile apps, AI, UI/UX design, e-commerce, content creation.",
  };
}

export default async function ServicesPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const dictionary = await getDictionary(lang);
  const mdxItems   = await getServices(lang);

  return <ServicesGrid lang={lang} dictionary={dictionary} mdxItems={mdxItems} />;
}