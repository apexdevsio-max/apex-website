import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { AboutSection } from "@/components/sections/AboutSection";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { JsonLd, buildOrganizationSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "من نحن — فريقنا ورؤيتنا" : "About Us — Our Team and Vision",
    description: isAr
      ? "شركة APEX للبرمجيات تبني حلولاً رقمية متكاملة. تعرف على رؤيتنا وفريقنا وقيمنا."
      : "APEX is a software company building integrated digital solutions. Learn about our vision, team, and values.",
    path: `/${lang}/about`,
    keywords: isAr
      ? ["شركة برمجيات", "عن APEX", "فريق تطوير", "شركة تقنية", "تطوير برمجيات الخليج"]
      : ["software company", "about APEX", "development team", "Gulf software company", "technology partner"],
  });
}

export default async function AboutPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);

  const isAr = lang === "ar";
  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "من نحن" : "About Us", url: `${siteUrl}/${lang}/about` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      {/* AboutSection leads with an <h2> because it is also rendered mid-page on
          the homepage, where the hero owns the <h1>. On this standalone page that
          left no <h1> at all, so the page heading lives here — visually hidden to
          keep the existing design, but present for crawlers and screen readers. */}
      <h1 className="sr-only">{isAr ? "من نحن — APEX" : "About APEX"}</h1>
      <AboutSection lang={lang} dictionary={dictionary} />

      {/* AboutSection is a shared homepage block built from short slogans and stat
          chips, which left this standalone page too thin to rank. This section
          carries the substantive copy that belongs only here. */}
      <section
        className="px-6 pb-24"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-3xl mx-auto">
          {(isAr
            ? [
                {
                  heading: "كيف نعمل",
                  body: "نبدأ كل مشروع بجلسة تحديد نطاق نفهم فيها المشكلة التي تريد حلّها قبل الحديث عن التقنية أو التصميم. ثم نقسّم العمل إلى مراحل واضحة لكل منها مخرجات قابلة للمراجعة، فتبقى على اطّلاع دائم على ما أُنجز وما تبقّى، ولا تنتظر حتى نهاية المشروع لترى النتيجة.",
                },
                {
                  heading: "لماذا نركّز على العربية",
                  body: "معظم أدوات التطوير مبنية على افتراض اللغة الإنجليزية واتجاه الكتابة من اليسار إلى اليمين، وما يترتب على ذلك من مشاكل — تكسّر تنسيق النصوص المختلطة، وخطوط لا تدعم التشكيل، وتواريخ هجرية تُحسب خطأً — يظهر متأخراً وإصلاحه مكلف. نتعامل مع دعم العربية كقرار معماري يُتخذ في البداية لا كطبقة تُضاف في النهاية.",
                },
                {
                  heading: "ما نبنيه",
                  body: "نعمل على تطبيقات الموبايل باستخدام Flutter، ومواقع الويب والمتاجر الإلكترونية، وحلول الذكاء الاصطناعي التطبيقية مثل المساعدات الذكية ومعالجة المستندات. القاسم المشترك بينها أنها أنظمة تُستخدم يومياً في التشغيل الفعلي، لا نماذج أولية تُعرض ثم تُهمل.",
                },
                {
                  heading: "الشفافية في التسعير والملكية",
                  body: "نقدّم عروضاً مقسّمة على مراحل توضّح ما يقابل كل مبلغ، وننبّه مبكراً إلى التكاليف التشغيلية المستمرة التي تغفلها العروض عادة مثل الاستضافة ورسوم المتاجر وبوابات الدفع. وعند اكتمال المشروع تنتقل ملكية الكود المصدري إليك بالكامل مع التوثيق اللازم.",
                },
              ]
            : [
                {
                  heading: "How we work",
                  body: "Every project starts with a scoping session where we work out the problem you are actually solving before discussing technology or design. We then split the work into clear phases, each with reviewable output, so you can see progress throughout instead of waiting until the end to find out what was built.",
                },
                {
                  heading: "Why we focus on Arabic",
                  body: "Most development tooling assumes English and left-to-right text. The problems that follow — mixed Arabic-Latin strings breaking layout, fonts without proper diacritic support, Hijri dates calculated incorrectly — surface late and are expensive to retrofit. We treat Arabic and RTL support as an architectural decision made at the start, not a layer added at the end.",
                },
                {
                  heading: "What we build",
                  body: "We work on mobile applications using Flutter, websites and e-commerce platforms, and applied AI such as Arabic-capable assistants and document processing. What they share is that they are systems used in daily operation, not prototypes that get demonstrated once and then abandoned.",
                },
                {
                  heading: "Transparency on cost and ownership",
                  body: "We quote in itemised phases that show what each amount covers, and flag the recurring operational costs that quotes usually omit — hosting, app store fees, payment gateway charges. On completion, full ownership of the source code transfers to you along with the documentation needed to maintain it.",
                },
              ]
          ).map((item) => (
            <div key={item.heading} className="mb-8">
              <h2
                className={`font-bold mb-3 ${isAr ? "font-ar" : "font-en"}`}
                style={{ fontSize: "20px", color: "var(--color-primary-text)" }}
              >
                {item.heading}
              </h2>
              <p
                className={`leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                style={{ fontSize: "15px", color: "var(--color-secondary-text)" }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
