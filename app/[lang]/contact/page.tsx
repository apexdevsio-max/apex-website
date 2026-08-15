import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/ContactSection";
import { ContactForm } from "@/components/contact/ContactForm";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "تواصل معنا — اطلب عرض سعر" : "Contact Us — Request a Project Quote",
    description: isAr
      ? "تواصل مع فريق APEX عبر نموذج تواصل ذكي أو واتساب أو البريد الإلكتروني."
      : "Get in touch with the APEX team via our smart form, WhatsApp, or email.",
    path: `/${lang}/contact`,
    keywords: isAr
      ? ["تواصل معنا", "طلب عرض سعر", "استشارة تقنية", "شركة برمجيات", "تقييم مشروع"]
      : ["contact us", "request a quote", "technical consultation", "software company", "project assessment"],
  });
}

export default async function ContactPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam as "en" | "ar";
  const dictionary = await getDictionary(lang);
  const isAr = lang === "ar";

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "تواصل معنا" : "Contact Us", url: `${siteUrl}/${lang}/contact` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildLocalBusinessSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      {/* ContactSection leads with an <h2> because it is also rendered on the
          homepage, where the hero owns the <h1>. Visually hidden here so the
          standalone page still has exactly one <h1>. */}
      <h1 className="sr-only">{isAr ? "تواصل مع APEX" : "Contact APEX"}</h1>
      <ContactSection
        lang={lang}
        dictionary={dictionary}
        whatsapp={socialLinks.whatsapp}
      />

      {/* ContactSection is the shared homepage form block, which on its own left
          this page too thin to rank. This copy sets expectations for what happens
          after someone gets in touch. */}
      <section
        className="px-6 pb-24"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-3xl mx-auto">
          {(isAr
            ? [
                {
                  heading: "ماذا يحدث بعد أن تتواصل معنا",
                  body: "نردّ عادة خلال يوم عمل واحد. الردّ الأول ليس عرض سعر بل أسئلة توضيحية عن مشروعك، لأن أي رقم يُعطى قبل فهم النطاق يكون تخميناً. بعد ذلك نتفق على مكالمة قصيرة لتحديد النطاق، ثم نرسل عرضاً مكتوباً مقسّماً على مراحل.",
                },
                {
                  heading: "ما الذي يفيدنا معرفته مسبقاً",
                  body: "المشكلة التي تريد حلّها، ومن سيستخدم المنتج، وأي موعد نهائي مرتبط بحدث أو موسم، والميزانية التقريبية إن كانت محدّدة. لا نحتاج مستند متطلبات جاهزاً — الفكرة المكتوبة في بضع جمل كافية للبدء.",
                },
                {
                  heading: "إن كنت تستكشف الخيارات فقط",
                  body: "لا مانع لدينا من محادثة استكشافية دون التزام. وإن كان سؤالك عن التكاليف أو المقارنات التقنية، فقد تجد إجابة مباشرة في مدونتنا التي تغطي أسعار السوق الخليجي ومقارنات أطر العمل ومتطلبات الامتثال المحلية.",
                },
              ]
            : [
                {
                  heading: "What happens after you get in touch",
                  body: "We usually reply within one business day. That first reply is not a quote but clarifying questions about your project, because any figure given before the scope is understood is guesswork. From there we arrange a short scoping call, then send a written proposal broken into phases.",
                },
                {
                  heading: "What helps us to know upfront",
                  body: "The problem you want solved, who will use the product, any deadline tied to an event or season, and a rough budget if you have one. You do not need a finished requirements document — a few sentences describing the idea is enough to start.",
                },
                {
                  heading: "If you are just exploring options",
                  body: "An exploratory conversation with no commitment is fine. If your question is about costs or technical comparisons, our blog may answer it directly — it covers Gulf market pricing, framework comparisons, and local compliance requirements.",
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
      <section
        className="relative py-16 md:py-24 px-6"
        style={{ background: "var(--color-background)" }}
      >
        <div className="max-w-2xl mx-auto">
          <ContactForm lang={lang} dictionary={dictionary} />
        </div>
      </section>
    </>
  );
}
