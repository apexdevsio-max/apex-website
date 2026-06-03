import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { JsonLd, buildBreadcrumbSchema } from "@/lib/seo/schema";

type Props = { params: Promise<{ lang: string }> };

const CONTENT = {
  en: {
    title: "Privacy Policy — APEX",
    heading: "Privacy Policy",
    updated: "Last updated: March 14, 2026",
    body: [
      "We respect your privacy and only collect the minimum data needed to deliver our services.",
      "Contact details you share are used solely to respond to your requests.",
      "You can request deletion of your data at any time by contacting us.",
    ],
  },
  ar: {
    title: "سياسة الخصوصية — APEX",
    heading: "سياسة الخصوصية",
    updated: "آخر تحديث: 14 مارس 2026",
    body: [
      "نحترم خصوصيتك ولا نجمع إلا الحد الأدنى من البيانات اللازمة لتقديم خدماتنا.",
      "بيانات التواصل التي تشاركها تُستخدم فقط للرد على استفساراتك.",
      "يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا.",
    ],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "سياسة الخصوصية — APEX" : "Privacy Policy — APEX",
    description: isAr
      ? "سياسة الخصوصية الخاصة بشركة APEX للبرمجيات."
      : "APEX Software privacy policy.",
    path: `/${lang}/privacy`,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const isAr = lang === "ar";
  const copy = CONTENT[lang];

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "سياسة الخصوصية" : "Privacy Policy", url: `${siteUrl}/${lang}/privacy` },
  ];

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <div className="px-6 py-20 max-w-3xl mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
        <h1 className="text-4xl font-bold mb-4">{copy.heading}</h1>
        <p className="text-apex-muted mb-8">{copy.updated}</p>
        <div className="space-y-4 text-apex-muted leading-relaxed">
          {copy.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </>
  );
}
