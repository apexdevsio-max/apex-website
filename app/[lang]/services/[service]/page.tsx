import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getServiceBySlug, getServices } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";
import { MOCK_SERVICES, MOCK_SERVICE_SLUGS } from "@/lib/mock/services-data";

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

    for (const slug of MOCK_SERVICE_SLUGS) {
      const key = `${lang}:${slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, service: slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; service: string }>;
}): Promise<Metadata> {
  const { lang, service: slug } = await params;
  const locale = isLocale(lang) ? lang : "ar";
  let mdx = null;
  try {
    mdx = await getServiceBySlug(locale, slug);
  } catch {
    mdx = null;
  }
  const mock = MOCK_SERVICES[slug]?.[locale];

  return buildPageMeta(locale, {
    title: `${mdx?.title ?? mock?.title ?? slug} - APEX`,
    description: mdx?.summary ?? mock?.summary ?? "",
    path: `/${lang}/services/${slug}`,
  });
}

const hoverStyles = `
  .apex-back:hover { color: var(--color-primary) !important; }
  .apex-feature { transition: border-color 0.2s ease, background 0.2s ease; }
  .apex-cta-btn:hover { opacity: 0.92; transform: translateY(-2px); }
  .apex-btn-outline:hover { background: color-mix(in srgb,var(--color-primary) 10%,transparent); }
`;

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
  } catch {
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

  return (
    <main
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
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
    </main>
  );
}
