import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildServiceSchema,
} from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBlogPosts, getPortfolioItems, getServices } from "@/lib/content/content-loader";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { WhyApex } from "@/components/sections/WhyApex";
import { ContactSection } from "@/components/sections/ContactSection";
import { LatestGuides } from "@/components/sections/LatestGuides";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata(toLocale(lang));
}

type Props = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dictionary, services, projects, posts] = await Promise.all([
    getDictionary(lang),
    getServices(lang),
    getPortfolioItems(lang),
    getBlogPosts(lang),
  ]);

  // Built from the real service pages, so every Service node points at a URL
  // that exists. It used to come from mock data and named two services that 404.
  const serviceSchemas = services.map((service) =>
    buildServiceSchema(service.slug, service.title, service.summary, lang)
  );

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildWebSiteSchema()} />
      {serviceSchemas.map((schema) => (
        <JsonLd key={schema.url as string} schema={schema} />
      ))}

      <HeroSection lang={lang} hero={dictionary.heroSection} />
      <ServicesSection lang={lang} copy={dictionary.services} services={services} />
      <PortfolioPreview lang={lang} copy={dictionary.portfolio} />
      <AboutSection
        lang={lang}
        about={dictionary.about}
        counts={{ projects: projects.length, services: services.length, articles: posts.length }}
      />
      <WhyApex copy={dictionary.whyApex} />
      <LatestGuides lang={lang} posts={posts.slice(0, 3)} />
      <ContactSection lang={lang} copy={dictionary.contact} />
    </>
  );
}
