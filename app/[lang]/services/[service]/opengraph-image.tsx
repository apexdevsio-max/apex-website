import { notFound } from "next/navigation";

import { getServiceBySlug, getServices } from "@/lib/content/content-loader";
import { isLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    SUPPORTED_LOCALES.map(async (lang) =>
      (await getServices(lang)).map((service) => ({ lang, service: service.slug }))
    )
  );
  return params.flat();
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; service: string }>;
}) {
  const { lang, service: slug } = await params;
  if (!isLocale(lang)) notFound();

  // The title used to fall back to the raw URL segment, so any path rendered
  // attacker-chosen text under the brand. Unknown slugs now 404.
  const service = await getServiceBySlug(lang, slug);
  if (!service) notFound();

  return renderOgCard({
    locale: lang,
    eyebrow: lang === "ar" ? "خدماتنا" : "Services",
    title: service.title,
  });
}
