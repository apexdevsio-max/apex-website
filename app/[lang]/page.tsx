import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("@/components/sections/HeroSection").then((m) => m.HeroSection),
  { ssr: true }
);
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildServiceSchema,
} from "@/lib/seo/schema";
import { MOCK_SERVICES, MOCK_SERVICE_SLUGS } from "@/lib/mock/services-data";

const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection").then((m) => m.AboutSection),
  { ssr: true }
);

const ServicesSection = dynamic(
  () => import("@/components/sections/ServicesSection").then((m) => m.ServicesSection),
  { ssr: true }
);

const PortfolioPreview = dynamic(
  () => import("@/components/sections/PortfolioPreview").then((m) => m.PortfolioPreview),
  { ssr: true }
);

const Testimonials = dynamic(
  () => import("@/components/sections/Testimonials").then((m) => m.Testimonials),
  { ssr: true }
);

const ContactSection = dynamic(
  () => import("@/components/sections/ContactSection").then((m) => m.ContactSection),
  { ssr: true }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata(lang === "ar" ? "ar" : "en");
}

type Props = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: Props) {
  const { lang: langParam } = await params;

  if (!isLocale(langParam)) notFound();

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);

  const serviceSchemas = MOCK_SERVICE_SLUGS.map((slug) => {
    const service = MOCK_SERVICES[slug];
    const content = service[lang];
    return buildServiceSchema(slug, content.title, content.summary, lang);
  });

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildWebSiteSchema()} />
      {serviceSchemas.map((schema) => (
        <JsonLd key={schema.url as string} schema={schema} />
      ))}

      <HeroSection lang={lang} dictionary={dictionary} />
      <AboutSection lang={lang} dictionary={dictionary} />
      <ServicesSection lang={lang} dictionary={dictionary} />
      <PortfolioPreview lang={lang} dictionary={dictionary} />
      <Testimonials lang={lang} dictionary={dictionary} />
      <ContactSection
        lang={lang}
        dictionary={dictionary}
        email={socialLinks.email}
        whatsapp={socialLinks.whatsapp}
      />
    </>
  );
}
