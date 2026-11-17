import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { author, authorSameAs, hasNamedAuthor } from "@/data/author";
import { socialLinks } from "@/data/social-links";
import { getBlogPosts, getPortfolioItems, getServices } from "@/lib/content/content-loader";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { authorName, buildBreadcrumbSchema, buildOrganizationSchema, buildPersonSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "من نحن — شركة برمجيات تعمل مع عملاء الخليج" : "About APEX — A Software Company Working With Gulf Clients",
    description: isAr
      ? "APEX شركة برمجيات مقرّها سوريا تعمل عن بُعد مع عملاء في السعودية والإمارات وقطر. كيف نعمل، ولماذا نركّز على العربية، وما الذي نبنيه."
      : "APEX is a software company based in Syria, working remotely with clients in Saudi Arabia, the UAE and Qatar. How we work, why we focus on Arabic, and what we build.",
    path: `/${lang}/about`,
  });
}

const SECTIONS = {
  en: [
    {
      heading: "How we work",
      body: "Every project starts with a scoping session where we work out the problem you are solving before discussing technology or design. The work is then split into phases, each with output you can review, and you get a testable build every two weeks instead of waiting until the end.",
    },
    {
      heading: "Why we focus on Arabic",
      body: "Most development tooling assumes English and left-to-right text. The problems that follow (mixed Arabic and Latin strings breaking layout, fonts without proper Arabic support, Hijri dates calculated wrongly) surface late and are expensive to fix. We treat Arabic and RTL support as an architectural decision made at the start.",
    },
    {
      heading: "What we build",
      body: "Mobile apps in Flutter, websites and online stores, applied AI such as Arabic-capable assistants and document processing, and video and AI-generated content for marketing.",
    },
    {
      heading: "Cost and ownership",
      body: "We quote in itemised phases that show what each amount covers, and flag the running costs quotes usually leave out: hosting, store fees and payment gateway charges. On completion, the source code and accounts are handed over in your name with the documentation needed to maintain them.",
    },
  ],
  ar: [
    {
      heading: "كيف نعمل",
      body: "يبدأ كل مشروع بجلسة لتحديد النطاق نفهم فيها المشكلة التي تريد حلّها قبل الحديث عن التقنية أو التصميم. ثم نقسّم العمل إلى مراحل لكل منها مخرجات قابلة للمراجعة، وتحصل على نسخة قابلة للاختبار كل أسبوعين بدل الانتظار حتى النهاية.",
    },
    {
      heading: "لماذا نركّز على العربية",
      body: "معظم أدوات التطوير تفترض الإنجليزية واتجاه الكتابة من اليسار لليمين. والمشكلات التي تنتج عن ذلك (تكسّر النصوص المختلطة، وخطوط لا تدعم العربية جيداً، وتواريخ هجرية تُحسب خطأً) تظهر متأخرة وإصلاحها مكلف. نتعامل مع دعم العربية كقرار معماري يُتخذ من البداية.",
    },
    {
      heading: "ما الذي نبنيه",
      body: "تطبيقات الجوال بـ Flutter، والمواقع والمتاجر الإلكترونية، وتطبيقات الذكاء الاصطناعي مثل المساعدات التي تتقن العربية ومعالجة المستندات، ومحتوى الفيديو والمحتوى المولّد بالذكاء الاصطناعي للتسويق.",
    },
    {
      heading: "التكلفة والملكية",
      body: "نقدّم عروضاً مقسّمة على مراحل توضّح ما يقابل كل مبلغ، وننبّه إلى التكاليف التشغيلية التي تغفلها العروض عادة: الاستضافة ورسوم المتاجر وعمولات بوابات الدفع. وعند الاكتمال نسلّم الكود المصدري والحسابات باسمك مع التوثيق اللازم لصيانتها.",
    },
  ],
} as const;

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const isAr = lang === "ar";
  const [dictionary, services, projects, posts] = await Promise.all([
    getDictionary(lang),
    getServices(lang),
    getPortfolioItems(lang),
    getBlogPosts(lang),
  ]);
  const person = buildPersonSchema(lang);
  const jobTitle = isAr && author.jobTitleAr ? author.jobTitleAr : author.jobTitle;

  const facts = [
    { term: isAr ? "المقر" : "Based in", value: isAr ? "سوريا، ونعمل عن بُعد" : "Syria, working remotely" },
    { term: isAr ? "الأسواق" : "Markets", value: isAr ? "السعودية، الإمارات، قطر" : "Saudi Arabia, UAE, Qatar" },
    { term: isAr ? "لغات العمل" : "Working languages", value: isAr ? "العربية والإنجليزية" : "Arabic and English" },
    { term: isAr ? "الخدمات" : "Services", value: services.map((s) => s.title).join(isAr ? "، " : ", ") },
    { term: isAr ? "الأعمال الموثّقة" : "Documented projects", value: String(projects.length) },
    { term: isAr ? "الأدلة المنشورة" : "Published guides", value: String(posts.length) },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      {person && <JsonLd schema={person} />}
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
          { name: isAr ? "من نحن" : "About", url: `${siteUrl}/${lang}/about` },
        ])}
      />

      <div className="px-6 pt-10 pb-20 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeader as="h1" title={dictionary.about.title} subtitle={dictionary.about.subtitle} />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="apex-prose max-w-[72ch]">
              <p className="apex-prose-p">{dictionary.about.description}</p>
              {SECTIONS[lang].map((section) => (
                <section key={section.heading}>
                  <h2 className="apex-prose-h2">{section.heading}</h2>
                  <p className="apex-prose-p">{section.body}</p>
                </section>
              ))}

              {hasNamedAuthor() && (
                <section id="author" className="scroll-mt-28">
                  <h2 className="apex-prose-h2">{isAr ? "كاتب الأدلة" : "Who writes the guides"}</h2>
                  <p className="apex-prose-p">
                    <strong>{authorName(lang)}</strong>
                    {jobTitle ? ` — ${jobTitle}` : ""}
                  </p>
                  {authorSameAs().length > 0 && (
                    <ul className="apex-prose-list">
                      {authorSameAs().map((url) => (
                        <li key={url}>
                          <a href={url} target="_blank" rel="noopener noreferrer me" className="text-apex-primary underline">
                            {url.replace(/^https?:\/\//, "")}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>

            <aside className="flex flex-col gap-6">
              <dl className="rounded-2xl border border-apex-border bg-apex-card p-6">
                {facts.map((fact) => (
                  <div key={fact.term} className="border-b border-apex-border py-3 first:pt-0 last:border-0 last:pb-0">
                    <dt className="text-sm text-apex-muted">{fact.term}</dt>
                    <dd className="mt-1 font-bold text-apex-text">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-3">
                <Link href={`/${lang}/portfolio`} className="apex-btn-outline">
                  {isAr ? "شاهد أعمالنا" : "See our work"}
                </Link>
                <Link href={`/${lang}/contact`} className="apex-btn-primary">
                  {isAr ? "تواصل معنا" : "Get in touch"}
                </Link>
                <a href={`mailto:${socialLinks.email}`} dir="ltr" className="text-center text-sm text-apex-muted underline">
                  {socialLinks.email}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
