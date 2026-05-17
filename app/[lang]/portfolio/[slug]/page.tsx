import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

import {
  getPortfolioItemBySlug,
  getPortfolioItems,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";
import {
  FALLBACK_PORTFOLIO,
  MOCK_PORTFOLIO,
  MOCK_PORTFOLIO_SLUGS,
} from "@/lib/mock/portfolio-data";

export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; slug: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const mdxItems = await getPortfolioItems(lang);

    for (const item of mdxItems) {
      const key = `${lang}:${item.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, slug: item.slug });
      }
    }

    for (const slug of MOCK_PORTFOLIO_SLUGS) {
      const key = `${lang}:${slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "ar";
  const mock = MOCK_PORTFOLIO[slug]?.[locale];
  let mdxItem = null;
  try {
    mdxItem = await getPortfolioItemBySlug(locale, slug);
  } catch {
    mdxItem = null;
  }

  return buildPageMeta(locale, {
    title: `${mdxItem?.title ?? mock?.title ?? slug} - APEX`,
    description: mdxItem?.summary ?? mock?.summary ?? "",
    path: `/${lang}/portfolio/${slug}`,
  });
}

const hoverStyles = `
  .apex-back-link:hover { color: var(--color-primary) !important; }
  .apex-tag-chip {
    background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    color: var(--color-primary);
    border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
  }
  .apex-btn-primary:hover { opacity: 0.92; transform: translateY(-2px); }
  .apex-btn-outline:hover { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
  .apex-result-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--color-border);
  }
  .apex-result-item:last-child { border-bottom: none; }
`;

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr = lang === "ar";
  let mdxItem = null;
  try {
    mdxItem = await getPortfolioItemBySlug(lang, slug);
  } catch {
    mdxItem = null;
  }
  const mock = MOCK_PORTFOLIO[slug];
  const mockContent = mock?.[lang];
  const fallback = FALLBACK_PORTFOLIO(slug, lang);

  if (!mdxItem && !mock) notFound();

  const title = mdxItem?.title ?? mockContent?.title ?? fallback.title;
  const summary = mdxItem?.summary ?? mockContent?.summary ?? fallback.summary;
  const description =
    mdxItem?.description ?? mockContent?.description ?? fallback.description;
  const emoji = mock?.emoji ?? fallback.emoji;
  const gradient = mock?.gradient ?? fallback.gradient;
  const accentColor = mock?.accentColor ?? fallback.accentColor;
  const tags = mock?.tags ?? fallback.tags;
  const category = mock?.category ?? fallback.category;
  const images = mdxItem?.images;
  const thumbnail = images?.[0] ?? mdxItem?.thumbnail;
  const driveUrl = mdxItem?.driveUrl;

  const lines = description.split("\n").filter((line) => line.trim() !== "");

  return (
    <div
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${"https://apex-tech.sa"}/${lang}` },
              { "@type": "ListItem", position: 2, name: isAr ? "أعمالنا" : "Portfolio", item: `${"https://apex-tech.sa"}/${lang}/portfolio` },
              { "@type": "ListItem", position: 3, name: title },
            ],
          }),
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${lang}/portfolio`}
          className={`apex-back-link inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${
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
          {isAr ? "العودة إلى الأعمال" : "Back to Portfolio"}
        </Link>

        <div
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height: "clamp(240px,30vw,380px)", background: gradient }}
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
              priority
            />
          ) : (
            <>
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
                  width: "300px",
                  height: "300px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle,${accentColor}35 0%,transparent 70%)`,
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontSize: "96px",
                  filter: "drop-shadow(0 0 30px rgba(255,255,255,0.35))",
                }}
              >
                {emoji}
              </div>
            </>
          )}
          <div
            className="absolute top-4 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left" : "right"]: "16px",
              background: `color-mix(in srgb,${accentColor} 18%,rgba(0,0,0,0.6))`,
              border: `1px solid ${accentColor}55`,
              color: accentColor,
              backdropFilter: "blur(8px)",
            }}
          >
            {category}
          </div>
        </div>

        <div className={`flex flex-wrap gap-2 mb-5 ${isAr ? "flex-row-reverse" : ""}`}>
          {tags.map((tag) => (
            <span key={tag} className="apex-tag-chip text-xs font-bold px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <h1
          className={`font-bold mb-4 leading-tight ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "clamp(24px,3.5vw,42px)", color: "var(--color-primary-text)" }}
        >
          {title}
        </h1>

        <p
          className={`text-lg mb-10 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {summary}
        </p>

        <div
          className="rounded-2xl border p-8 mb-12"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
        >
          {lines.map((line, index) => {
            const isBullet = line.startsWith("• ");
            const isResult = line.startsWith("النتيجة") || line.startsWith("Result");

            if (isResult) {
              return (
                <div
                  key={index}
                  className={`mt-6 pt-5 border-t ${isAr ? "font-ar" : "font-en"}`}
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <p className="font-bold" style={{ color: accentColor, fontSize: "15px" }}>
                    {line}
                  </p>
                </div>
              );
            }

            if (isBullet) {
              return (
                <div key={index} className="apex-result-item">
                  <span
                    className="mt-1 w-2 h-2 rounded-full shrink-0"
                    style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                  />
                  <span
                    className={`text-sm leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                    style={{ color: "var(--color-primary-text)" }}
                  >
                    {line.replace("• ", "")}
                  </span>
                </div>
              );
            }

            return (
              <p
                key={index}
                className={`mb-3 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                style={{ color: "var(--color-secondary-text)", fontSize: "15px" }}
              >
                {line}
              </p>
            );
          })}
        </div>

        {images && images.length > 1 && (
          <div className="mb-10">
            <h2
              className={`font-bold mb-5 ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "17px", color: "var(--color-primary-text)" }}
            >
              {isAr ? "معرض الصور" : "Gallery"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ aspectRatio: "16 / 9", background: "var(--color-card)" }}
                >
                  <Image
                    src={src}
                    alt={`${title} - ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {driveUrl && (
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 flex items-center justify-center gap-3 rounded-2xl border-2 p-5 transition-all hover:opacity-85"
            style={{
              borderColor: `color-mix(in srgb,${accentColor} 35%,transparent)`,
              background: `color-mix(in srgb,${accentColor} 8%,var(--color-card))`,
              color: accentColor,
            }}
          >
            <ExternalLink size={20} />
            <span className={`text-sm font-bold ${isAr ? "font-ar" : "font-en"}`}>
              {isAr ? "شاهد المشروع على Google Drive" : "View Project on Google Drive"}
            </span>
          </a>
        )}

        <div className={`flex flex-wrap gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
          <Link
            href={`/${lang}/contact`}
            className={`apex-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all ${
              isAr ? "font-ar" : "font-en"
            }`}
            style={{
              background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow: "0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)",
            }}
          >
            {isAr ? "ابدأ مشروعًا مشابهًا" : "Start a Similar Project"}
            <span
              style={{
                display: "inline-block",
                transform: isAr ? "rotate(180deg)" : "none",
              }}
            >
              →
            </span>
          </Link>

          <Link
            href={`/${lang}/portfolio`}
            className={`apex-btn-outline inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all border-2 ${
              isAr ? "font-ar" : "font-en"
            }`}
            style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
          >
            {isAr ? "عرض المزيد من الأعمال" : "More Projects"}
          </Link>
        </div>
      </div>
    </div>
  );
}
