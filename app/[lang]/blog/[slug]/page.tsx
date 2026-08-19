import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  extractFaqs,
} from "@/lib/seo/schema";
import { CATEGORY_LABELS, FALLBACK_POST, MOCK_POSTS, POST_META, PUBLISHED_POST_SLUGS } from "@/lib/mock/blog-data";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { TableOfContents } from "@/components/content/TableOfContents";
import { collectHeadings } from "@/lib/content/headings";

// Only slugs backed by a real MDX article are prerendered. Previously every
// MOCK_POST_SLUGS entry was added too, which published routes whose body rendered
// "Content coming soon..." — thin pages that Google indexes and counts against
// site quality. `dynamicParams = false` turns any other slug into a 404.
export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; slug: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const posts = await getBlogPosts(lang);

    for (const post of posts) {
      const key = `${lang}:${post.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, slug: post.slug });
      }
    }
  }

  return params;
}

export const dynamicParams = false;

function extractFirstImage(content: string): string | undefined {
  const match = /^!\[.*\]\((.*)\)$/m.exec(content);
  return match?.[1] ?? undefined;
}

/**
 * Picks related articles by shared category, most overlap first, falling back to
 * other articles once the topical matches run out so the section always fills.
 *
 * This used to be `PUBLISHED_POST_SLUGS.slice(0, 3)` — a fixed list, so every
 * article recommended the same three regardless of subject, and an API security
 * guide pointed readers at a Flutter article.
 */
function getRelatedSlugs(
  current: string,
  count: number,
  dateBySlug: Map<string, string>
): string[] {
  const mine = POST_META[current]?.categories ?? [];

  const scored = PUBLISHED_POST_SLUGS.filter((item) => item !== current)
    .map((item) => ({
      slug: item,
      overlap: (POST_META[item]?.categories ?? []).filter((c) => mine.includes(c)).length,
      date: dateBySlug.get(item) ?? "",
    }))
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      // Ties used to fall back to PUBLISHED_POST_SLUGS order, which is
      // alphabetical — and with only two categories per article, dozens of pairs
      // tie at an overlap of 2. The result was that the same handful of
      // alphabetically-early slugs was recommended site-wide while later ones
      // were never surfaced. Newest-first breaks the tie usefully and is still
      // deterministic, which matters because this renders into static HTML.
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.slug.localeCompare(b.slug);
    });

  return scored.slice(0, count).map((entry) => entry.slug);
}

// Every published article carries its own keyword set. Previously only `flutter`
// had one, so the other posts shipped with no keywords meta at all.
const POST_KEYWORDS: Record<string, { ar: string[]; en: string[] }> = {
  flutter: {
    ar: ["Flutter", "دارت", "تطوير تطبيقات", "تطبيقات متعددة المنصات", "Google Flutter", "تطوير الموبايل"],
    en: ["Flutter", "Dart", "cross-platform", "mobile development", "Google Flutter", "app development"],
  },
  "react-native": {
    ar: ["React Native", "تطوير تطبيقات", "جافاسكريبت", "تطبيقات متعددة المنصات", "Flutter مقابل React Native", "تطوير الموبايل"],
    en: ["React Native", "JavaScript", "cross-platform", "mobile development", "React Native vs Flutter", "app development"],
  },
  "seo-vs-geo": {
    ar: ["SEO", "GEO", "تحسين محركات البحث", "الذكاء الاصطناعي", "التسويق الرقمي", "محركات الإجابة"],
    en: ["SEO", "GEO", "generative engine optimization", "AI search", "digital marketing", "answer engines"],
  },
  "mobile-app-development-cost": {
    ar: ["تكلفة تطوير تطبيق", "أسعار تطبيقات الموبايل", "تكلفة تطبيق", "ميزانية تطبيق", "تطوير تطبيقات"],
    en: ["mobile app development cost", "app pricing", "app development budget", "cost to build an app"],
  },
  "mobile-app-development-cost-gulf": {
    ar: ["تكلفة تطوير تطبيق في الخليج", "أسعار التطبيقات السعودية", "تطوير تطبيقات الإمارات", "تكلفة تطبيق قطر", "مدى", "تعريب التطبيقات"],
    en: ["app development cost Gulf", "Saudi app pricing", "UAE app development", "Qatar app cost", "Mada integration", "Arabic localisation"],
  },
  "ecommerce-development-cost-saudi": {
    ar: ["تكلفة متجر إلكتروني", "متجر إلكتروني السعودية", "سلة", "زد", "فاتورة", "تجارة إلكترونية"],
    en: ["ecommerce cost Saudi Arabia", "online store pricing", "Salla", "Zid", "ZATCA e-invoicing", "ecommerce development"],
  },
  "app-development-company-riyadh": {
    ar: ["شركة تطوير تطبيقات", "تطوير تطبيقات الرياض", "شركة برمجيات السعودية", "اختيار شركة تطوير", "أسعار تطوير التطبيقات"],
    en: ["app development company Riyadh", "Saudi software company", "choosing a development partner", "app development pricing"],
  },
  "website-design-cost": {
    ar: ["تكلفة تصميم موقع", "أسعار تصميم المواقع", "تصميم موقع إلكتروني", "تكلفة موقع شركة", "استضافة ونطاق"],
    en: ["website design cost", "web design pricing", "website development cost", "company website cost", "hosting and domain"],
  },
  "web-design-company-dubai": {
    ar: ["شركة تصميم مواقع دبي", "تصميم مواقع الإمارات", "تطوير ويب دبي", "أسعار تصميم المواقع دبي", "DIFC"],
    en: ["web design company Dubai", "UAE web design", "Dubai web development", "Dubai website pricing", "DIFC"],
  },
  "clinic-booking-app-cost": {
    ar: ["تطبيق حجز مواعيد", "تطبيق عيادة", "تكلفة تطبيق طبي", "حجز مواعيد العيادات", "الهيئة العامة للغذاء والدواء"],
    en: ["clinic booking app", "appointment booking app cost", "medical app development", "healthcare app Saudi", "SFDA"],
  },
  "app-development-jeddah": {
    ar: ["تطوير تطبيقات جدة", "شركة تطبيقات جدة", "أسعار تطوير التطبيقات", "تطبيقات المنطقة الغربية", "تكامل الأنظمة"],
    en: ["app development Jeddah", "Jeddah app company", "app development pricing", "western region apps", "system integration"],
  },
  "delivery-app-cost": {
    ar: ["تكلفة تطبيق توصيل", "تطبيق توصيل طلبات", "تطبيق سائقين", "تتبع GPS", "منصة توصيل"],
    en: ["delivery app cost", "food delivery app", "driver app development", "GPS tracking", "delivery platform"],
  },
  "software-company-qatar": {
    ar: ["شركة برمجيات قطر", "تطوير تطبيقات الدوحة", "أسعار البرمجيات قطر", "مركز قطر للمال", "حماية البيانات قطر"],
    en: ["software company Qatar", "Doha app development", "Qatar software pricing", "QFC", "Qatar data protection"],
  },
  "ai-chatbot-cost": {
    ar: ["تكلفة شات بوت", "شات بوت عربي", "روبوت محادثة", "ذكاء اصطناعي خدمة العملاء", "نماذج لغوية"],
    en: ["AI chatbot cost", "Arabic chatbot", "customer service bot", "LLM chatbot", "conversational AI"],
  },
  "app-development-abu-dhabi": {
    ar: ["تطوير تطبيقات أبوظبي", "شركة تطبيقات أبوظبي", "سوق أبوظبي العالمي", "ADGM", "أسعار التطبيقات الإمارات"],
    en: ["app development Abu Dhabi", "Abu Dhabi app company", "ADGM", "UAE app pricing", "government apps UAE"],
  },
  "educational-app-cost": {
    ar: ["تكلفة تطبيق تعليمي", "منصة تعليمية", "تطبيق دورات", "التعليم الرقمي", "حماية بيانات الطلاب"],
    en: ["educational app cost", "e-learning platform", "course app development", "digital education", "student data protection"],
  },
  "app-development-contract": {
    ar: ["عقد تطوير تطبيق", "ملكية الكود المصدري", "بنود العقد", "جدول الدفعات", "معايير القبول"],
    en: ["app development contract", "source code ownership", "contract clauses", "payment schedule", "acceptance criteria"],
  },
  "flutter-vs-react-native": {
    ar: ["Flutter مقابل React Native", "مقارنة أطر التطوير", "تطوير تطبيقات", "دعم RTL", "اختيار التقنية"],
    en: ["Flutter vs React Native", "cross-platform comparison", "mobile frameworks", "RTL support", "framework choice"],
  },
  "shopify-vs-custom-store": {
    ar: ["Shopify مقابل متجر مخصص", "سلة", "زد", "تكلفة المتجر", "منصة جاهزة"],
    en: ["Shopify vs custom store", "Salla", "Zid", "ecommerce TCO", "hosted platform"],
  },
  "native-vs-hybrid-app": {
    ar: ["تطبيق أصيل", "تطبيق هجين", "متعدد المنصات", "WebView", "مقارنة التطوير"],
    en: ["native vs hybrid", "cross-platform apps", "WebView", "app development comparison"],
  },
  "wordpress-vs-nextjs": {
    ar: ["WordPress مقابل Next.js", "موقع شركة", "نظام إدارة محتوى", "أداء الموقع", "صيانة الموقع"],
    en: ["WordPress vs Next.js", "company website", "CMS", "site performance", "site maintenance"],
  },
  "app-vs-pwa": {
    ar: ["تطبيق أم موقع", "PWA", "تطبيق ويب تقدمي", "موقع متجاوب", "حاجز التحميل"],
    en: ["app vs PWA", "progressive web app", "responsive website", "download barrier"],
  },
  "freelancer-vs-agency": {
    ar: ["فريلانسر أم شركة", "مطور مستقل", "شركة تطوير", "تكلفة التطوير", "اختيار المزوّد"],
    en: ["freelancer vs agency", "independent developer", "development company", "development cost"],
  },
  "gulf-payment-gateways": {
    ar: ["بوابات الدفع", "مدى", "STC Pay", "تابي", "تمارا", "الدفع الآجل"],
    en: ["Gulf payment gateways", "Mada", "STC Pay", "Tabby", "Tamara", "BNPL"],
  },
  "mvp-vs-full-product": {
    ar: ["MVP", "المنتج الأدنى", "منتج كامل", "اختبار السوق", "نطاق المشروع"],
    en: ["MVP", "minimum viable product", "full product", "market validation", "project scope"],
  },
  "hosting-comparison": {
    ar: ["استضافة المواقع", "Vercel", "AWS", "إقامة البيانات", "استضافة سحابية"],
    en: ["web hosting", "Vercel", "AWS", "data residency", "cloud hosting"],
  },
  "choosing-ai-model-arabic": {
    ar: ["اختيار نموذج ذكاء اصطناعي", "نموذج لغوي عربي", "مساعد ذكي", "تقييم النماذج", "خصوصية البيانات"],
    en: ["choosing an AI model", "Arabic language model", "AI assistant", "model evaluation", "data privacy"],
  },
  "template-vs-custom-design": {
    ar: ["قالب جاهز", "تصميم مخصص", "معدل التحويل", "تصميم المواقع", "اختيار القالب"],
    en: ["template vs custom design", "conversion rate", "web design", "choosing a template"],
  },
  "maintenance-inhouse-vs-contract": {
    ar: ["صيانة المواقع", "عقد صيانة", "تكلفة الصيانة", "فريق داخلي", "دعم فني"],
    en: ["website maintenance", "maintenance contract", "maintenance cost", "in-house team", "technical support"],
  },
  "flutter-rtl-arabic-guide": {
    ar: ["دعم RTL", "Flutter عربي", "تعريب التطبيقات", "EdgeInsetsDirectional", "واجهات عربية"],
    en: ["Flutter RTL", "Arabic Flutter", "app localisation", "directional widgets", "Arabic UI"],
  },
  "arabic-web-fonts": {
    ar: ["خطوط عربية", "خطوط الويب", "أداء الموقع", "woff2", "تقليص الخط"],
    en: ["Arabic web fonts", "web typography", "site performance", "woff2", "font subsetting"],
  },
  "hijri-dates-guide": {
    ar: ["التقويم الهجري", "أم القرى", "تحويل التواريخ", "تواريخ التطبيقات", "Intl"],
    en: ["Hijri calendar", "Umm al-Qura", "date conversion", "app dates", "Intl API"],
  },
  "pdpl-compliance-guide": {
    ar: ["نظام حماية البيانات", "PDPL", "سدايا", "الموافقة", "إشعار الخرق"],
    en: ["PDPL compliance", "Saudi data protection", "SDAIA", "consent", "breach notification"],
  },
  "health-apps-uae-compliance": {
    ar: ["تطبيقات صحية", "هيئة الصحة بدبي", "DHA", "الصحة عن بعد", "نابض"],
    en: ["health apps UAE", "Dubai Health Authority", "DHA", "telehealth", "NABIDH"],
  },
  "fintech-sama-compliance": {
    ar: ["التقنية المالية", "ساما", "البنك المركزي السعودي", "الخدمات المصرفية المفتوحة", "البيئة التجريبية"],
    en: ["fintech Saudi", "SAMA", "open banking", "regulatory sandbox", "payment licensing"],
  },
  "app-performance-optimization": {
    ar: ["أداء التطبيقات", "تحسين الأداء", "زمن الإقلاع", "تحسين الصور", "استهلاك البطارية"],
    en: ["app performance", "optimisation", "startup time", "image optimisation", "battery usage"],
  },
  "api-security-guide": {
    ar: ["أمان API", "حماية الواجهات", "المصادقة", "التفويض", "ثغرات أمنية"],
    en: ["API security", "authentication", "authorisation", "mobile security", "vulnerabilities"],
  },
  "clean-architecture-flutter": {
    ar: ["Clean Architecture", "معمارية التطبيقات", "Flutter", "طبقات التطبيق", "قابلية الاختبار"],
    en: ["Clean Architecture", "app architecture", "Flutter", "layers", "testability"],
  },
  "mobile-app-testing": {
    ar: ["اختبار التطبيقات", "اختبار الوحدة", "ضمان الجودة", "تتبع الأعطال", "اختبار يدوي"],
    en: ["mobile app testing", "unit testing", "QA", "crash reporting", "manual testing"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  let mdxPost = null;
  try {
    mdxPost = await getBlogPostBySlug(locale, slug);
  } catch (error) {
    // Content validation errors are recoverable here (the page falls back to
    // static metadata), but they describe real malformed content, so surface
    // them instead of failing silently.
    console.error("Content load failed:", error);
    mdxPost = null;
  }
  const mock = MOCK_POSTS[slug]?.[locale];
  const rawContent = mdxPost?.content ?? mock?.content ?? "";
  const ogImage = extractFirstImage(rawContent);

  // If neither source resolved, the page itself 404s. Emitting metadata built from
  // the bare slug and an empty description would otherwise hand search engines a
  // title like "react-native-expo-guide" with no description at all.
  if (!mdxPost && !mock) {
    return { title: locale === "ar" ? "الصفحة غير موجودة" : "Page Not Found", robots: { index: false, follow: false } };
  }

  return buildPageMeta(locale, {
    title: mdxPost?.seoTitle ?? mdxPost?.title ?? mock?.title ?? slug,
    description: mdxPost?.excerpt ?? mock?.excerpt ?? "",
    path: `/${lang}/blog/${slug}`,
    keywords: POST_KEYWORDS[slug]?.[locale],
    image: ogImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr = lang === "ar";
  let mdxPost = null;
  try {
    mdxPost = await getBlogPostBySlug(lang, slug);
  } catch (error) {
    // Content validation errors are recoverable here (the page falls back to
    // static metadata), but they describe real malformed content, so surface
    // them instead of failing silently.
    console.error("Content load failed:", error);
    mdxPost = null;
  }
  const mock = MOCK_POSTS[slug];
  const mockContent = mock?.[lang];
  const fallback = FALLBACK_POST(slug, lang);

  // A slug with no MDX article and no mock copy has nothing to show. Rendering the
  // placeholder here would publish an empty page under a real URL, so 404 instead.
  if (!mdxPost && !mockContent) notFound();

  const title = mdxPost?.title ?? mockContent?.title ?? fallback.title;
  const excerpt = mdxPost?.excerpt ?? mockContent?.excerpt ?? fallback.excerpt;
  const date = mdxPost?.datePublished ?? mockContent?.date ?? fallback.date;
  // POST_META covers every published article; MOCK_POSTS only the five that
  // predate the MDX content. Reading meta first stops the other 34 from showing
  // a generic accent colour and the placeholder "Articles" category.
  const meta = POST_META[slug];
  const readTime = meta?.readTime ?? mock?.readTime ?? fallback.readTime;
  const accentColor = meta?.accentColor ?? mock?.accentColor ?? fallback.accentColor;
  const categoryKey = meta?.categories?.[0] ?? mock?.categories?.[0] ?? fallback.categories[0];
  const category = CATEGORY_LABELS[categoryKey]?.[lang] ?? categoryKey;
  const rawContent = mdxPost?.content ?? mockContent?.content ?? fallback.content;
  // Related links point only at articles that actually exist — linking to the
  // placeholder slugs sent crawlers (and readers) to dead-end pages.
  // `getBlogPosts` is React-cached and the page already loaded this collection to
  // resolve the current slug, so reading the whole list here costs nothing extra
  // and avoids a per-related-slug lookup.
  const allPosts = await getBlogPosts(lang).catch(() => []);
  const postBySlug = new Map(allPosts.map((post) => [post.slug, post]));
  const relatedSlugs = getRelatedSlugs(
    slug,
    3,
    new Map(allPosts.map((post) => [post.slug, post.datePublished ?? ""]))
  );
  // Titles come from the MDX files, since only five articles have MOCK_POSTS copy
  // and the card renders nothing without a title.
  const relatedPosts = relatedSlugs
    .map((item) => {
      const post = postBySlug.get(item);
      const title = post?.title ?? MOCK_POSTS[item]?.[lang]?.title;
      if (!title) return null;
      return {
        slug: item,
        title,
        // The card showed only an emoji and a title, which gave the reader no
        // basis to pick one link over another. The excerpt is the same sentence
        // the blog index uses.
        excerpt: post?.excerpt ?? MOCK_POSTS[item]?.[lang]?.excerpt ?? "",
        emoji: POST_META[item]?.emoji ?? MOCK_POSTS[item]?.emoji ?? "📝",
      };
    })
    .filter((item): item is { slug: string; title: string; excerpt: string; emoji: string } => item !== null);
  const faqs = extractFaqs(rawContent);
  // Built from the same source the renderer receives, so the anchors it emits
  // match the ids MarkdownContent stamps onto the headings.
  const headings = collectHeadings(rawContent);

  return (
    <div
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
          { name: isAr ? "المدونة" : "Blog", url: `${siteUrl}/${lang}/blog` },
          { name: title, url: `${siteUrl}/${lang}/blog/${slug}` },
        ])}
      />
      <JsonLd
        schema={buildBlogPostingSchema({
          title,
          excerpt,
          url: `${siteUrl}/${lang}/blog/${slug}`,
          datePublished: date || undefined,
          dateModified: mdxPost?.dateModified,
          image: extractFirstImage(rawContent),
          lang,
        })}
      />
      {/* Articles that end with a FAQ section get FAQPage markup, which is what
          makes the questions eligible to appear as expandable rich results and
          gives AI answer engines discrete Q&A pairs to quote. Articles without a
          FAQ section emit nothing rather than an empty mainEntity array. */}
      {faqs.length > 0 && <JsonLd schema={buildFaqSchema(faqs)} />}
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${lang}/blog`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors min-h-[44px] py-2 ${
            isAr ? "font-ar" : "font-en"
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
          {isAr ? "العودة إلى المدونة" : "Back to Blog"}
        </Link>

        <div
          className="flex items-center gap-3 mb-4 text-xs"
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span
            className="px-3 min-h-[28px] flex items-center rounded-full text-xs font-bold"
            style={{
              background: `color-mix(in srgb,${accentColor} 18%,transparent)`,
              border: `1px solid ${accentColor}55`,
              color: accentColor,
            }}
          >
            {category}
          </span>
          {/* Named attribution. These guides cover regulated subjects — SAMA
              licensing, PDPL, DHA health requirements — where an unattributed page
              is held to a stricter standard. The byline links to /about, which is
              the page that substantiates who is making the claims. */}
          <Link
            href={`/${lang}/about`}
            rel="author"
            className="apex-byline font-semibold"
            style={{ color: "var(--color-secondary-text)" }}
          >
            {isAr ? "فريق APEX" : "APEX Team"}
          </Link>
          <span>·</span>
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span>
            {readTime} {isAr ? "دقائق قراءة" : "min read"}
          </span>
        </div>

        <h1
          className={`font-bold mb-4 leading-tight ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "clamp(22px,3.5vw,40px)", color: "var(--color-primary-text)" }}
        >
          {title}
        </h1>

        <p
          className={`text-lg mb-10 leading-relaxed pb-8 border-b ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)", borderColor: "var(--color-border)" }}
        >
          {excerpt}
        </p>

        {rawContent.trim() && <TableOfContents entries={headings} lang={lang} />}

        <article className="mb-14">
          {!rawContent.trim() ? (
            <div className="text-center py-16" style={{ color: "var(--color-secondary-text)" }}>
              <p className={`text-base ${isAr ? "font-ar" : "font-en"}`}>
                {isAr ? "المحتوى قيد الإعداد..." : "Content coming soon..."}
              </p>
            </div>
          ) : <MarkdownContent source={rawContent} lang={lang} />}
        </article>

        {/* Who wrote this and why they are qualified to. Google's guidance for
            "your money or your life" subjects — and several of these guides are
            exactly that — treats a stated, checkable author as a baseline
            expectation rather than an enhancement. It also gives answer engines
            an entity to attribute a quoted claim to. */}
        <div
          className="rounded-2xl p-6 border mb-8 flex items-start gap-4"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
        >
          <span
            className="flex-none rounded-xl flex items-center justify-center text-2xl"
            style={{
              width: "56px",
              height: "56px",
              background: "color-mix(in srgb,var(--color-primary) 12%,transparent)",
            }}
            aria-hidden="true"
          >
            🅰️
          </span>
          <div>
            <p
              className={`font-bold mb-1 ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
            >
              {isAr ? "فريق APEX" : "APEX Team"}
            </p>
            <p
              className={`leading-relaxed mb-2 ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "13.5px", color: "var(--color-secondary-text)" }}
            >
              {isAr
                ? "مطوّرون ومهندسو برمجيات نبني تطبيقات موبايل ومواقع ومتاجر إلكترونية لعملاء في السعودية والإمارات وقطر. الأرقام والتقديرات في أدلتنا مأخوذة من مشاريع نفّذناها فعلياً، لا من تقديرات عامة."
                : "Developers and software engineers building mobile apps, websites, and e-commerce platforms for clients in Saudi Arabia, the UAE, and Qatar. The figures and estimates in our guides come from projects we have actually delivered, not from generic benchmarks."}
            </p>
            <Link
              href={`/${lang}/about`}
              className={`apex-byline text-xs font-semibold ${isAr ? "font-ar" : "font-en"}`}
              style={{ color: "var(--color-primary)" }}
            >
              {isAr ? "تعرّف على الفريق ←" : "More about the team →"}
            </Link>
          </div>
        </div>

        <div
          className="rounded-2xl p-8 text-center border mb-14"
          style={{
            background: "color-mix(in srgb,var(--color-primary) 6%,var(--color-card))",
            borderColor: "color-mix(in srgb,var(--color-primary) 20%,transparent)",
          }}
        >
          <p
            className={`font-bold mb-3 ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "20px", color: "var(--color-primary-text)" }}
          >
            {isAr ? "هل تريد تطبيق هذه الأفكار في مشروعك؟" : "Want to apply these ideas to your project?"}
          </p>
          {/* Readers of these guides are researching a purchase, so the CTA states
              what they actually get and what it costs them — a vague "contact us"
              converts far worse than a concrete, low-commitment offer. */}
          <p
            className={`mx-auto mb-6 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "14px", color: "var(--color-secondary-text)", maxWidth: "460px" }}
          >
            {isAr
              ? "أرسل لنا فكرتك وسنرد بتقدير أولي للنطاق والمدة والتكلفة — دون التزام منك."
              : "Send us your idea and we will reply with an initial estimate of scope, timeline, and cost — with no obligation."}
          </p>
          <div className={`flex flex-wrap gap-3 justify-center ${isAr ? "flex-row-reverse" : ""}`}>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 px-8 min-h-[44px] rounded-full font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                boxShadow: "0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)",
              }}
            >
              {isAr ? "اطلب تقديراً مجانياً" : "Get a Free Estimate"}
              <span className={isAr ? "rotate-180 inline-block" : ""}>→</span>
            </Link>
            <Link
              href={`/${lang}/portfolio`}
              className="inline-flex items-center gap-2 px-8 min-h-[44px] rounded-full border-2 font-bold text-sm"
              style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
            >
              {isAr ? "شاهد أعمالنا" : "See Our Work"}
            </Link>
          </div>
        </div>

        <div>
          <h3
            className={`font-bold mb-6 ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "18px", color: "var(--color-primary-text)" }}
          >
            {isAr ? "مقالات ذات صلة" : "Related Articles"}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedPosts.map((related) => {
              const item = related.slug;

              return (
                // `flex items-center` laid the emoji out beside the title on one
                // line and made the `mb-2` below a no-op; the card stacks now that
                // it carries an excerpt as well.
                <Link
                  key={item}
                  href={`/${lang}/blog/${item}`}
                  className="rounded-xl p-4 min-h-[44px] flex flex-col border transition-all duration-200"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    textDecoration: "none",
                  }}
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div className="text-2xl mb-2">{related.emoji}</div>
                  <p
                    className={`text-xs font-semibold leading-snug mb-1.5 ${isAr ? "font-ar" : "font-en"}`}
                    style={{ color: "var(--color-primary-text)" }}
                  >
                    {related.title}
                  </p>
                  {related.excerpt && (
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${isAr ? "font-ar" : "font-en"}`}
                      style={{ color: "var(--color-secondary-text)" }}
                    >
                      {related.excerpt}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
