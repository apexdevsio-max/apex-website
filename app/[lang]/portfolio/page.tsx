import Link from "next/link";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { PROJECT_CATEGORIES, getPortfolioItems } from "@/lib/content/content-loader";
import { isLocale, toLocale }          from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  buildOrganizationSchema,
  buildPortfolioCollectionSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "@/components/content/ProjectCard";
import { PROJECT_CATEGORY_LABELS } from "@/lib/content/project-style";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "أعمالنا — تطبيقات ومحتوى مرئي" : "Our Work — Apps and Visual Content",
    description: isAr
      ? "مشاريع APEX الموثّقة: تطبيق تعليمي مبني بـ Flutter، ومحتوى مولّد بالذكاء الاصطناعي، وفيديوهات تسويقية وموشن جرافيك، مع صور من التنفيذ الفعلي."
      : "APEX's documented projects: an education app built in Flutter, AI-generated content, and marketing and motion video, with screenshots from the actual work.",
    path: `/${lang}/portfolio`,
  });
}

export default async function PortfolioPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const items = await getPortfolioItems(lang);
  const isAr = lang === "ar";

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "أعمالنا" : "Portfolio", url: `${siteUrl}/${lang}/portfolio` },
  ];

  // Grouped by the category each project declares. The old filter guessed it from
  // English keywords in the description, so three of five filters were empty and
  // the Arabic page labelled clinic videos as web development.
  const groups = PROJECT_CATEGORIES.map((category) => ({
    category,
    projects: items.filter((item) => item.category === category),
  })).filter((group) => group.projects.length > 0);

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <JsonLd schema={buildPortfolioCollectionSchema(items, lang)} />
      <div className="px-6 pt-10 pb-20 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            as="h1"
            title={isAr ? "أعمالنا" : "Our work"}
            subtitle={
              isAr
                ? `${items.length} مشاريع موثّقة: تطبيق تعليمي مبني بـ Flutter، ومحتوى مولّد بالذكاء الاصطناعي، وفيديوهات تسويقية وموشن جرافيك.`
                : `${items.length} documented projects: an education app built in Flutter, AI-generated content, and marketing and motion video.`
            }
          />
          <nav aria-label={isAr ? "أقسام الأعمال" : "Work categories"} className="apex-rail mb-12 flex gap-2 overflow-x-auto">
            {groups.map((group) => (
              <a key={group.category} href={`#${group.category}`} className="apex-chip">
                {PROJECT_CATEGORY_LABELS[group.category][lang]} ({group.projects.length})
              </a>
            ))}
          </nav>
          {groups.map((group) => (
            <section key={group.category} id={group.category} aria-labelledby={`${group.category}-title`} className="mb-16 scroll-mt-28">
              <h2 id={`${group.category}-title`} className="apex-section-title mb-6">
                {PROJECT_CATEGORY_LABELS[group.category][lang]}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.projects.map((project) => (
                  <ProjectCard key={project.slug} project={project} lang={lang} />
                ))}
              </div>
            </section>
          ))}
          <aside className="flex flex-col gap-4 rounded-2xl border border-apex-border bg-apex-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <p className="text-lg font-bold text-apex-text">
              {isAr ? "لديك مشروع مشابه؟ أرسل لنا وصفاً قصيراً." : "Have a similar project? Send us a short description."}
            </p>
            <Link href={`/${lang}/contact`} className="apex-btn-primary shrink-0">
              {isAr ? "تواصل معنا" : "Get in touch"}
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
