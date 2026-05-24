import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { HeroSection } from "@/components/sections/HeroSection";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { buildPageMetadata, siteUrl } from "@/lib/seo/metadata";

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

  const lang = langParam;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "APEX",
            url: siteUrl,
            logo: `${siteUrl}/images/Apex_logo.png`,
            sameAs: [
              socialLinks.instagram ?? "",
              socialLinks.linkedin ?? "",
              socialLinks.twitter ?? "",
            ].filter(Boolean),
            contactPoint: {
              "@type": "ContactPoint",
              telephone: socialLinks.whatsapp,
              contactType: "customer support",
              availableLanguage: ["Arabic", "English"],
            },
          }),
        }}
      />

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
