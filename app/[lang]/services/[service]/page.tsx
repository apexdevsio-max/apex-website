import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, MessageCircle } from "lucide-react";

import { getBlogPosts, getPortfolioItems, getServiceBySlug, getServices, type ProjectCategory } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildServiceSchema, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { PostCard } from "@/components/content/PostCard";
import { ProjectCard } from "@/components/content/ProjectCard";
import { buildBlogCards } from "@/lib/content/blog-view";
import { ServiceIcon } from "@/lib/content/service-style";
import { socialLinks } from "@/data/social-links";

type Props = { params: Promise<{ lang: string; service: string }> };

export async function generateStaticParams() {
  const params = await Promise.all(
    SUPPORTED_LOCALES.map(async (lang) => (await getServices(lang)).map((service) => ({ lang, service: service.slug })))
  );
  return params.flat();
}

export const dynamicParams = false;

/** Portfolio work that demonstrates each service. Web development has none yet. */
const RELATED_WORK: Record<string, ProjectCategory[]> = {
  "mobile-apps": ["app"],
  "ai-solutions": ["ai-content"],
  "content-creation": ["video", "ai-content"],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, service: slug } = await params;
  if (!isLocale(lang)) return {};
  const service = await getServiceBySlug(lang, slug);
  if (!service) return {};
  return buildPageMeta(lang, {
    title: service.seoTitle ?? service.title,
    description: service.summary,
    keywords: service.keywords,
    path: `/${lang}/services/${slug}`,
    imageFallback: `${siteUrl}/${lang}/services/${slug}/opengraph-image`,
  });
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { lang, service: slug } = await params;
  if (!isLocale(lang)) notFound();

  const [service, posts, projects] = await Promise.all([getServiceBySlug(lang, slug), getBlogPosts(lang), getPortfolioItems(lang)]);
  if (!service) notFound();

  const isAr = lang === "ar";
  const whatsappDigits = socialLinks.whatsapp.replace(/[^\d]/g, "");

  // Guides that already point readers at this service, newest first. Links used
  // to run one way only: 60 articles linked to services, no service linked back.
  const guides = buildBlogCards(posts.filter((post) => post.content.includes(`/services/${slug}`)).slice(0, 3));
  const work = projects.filter((project) => RELATED_WORK[slug]?.includes(project.category)).slice(0, 3);

  const trail = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "خدماتنا" : "Services", url: `${siteUrl}/${lang}/services` },
    { name: service.title, url: `${siteUrl}/${lang}/services/${slug}` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildServiceSchema(slug, service.title, service.summary, lang)} />
      <JsonLd schema={buildBreadcrumbSchema(trail)} />
      {service.faq.length > 0 && <JsonLd schema={buildFaqSchema(service.faq)} />}

      <div className="px-6 pt-8 pb-20">
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs
            label={isAr ? "مسار التنقل" : "Breadcrumb"}
            items={trail.map((item, index) => ({ name: item.name, href: index < trail.length - 1 ? item.url.replace(siteUrl, "") : undefined }))}
          />

          <header className="mb-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <div className="max-w-3xl">
              <h1 className="apex-page-title">{service.title}</h1>
              <p className="mt-4 text-lg leading-relaxed text-apex-muted">{service.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/${lang}/contact`} className="apex-btn-primary">
                  {service.ctaLabel}
                </Link>
                <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="apex-btn-whatsapp">
                  <MessageCircle size={16} aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
            <span aria-hidden="true" className="apex-icon-tile apex-icon-tile-lg hidden md:flex">
              <ServiceIcon slug={slug} size={56} strokeWidth={1.4} />
            </span>
          </header>

          <div className="grid gap-10 lg:grid-cols-2">
            <section aria-labelledby="included" className="rounded-2xl border border-apex-border bg-apex-card p-6 md:p-8">
              <h2 id="included" className="mb-5 text-xl font-bold text-apex-text">
                {isAr ? "ما الذي تشمله الخدمة" : "What's included"}
              </h2>
              <ul className="grid gap-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-base text-apex-text">
                    <Check size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-apex-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="process" className="rounded-2xl border border-apex-border p-6 md:p-8">
              <h2 id="process" className="mb-5 text-xl font-bold text-apex-text">
                {isAr ? "كيف نعمل" : "How we work"}
              </h2>
              <ol className="grid gap-4">
                {service.process.map((step, index) => (
                  <li key={step} className="flex items-start gap-4 text-base text-apex-text">
                    <span className="apex-step">{index + 1}</span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {service.body && (
            <article className="apex-prose mt-14 max-w-[72ch]">
              <MarkdownContent source={service.body} lang={lang} />
            </article>
          )}

          {service.faq.length > 0 && (
            <section aria-labelledby="faq" className="mt-14 max-w-3xl">
              <h2 id="faq" className="apex-section-title mb-6">
                {isAr ? "أسئلة شائعة" : "Frequently asked questions"}
              </h2>
              {service.faq.map((item) => (
                <details key={item.question} className="apex-faq">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
          )}

          {work.length > 0 && (
            <section aria-labelledby="work" className="mt-16">
              <h2 id="work" className="apex-section-title mb-6">
                {isAr ? "أعمال ذات صلة" : "Related work"}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {work.map((project) => (
                  <ProjectCard key={project.slug} project={project} lang={lang} />
                ))}
              </div>
            </section>
          )}

          {guides.length > 0 && (
            <section aria-labelledby="guides" className="mt-16">
              <h2 id="guides" className="apex-section-title mb-6">
                {isAr ? "أدلة ذات صلة" : "Related guides"}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((card) => (
                  <PostCard key={card.slug} post={card} lang={lang} headingLevel="h3" />
                ))}
              </div>
            </section>
          )}

          <aside className="mt-16 flex flex-col gap-4 rounded-2xl border border-apex-border bg-apex-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <p className="text-lg font-bold text-apex-text">
              {isAr ? "أرسل وصفاً قصيراً لمشروعك ونردّ خلال يوم عمل." : "Send a short description of your project and we reply within one business day."}
            </p>
            <Link href={`/${lang}/contact`} className="apex-btn-primary shrink-0">
              {service.ctaLabel}
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
