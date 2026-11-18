import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

import { ContactForm } from "@/components/contact/ContactForm";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { buildOrganizationSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "تواصل معنا — اطلب تقييماً لمشروعك" : "Contact Us — Request a Project Assessment",
    description: isAr
      ? "راسل فريق APEX عبر النموذج أو واتساب أو البريد الإلكتروني. نردّ خلال يوم عمل واحد بأسئلة توضيحية ثم عرض مكتوب."
      : "Message the APEX team by form, WhatsApp or email. We reply within one business day with scoping questions, then a written proposal.",
    path: `/${lang}/contact`,
  });
}

const NEXT_STEPS = {
  en: [
    {
      heading: "What happens after you get in touch",
      body: "We reply within one business day. The first reply is not a quote but a few clarifying questions, because any figure given before the scope is understood is guesswork. Then a short scoping call, then a written proposal broken into phases.",
    },
    {
      heading: "What helps us to know upfront",
      body: "The problem you want solved, who will use the product, any deadline tied to an event or season, and a rough budget if you have one. A few sentences describing the idea is enough to start.",
    },
    {
      heading: "Just exploring?",
      body: "An exploratory conversation with no commitment is fine. If your question is about costs or technical comparisons, the blog covers pricing, framework comparisons, Arabic localisation and compliance.",
    },
  ],
  ar: [
    {
      heading: "ماذا يحدث بعد أن تتواصل معنا",
      body: "نردّ خلال يوم عمل واحد. الردّ الأول ليس عرض سعر بل أسئلة توضيحية، لأن أي رقم قبل فهم النطاق تخمين. بعدها مكالمة قصيرة لتحديد النطاق، ثم عرض مكتوب مقسّم على مراحل.",
    },
    {
      heading: "ما الذي يفيدنا معرفته مسبقاً",
      body: "المشكلة التي تريد حلّها، ومن سيستخدم المنتج، وأي موعد مرتبط بحدث أو موسم، والميزانية التقريبية إن وُجدت. بضع جمل تصف الفكرة تكفي للبدء.",
    },
    {
      heading: "تستكشف الخيارات فقط؟",
      body: "لا مانع من محادثة استكشافية دون التزام. وإن كان سؤالك عن التكاليف أو المقارنات التقنية، فالمدونة تغطي الأسعار ومقارنات الأطر والتعريب ومتطلبات الامتثال.",
    },
  ],
} as const;

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);
  const isAr = lang === "ar";
  const whatsappDigits = socialLinks.whatsapp.replace(/[^\d]/g, "");

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "تواصل معنا" : "Contact Us", url: `${siteUrl}/${lang}/contact` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />

      <section className="px-6 pt-10 pb-20 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 max-w-2xl">
            <h1 className="apex-page-title">{dictionary.contact.title}</h1>
            <p className="mt-3 text-lg text-apex-muted">
              {isAr
                ? "اكتب لنا عن مشروعك. نردّ خلال يوم عمل واحد."
                : "Tell us about your project. We reply within one business day."}
            </p>
          </header>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <ContactForm lang={lang} form={dictionary.contact.form} />

            <aside className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-apex-border bg-apex-card p-4 hover:border-apex-primary transition-colors"
                >
                  <MessageCircle size={22} aria-hidden="true" className="shrink-0 text-apex-primary" />
                  <span className="flex flex-col">
                    <span className="font-bold text-apex-text">WhatsApp</span>
                    <span dir="ltr" className="text-apex-muted">{socialLinks.whatsapp}</span>
                  </span>
                </a>
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-apex-border bg-apex-card p-4 hover:border-apex-primary transition-colors"
                >
                  <Mail size={22} aria-hidden="true" className="shrink-0 text-apex-primary" />
                  <span className="flex flex-col min-w-0">
                    <span className="font-bold text-apex-text">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                    <span dir="ltr" className="text-apex-muted break-all">{socialLinks.email}</span>
                  </span>
                </a>
              </div>

              {NEXT_STEPS[lang].map((item) => (
                <div key={item.heading}>
                  <h2 className="mb-2 text-lg font-bold text-apex-text">{item.heading}</h2>
                  <p className="text-base leading-relaxed text-apex-muted">{item.body}</p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
