
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getDictionary } from "@/lib/i18n/i18n";
import { getServices }   from "@/lib/content/content-loader";
import { isLocale }      from "@/lib/i18n/locale";
import { ServicesGrid }  from "@/components/sections/ServicesGrid";
import { buildPageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "الخدمات — APEX" : "Services — APEX",
    description: isAr
      ? "خدمات APEX للبرمجيات: تطبيقات موبايل، مواقع ويب، حلول AI، وتصميم UI/UX."
      : "APEX services: mobile apps, web development, AI solutions, and UI/UX design.",
    path: `/${lang}/services`,
  });
}

export default async function ServicesPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const dictionary = await getDictionary(lang);
  const mdxItems   = await getServices(lang);

  return <ServicesGrid lang={lang} dictionary={dictionary} mdxItems={mdxItems} />;
}
