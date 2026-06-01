import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { getDictionary } from "@/lib/i18n/i18n";
import { getServices } from "@/lib/content/content-loader";
import { isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildServiceCollectionSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/metadata";

const ServicesGrid = dynamic(
  () => import("@/components/sections/ServicesGrid").then((m) => m.ServicesGrid),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-screen pt-28 pb-24 px-6" style={{ background: "var(--color-background)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="h-4 w-24 mx-auto mb-4 rounded-full animate-pulse" style={{ background: "var(--color-border)" }} />
            <div className="h-10 w-48 mx-auto rounded animate-pulse" style={{ background: "var(--color-border)" }} />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: "var(--color-border)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

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

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);
  const mdxItems = await getServices(lang);
  const isAr = lang === "ar";

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "خدماتنا" : "Services", url: `${siteUrl}/${lang}/services` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <JsonLd schema={buildServiceCollectionSchema(mdxItems, lang)} />

      <ServicesGrid
        lang={lang}
        dictionary={dictionary}
        mdxItems={mdxItems}
      />
    </>
  );
}
