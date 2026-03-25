
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getDictionary }     from "@/lib/i18n/i18n";
import { getPortfolioItems } from "@/lib/content/content-loader";
import { isLocale }          from "@/lib/i18n/locale";
import { PortfolioGrid }     from "@/components/sections/PortfolioGrid";
import { buildPageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "أعمالنا — APEX" : "Portfolio — APEX",
    description: isAr
      ? "أعمال ومشاريع APEX في الويب، الموبايل، والذكاء الاصطناعي."
      : "APEX portfolio across web, mobile, and AI projects.",
    path: `/${lang}/portfolio`,
  });
}

export default async function PortfolioPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const dictionary = await getDictionary(lang);
  const mdxItems   = await getPortfolioItems(lang);

  return (
    <PortfolioGrid
      lang={lang}
      dictionary={dictionary}
      mdxItems={mdxItems}
    />
  );
}
