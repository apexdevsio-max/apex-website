import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { getDictionary } from "@/lib/i18n/i18n";
import { getServices } from "@/lib/content/content-loader";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildServiceCollectionSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/metadata";

const ServicesGrid = dynamic(
  () => import("@/components/sections/ServicesGrid").then((m) => m.ServicesGrid),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-screen pt-28 pb-24 px-6" style={{ background: "var(--color-background)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="h-4 w-24 mx-auto mb-4 rounded-full animate-pulse" style={{ background: "var(--color-border)" }} />
            <div className="h-10 w-48 mx-auto rounded animate-pulse" style={{ background: "var(--color-border)" }} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: "var(--color-border)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "خدماتنا — تطوير الويب والتطبيقات" : "Services — Web and App Development",
    description: isAr
      ? "نقدم حلولاً رقمية متكاملة: تطوير ويب، تطبيقات موبايل، ذكاء اصطناعي، تصميم UI/UX، متاجر إلكترونية، وصناعة محتوى."
      : "We offer integrated digital solutions: web development, mobile apps, AI, UI/UX design, e-commerce, and content creation.",
    path: `/${lang}/services`,
    keywords: isAr
      ? ["خدمات برمجية", "تطوير ويب", "تطبيقات موبايل", "ذكاء اصطناعي", "متاجر إلكترونية", "تصميم UI UX"]
      : ["software services", "web development", "mobile apps", "AI solutions", "e-commerce", "UI UX design"],
  });
}

export default async function ServicesPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);
  const mdxItems = await getServices(lang);
  const isAr = lang === "ar";

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "خدماتنا" : "Services", url: `${siteUrl}/${lang}/services` },
  ];

  // Rendered below the grid and emitted as FAQPage JSON-LD from the same array,
  // so the markup always matches what a visitor actually sees on the page.
  const faq = isAr
    ? [
        {
          question: "كم تستغرق مدة تنفيذ المشروع؟",
          answer:
            "الموقع التعريفي يستغرق عادة من ٣ إلى ٦ أسابيع، والمتجر الإلكتروني من ٦ إلى ١٢ أسبوعاً، وتطبيق الموبايل من ٣ إلى ٦ أشهر حسب عدد الميزات. نحدد الجدول الزمني الدقيق بعد جلسة تحديد النطاق الأولى.",
        },
        {
          question: "كيف تُحتسب تكلفة المشروع؟",
          answer:
            "التكلفة تُحدَّد بنطاق العمل: عدد الشاشات، والتكاملات المطلوبة مع أنظمة خارجية مثل بوابات الدفع، ومستوى تخصيص التصميم. نقدّم عرضاً تفصيلياً مقسّماً على مراحل بدلاً من رقم إجمالي واحد.",
        },
        {
          question: "هل تدعمون اللغة العربية واتجاه الكتابة من اليمين إلى اليسار؟",
          answer:
            "نعم. دعم العربية وRTL جزء أساسي من طريقة بنائنا للواجهات وليس إضافة لاحقة، ويشمل ذلك اختيار الخطوط المناسبة ومعالجة النصوص المختلطة عربي-لاتيني وعرض التواريخ الهجرية عند الحاجة.",
        },
        {
          question: "ماذا يحدث بعد إطلاق المشروع؟",
          answer:
            "نوفّر فترة دعم بعد الإطلاق لمعالجة الملاحظات وإصلاح أي مشاكل، ويمكن الاتفاق على عقد صيانة مستمر يشمل التحديثات الأمنية ومراقبة الأداء وإضافة ميزات جديدة.",
        },
        {
          question: "هل نمتلك الكود المصدري للمشروع؟",
          answer:
            "نعم، تنتقل ملكية الكود المصدري إليك بالكامل عند اكتمال المشروع وسداد المستحقات، ويُسلَّم عبر مستودع كود خاص بك مع توثيق يمكّن أي فريق آخر من متابعة العمل.",
        },
      ]
    : [
        {
          question: "How long does a project take?",
          answer:
            "A marketing website typically takes 3–6 weeks, an e-commerce store 6–12 weeks, and a mobile app 3–6 months depending on feature count. We set an exact timeline after the initial scoping session.",
        },
        {
          question: "How is project cost calculated?",
          answer:
            "Cost follows scope: the number of screens, the integrations required with external systems such as payment gateways, and how much of the design is custom. We quote in itemised phases rather than a single lump figure.",
        },
        {
          question: "Do you support Arabic and right-to-left layouts?",
          answer:
            "Yes. Arabic and RTL support is built into how we structure interfaces rather than added afterwards, covering font selection, mixed Arabic-Latin text handling, and Hijri date display where needed.",
        },
        {
          question: "What happens after launch?",
          answer:
            "We include a post-launch support window for feedback and fixes, and can arrange an ongoing maintenance agreement covering security updates, performance monitoring, and new feature work.",
        },
        {
          question: "Do we own the source code?",
          answer:
            "Yes. Full ownership of the source code transfers to you on project completion and final payment, delivered through a repository you control along with documentation that lets any other team pick the work up.",
        },
      ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <JsonLd schema={buildServiceCollectionSchema(mdxItems, lang)} />
      <JsonLd schema={buildFaqSchema(faq)} />

      <ServicesGrid
        lang={lang}
        dictionary={dictionary}
        mdxItems={mdxItems}
      />

      <section
        className="px-6 pb-24"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className={`font-bold mb-8 ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "24px", color: "var(--color-primary-text)" }}
          >
            {isAr ? "أسئلة شائعة عن خدماتنا" : "Frequently Asked Questions"}
          </h2>

          {faq.map((item) => (
            <div key={item.question} className="mb-7">
              <h3
                className={`font-bold mb-2 ${isAr ? "font-ar" : "font-en"}`}
                style={{ fontSize: "17px", color: "var(--color-primary-text)" }}
              >
                {item.question}
              </h3>
              <p
                className={`leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                style={{ fontSize: "15px", color: "var(--color-secondary-text)" }}
              >
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
