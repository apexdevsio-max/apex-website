// file: app/[lang]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactSection } from "@/components/sections/ContactSection";

import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";

  return {
    title: isAr
      ? "APEX — شركة برمجيات | تطبيقات، ويب، ذكاء اصطناعي"
      : "APEX — Software Company | Apps, Web & AI Solutions",
    description: isAr
      ? "شركة APEX للبرمجيات — نبني تطبيقات موبايل، مواقع ويب، حلول ذكاء اصطناعي، ومتاجر إلكترونية. شريكك التقني الإقليمي."
      : "APEX Software Company — we build mobile apps, websites, AI solutions, and e-commerce platforms. Your regional tech partner.",
    keywords: isAr
      ? [
          "برمجة",
          "تطبيق",
          "مبرمج",
          "شركة برمجيات",
          "ذكاء اصطناعي",
          "AI",
          "متجر إلكتروني",
          "SEO",
          "صناعة محتوى",
          "APEX",
        ]
      : [
          "APEX",
          "software company",
          "mobile app",
          "web development",
          "AI",
          "e-commerce",
          "SEO",
          "content creation",
        ],
    alternates: {
      canonical: `https://apex-tech.sa/${lang}`,
      languages: { ar: "https://apex-tech.sa/ar", en: "https://apex-tech.sa/en" },
    },
    openGraph: {
      title: isAr ? "APEX — قمة التميز التقني" : "APEX — Peak Technical Excellence",
      description: isAr
        ? "حلول رقمية متكاملة: تطبيقات، ويب، AI، متاجر إلكترونية."
        : "Integrated digital solutions: apps, web, AI, e-commerce.",
      url: `https://apex-tech.sa/${lang}`,
      siteName: "APEX",
      locale: isAr ? "ar_SA" : "en_US",
      type: "website",
      images: [
        {
          url: "/images/Apex_logo.png",
          width: 1200,
          height: 630,
          alt: "APEX",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isAr ? "APEX — شركة برمجيات" : "APEX — Software Company",
      description: isAr ? "تطبيقات · ويب · AI · متاجر" : "Apps · Web · AI · E-Commerce",
      images: ["/images/Apex_logo.png"],
    },
  };
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
            url: "https://apex-tech.sa",
            logo: "https://apex-tech.sa/images/Apex_logo.png",
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
