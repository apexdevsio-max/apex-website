import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AboutSection } from "@/components/sections/AboutSection";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";
import { JsonLd, buildOrganizationSchema } from "@/lib/seo/schema";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "من نحن — APEX" : "About Us — APEX",
    description: isAr
      ? "شركة APEX للبرمجيات تبني حلولاً رقمية متكاملة. تعرف على رؤيتنا وفريقنا وقيمنا."
      : "APEX is a software company building integrated digital solutions. Learn about our vision, team, and values.",
    path: `/${lang}/about`,
  });
}

export default async function AboutPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <AboutSection lang={lang} dictionary={dictionary} />
    </>
  );
}
