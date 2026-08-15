import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getServiceBySlug, getServices } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildServiceSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/lib/seo/schema";
import { MOCK_SERVICES } from "@/lib/mock/services-data";
import { MarkdownContent } from "@/components/content/MarkdownContent";

// Only services backed by a real MDX file are prerendered. Prerendering
// MOCK_SERVICE_SLUGS too published `ecommerce` and `uiux-design` as indexable
// routes whose body rendered ~130 words of placeholder copy — against ~1,000 for
// a real service page. Thin pages at that ratio drag the whole site's quality
// signal down, so an unbacked slug now 404s until its MDX is written.
export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; service: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const services = await getServices(lang);

    for (const service of services) {
      const key = `${lang}:${service.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, service: service.slug });
      }
    }
  }

  return params;
}

// Without this, a slug dropped from generateStaticParams still renders on demand
// from MOCK_SERVICES — which would defeat the thin-page fix above.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; service: string }>;
}): Promise<Metadata> {
  const { lang, service: slug } = await params;
  const locale = toLocale(lang);
  let mdx = null;
  try {
    mdx = await getServiceBySlug(locale, slug);
  } catch (error) {
    // Content validation errors are recoverable here (the page falls back to
    // static metadata), but they describe real malformed content, so surface
    // them instead of failing silently.
    console.error("Content load failed:", error);
    mdx = null;
  }
  const mock = MOCK_SERVICES[slug]?.[locale];

  return buildPageMeta(locale, {
    title: mdx?.seoTitle ?? mdx?.title ?? mock?.title ?? slug,
    description: mdx?.summary ?? mock?.summary ?? "",
    keywords: mdx?.keywords,
    path: `/${lang}/services/${slug}`,
  });
}



export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; service: string }>;
}) {
  const { lang, service: slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr = lang === "ar";
  let mdxItem = null;
  try {
    mdxItem = await getServiceBySlug(lang, slug);
  } catch (error) {
    // Content validation errors are recoverable here (the page falls back to
    // static metadata), but they describe real malformed content, so surface
    // them instead of failing silently.
    console.error("Content load failed:", error);
    mdxItem = null;
  }
  const mock = MOCK_SERVICES[slug];
  if (!mdxItem && !mock) notFound();

  const mockContent = mock?.[lang];
  const title = mdxItem?.title ?? mockContent?.title ?? slug;
  const summary = mdxItem?.summary ?? mockContent?.summary ?? "";
  const description = mdxItem?.description ?? "";
  const ctaLabel =
    mdxItem?.ctaLabel ?? mockContent?.ctaLabel ?? (isAr ? "تواصل معنا" : "Contact Us");
  const emoji = mock?.emoji ?? "🚀";
  const accentColor = mock?.accentColor ?? "var(--color-primary)";
  const gradient = mock?.gradient ?? "linear-gradient(135deg,#0a0a0a,#1a1a2e)";
  const features = mockContent?.features ?? [];
  const process = mockContent?.process ?? [];
  const result = mockContent?.result ?? "";
  const body = mdxItem?.body ?? "";
  const faq = mdxItem?.faq ?? [];

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "خدماتنا" : "Services", url: `${siteUrl}/${lang}/services` },
    { name: title, url: `${siteUrl}/${lang}/services/${slug}` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildServiceSchema(slug, title, summary, lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      {faq.length > 0 && <JsonLd schema={buildFaqSchema(faq)} />}
      <div
        className="min-h-screen pt-24 pb-24 px-6"
        style={{ background: "var(--color-background)" }}
        dir={isAr ? "rtl" : "ltr"}
      >
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${lang}/services`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${
            isAr ? "font-ar flex-row-reverse" : "font-en"
          }`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span
            style={{
              display: "inline-block",
              transform: isAr ? "none" : "rotate(180deg)",
            }}
          >
            →
          </span>
          {isAr ? "العودة إلى الخدمات" : "Back to Services"}
        </Link>

        <div
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height: "clamp(200px,26vw,320px)", background: gradient }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "280px",
              height: "280px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle,${accentColor}32 0%,transparent 70%)`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: "88px", filter: "drop-shadow(0 0 28px rgba(255,255,255,0.32))" }}
          >
            {emoji}
          </div>
        </div>

        <h1
          className={`font-bold mb-4 leading-tight ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "clamp(24px,3.5vw,42px)", color: "var(--color-primary-text)" }}
        >
          {title}
        </h1>

        <p
          className={`text-lg mb-10 leading-relaxed pb-8 border-b ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)", borderColor: "var(--color-border)" }}
        >
          {summary}
        </p>

        {description && (
          <div
            className={`rounded-2xl border p-8 mb-10 leading-loose whitespace-pre-line ${
              isAr ? "font-ar" : "font-en"
            }`}
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-primary-text)",
              fontSize: "15px",
            }}
          >
            {description}
          </div>
        )}

        {/* The long-form body carries the substance search engines rank on. It is
            markdown rather than the plain-text `description` above, so it renders
            through the shared prose renderer used by the blog. */}
        {body && (
          <article className="mb-14">
            <MarkdownContent source={body} lang={lang} />
          </article>
        )}

        {(features.length > 0 || process.length > 0) && (
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {features.length > 0 && (
              <div>
                <h2
                  className={`font-bold mb-5 ${isAr ? "font-ar" : "font-en"}`}
                  style={{ fontSize: "17px", color: "var(--color-primary-text)" }}
                >
                  {isAr ? "ما تشمله الخدمة" : "What's Included"}
                </h2>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="apex-feature flex items-center gap-3 p-3 rounded-xl border"
                      style={{
                        background: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        flexDirection: isAr ? "row-reverse" : "row",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                      />
                      <span
                        className={`text-sm ${isAr ? "font-ar" : "font-en"}`}
                        style={{ color: "var(--color-primary-text)" }}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {process.length > 0 && (
              <div>
                <h2
                  className={`font-bold mb-5 ${isAr ? "font-ar" : "font-en"}`}
                  style={{ fontSize: "17px", color: "var(--color-primary-text)" }}
                >
                  {isAr ? "كيف نعمل؟" : "Our Process"}
                </h2>
                <div className="space-y-3">
                  {process.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3"
                      style={{ flexDirection: isAr ? "row-reverse" : "row" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{
                          background: `color-mix(in srgb,${accentColor} 16%,transparent)`,
                          color: accentColor,
                          border: `1px solid ${accentColor}35`,
                        }}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`text-sm leading-relaxed pt-0.5 ${isAr ? "font-ar" : "font-en"}`}
                        style={{ color: "var(--color-primary-text)" }}
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div
            className="rounded-2xl p-7 mb-10 border"
            style={{
              background: `color-mix(in srgb,${accentColor} 7%,var(--color-card))`,
              borderColor: `${accentColor}40`,
            }}
          >
            <div
              className="flex items-start gap-4"
              style={{ flexDirection: isAr ? "row-reverse" : "row" }}
            >
              <span className="text-3xl shrink-0">🏆</span>
              <div style={{ textAlign: isAr ? "right" : "left" }}>
                <p
                  className={`font-bold mb-1 ${isAr ? "font-ar" : "font-en"}`}
                  style={{ color: accentColor, fontSize: "14px" }}
                >
                  {isAr ? "النتائج المتوقعة" : "Expected Results"}
                </p>
                <p
                  className={`text-sm leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                  style={{ color: "var(--color-primary-text)" }}
                >
                  {result}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rendered from the same `faq` array that feeds the FAQPage JSON-LD above,
            so the markup and the visible content can never disagree. */}
        {faq.length > 0 && (
          <section className="mb-12">
            <h2
              className={`font-bold mb-6 ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "clamp(20px,2.6vw,28px)", color: "var(--color-primary-text)" }}
            >
              {isAr ? "أسئلة شائعة" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-3">
              {faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border overflow-hidden"
                  style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
                >
                  <summary
                    className={`cursor-pointer list-none p-5 font-bold flex items-center justify-between gap-4 ${
                      isAr ? "font-ar" : "font-en"
                    }`}
                    style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
                  >
                    <span>{item.question}</span>
                    <span aria-hidden="true" style={{ color: accentColor }}>
                      +
                    </span>
                  </summary>
                  <p
                    className={`px-5 pb-5 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                    style={{ fontSize: "14px", color: "var(--color-secondary-text)" }}
                  >
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className={`flex flex-wrap gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
          <Link
            href={`/${lang}/contact`}
            className="apex-cta-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all"
            style={{
              background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow: "0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)",
            }}
          >
            {ctaLabel}
            <span style={{ display: "inline-block", transform: isAr ? "rotate(180deg)" : "none" }}>
              →
            </span>
          </Link>

          <Link
            href={`/${lang}/services`}
            className="apex-btn-outline inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all border-2"
            style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
          >
            {isAr ? "خدمات أخرى" : "Other Services"}
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
