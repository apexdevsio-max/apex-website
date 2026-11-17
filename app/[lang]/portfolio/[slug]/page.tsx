import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

import { getPortfolioItemBySlug, getPortfolioItems } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildCreativeWorkSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ProjectCard } from "@/components/content/ProjectCard";
import { PROJECT_CATEGORY_LABELS } from "@/lib/content/project-style";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const params = await Promise.all(
    SUPPORTED_LOCALES.map(async (lang) => (await getPortfolioItems(lang)).map((item) => ({ lang, slug: item.slug })))
  );
  return params.flat();
}

export const dynamicParams = false;

/** The service each kind of project demonstrates, for the closing call to action. */
const SERVICE_FOR = { app: "mobile-apps", "ai-content": "ai-solutions", video: "content-creation" } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const item = await getPortfolioItemBySlug(lang, slug);
  if (!item) return {};
  return buildPageMeta(lang, {
    title: item.title,
    description: item.summary,
    path: `/${lang}/portfolio/${slug}`,
    image: { url: `${siteUrl}${item.cover}` },
  });
}

export default async function PortfolioItemPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [item, all] = await Promise.all([getPortfolioItemBySlug(lang, slug), getPortfolioItems(lang)]);
  if (!item) notFound();

  const isAr = lang === "ar";
  const url = `${siteUrl}/${lang}/portfolio/${slug}`;
  const gallery = (item.images ?? []).filter((src) => src !== item.cover);
  const isPortraitGallery = item.category === "app";
  const more = all.filter((other) => other.slug !== slug && other.category === item.category).slice(0, 3);

  const trail = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "أعمالنا" : "Portfolio", url: `${siteUrl}/${lang}/portfolio` },
    { name: item.title, url },
  ];

  return (
    <div className="px-6 pt-8 pb-20">
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(trail)} />
      <JsonLd schema={buildCreativeWorkSchema({ title: item.title, summary: item.summary, url, image: item.cover, lang, dateModified: item.dateModified })} />

      <div className="mx-auto max-w-5xl">
        <Breadcrumbs
          label={isAr ? "مسار التنقل" : "Breadcrumb"}
          items={trail.map((entry, index) => ({ name: entry.name, href: index < trail.length - 1 ? entry.url.replace(siteUrl, "") : undefined }))}
        />

        <header className="mb-8 max-w-3xl">
          <p className="apex-cat-label mb-3">{PROJECT_CATEGORY_LABELS[item.category][lang]}</p>
          <h1 className="apex-page-title">{item.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-apex-muted">{item.summary}</p>
        </header>

        {/* Shown whole: portrait stills sit over a blurred copy of themselves. */}
        <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-3xl border border-apex-border bg-apex-card">
          <Image src={item.cover} alt="" fill aria-hidden="true" className="scale-110 object-cover opacity-50 blur-2xl" sizes="300px" quality={40} />
          <Image
            src={item.cover}
            alt={item.title}
            fill
            preload
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>

        <article className="apex-prose max-w-[72ch]">
          <MarkdownContent source={item.description} lang={lang} />
        </article>

        {gallery.length > 0 && (
          <section aria-labelledby="gallery" className="mt-14">
            <h2 id="gallery" className="apex-section-title mb-6">
              {isAr ? "من التنفيذ" : "From the project"}
            </h2>
            <ul className={`grid gap-4 ${isPortraitGallery ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {gallery.map((src, index) => (
                <li key={src}>
                  {/* Opens the full-size image, so phone screenshots can be read. */}
                  <a href={src} target="_blank" rel="noopener" className="block overflow-hidden rounded-2xl border border-apex-border hover:border-apex-primary">
                    <Image
                      src={src}
                      alt={isAr ? `${item.title} — صورة ${index + 1}` : `${item.title} — image ${index + 1}`}
                      width={isPortraitGallery ? 590 : 1080}
                      height={isPortraitGallery ? 1280 : 1080}
                      className="h-auto w-full"
                      sizes={isPortraitGallery ? "(max-width: 640px) 50vw, 320px" : "(max-width: 640px) 100vw, 480px"}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <aside className="mt-14 flex flex-col gap-4 rounded-2xl border border-apex-border bg-apex-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-lg font-bold text-apex-text">{isAr ? "تريد عملاً مشابهاً؟" : "Want something similar?"}</p>
            {item.driveUrl && (
              <a href={item.driveUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-[44px] items-center gap-2 text-apex-primary underline underline-offset-4">
                {isAr ? "مشاهدة الملفات الكاملة على Google Drive" : "View the full files on Google Drive"}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${lang}/services/${SERVICE_FOR[item.category]}`} className="apex-btn-outline">
              {isAr ? "تفاصيل الخدمة" : "About this service"}
            </Link>
            <Link href={`/${lang}/contact`} className="apex-btn-primary">
              {isAr ? "تواصل معنا" : "Get in touch"}
            </Link>
          </div>
        </aside>

        {more.length > 0 && (
          <section aria-labelledby="more-work" className="mt-16">
            <h2 id="more-work" className="apex-section-title mb-6">
              {isAr ? "أعمال أخرى من النوع نفسه" : "More work like this"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((project) => (
                <ProjectCard key={project.slug} project={project} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
