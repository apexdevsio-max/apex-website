import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { socialLinks } from "@/data/social-links";
import { isLocale, toLocale, type Locale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ lang: string }> };

function content(lang: Locale) {
  const email = socialLinks.email;
  if (lang === "ar") {
    return {
      title: "شروط الاستخدام",
      intro: "تنطبق هذه الشروط على استخدامك لموقع apex.sy. أما العمل على المشاريع فيحكمه العقد الموقّع لكل مشروع.",
      sections: [
        {
          heading: "محتوى الموقع",
          paragraphs: [
            "المقالات والأدلة للمعلومات العامة. نطاقات الأسعار تقديرية ومؤرخة، وليست عرض سعر. والأدلة المتعلقة بالأنظمة والقوانين مكتوبة من منظور تقني وليست استشارة قانونية؛ راجع مستشاراً قانونياً قبل أي قرار امتثال.",
            "نبذل جهدنا لإبقاء المحتوى صحيحاً ومحدّثاً، لكن الأنظمة والأسعار تتغير. إن وجدت معلومة خاطئة، راسلنا لنصححها.",
          ],
        },
        {
          heading: "الملكية الفكرية",
          paragraphs: [
            "نصوص الموقع وتصميمه وشعاره ملك لـ APEX. يمكنك الاقتباس من المقالات مع ذكر المصدر ورابط للصفحة.",
            "تبقى حقوق صور مشاريع العملاء المعروضة في معرض الأعمال لأصحابها. وملكية الكود والمخرجات في مشاريع العملاء يحددها عقد كل مشروع.",
          ],
        },
        {
          heading: "حدود المسؤولية",
          paragraphs: [
            "يُقدَّم الموقع ومحتواه كما هو. لا نتحمل مسؤولية أي خسارة تنتج عن الاعتماد على محتوى الموقع دون اتفاق مكتوب معنا.",
            "قد تحتوي الصفحات على روابط لمواقع خارجية لا نتحكم بها ولسنا مسؤولين عن محتواها.",
          ],
        },
        { heading: "الاستخدام المقبول", paragraphs: ["لا تستخدم نموذج التواصل لإرسال رسائل مزعجة أو محتوى ضار، ولا تحاول تعطيل الموقع أو الوصول غير المصرّح به إلى أنظمته."] },
        { heading: "التعديلات والتواصل", paragraphs: [`قد نحدّث هذه الشروط ونغيّر تاريخ «آخر تحديث» أعلاه. للاستفسار: ${email}.`] },
      ],
    };
  }
  return {
    title: "Terms of Use",
    intro: "These terms cover your use of apex.sy. Project work is governed by the contract signed for each project.",
    sections: [
      {
        heading: "Website content",
        paragraphs: [
          "Articles and guides are general information. Price ranges are dated estimates, not quotes. Guides about regulation are written from an engineering perspective and are not legal advice; consult a lawyer before any compliance decision.",
          "We work to keep content accurate and current, but regulations and prices change. If you find an error, tell us and we will correct it.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "The site's text, design and logo belong to APEX. You may quote articles with attribution and a link to the page.",
          "Rights in images of client projects shown in the portfolio stay with their owners. Ownership of code and deliverables in client work is set by each project's contract.",
        ],
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          "The site and its content are provided as is. We are not liable for losses arising from reliance on site content without a written agreement with us.",
          "Pages may link to external sites we do not control and are not responsible for.",
        ],
      },
      { heading: "Acceptable use", paragraphs: ["Do not use the contact form to send spam or harmful content, and do not try to disrupt the site or access its systems without permission."] },
      { heading: "Changes and contact", paragraphs: [`We may update these terms and the date above. Questions: ${email}.`] },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "شروط الاستخدام" : "Terms of Use",
    description: isAr
      ? "شروط استخدام موقع APEX: طبيعة المحتوى، والملكية الفكرية، وحدود المسؤولية، والاستخدام المقبول."
      : "Terms for using the APEX website: the nature of the content, intellectual property, limitation of liability and acceptable use.",
    path: `/${lang}/terms`,
  });
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = content(lang);
  return (
    <>
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: lang === "ar" ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
          { name: copy.title, url: `${siteUrl}/${lang}/terms` },
        ])}
      />
      <LegalPage lang={lang} title={copy.title} intro={copy.intro} sections={copy.sections} />
    </>
  );
}
