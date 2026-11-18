import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { socialLinks } from "@/data/social-links";
import { isLocale, toLocale, type Locale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ lang: string }> };

/**
 * Describes what the site's code actually does with personal data. Every
 * processor named here is wired up in the codebase: the contact API (Resend,
 * Upstash), the consent banner (Google Analytics, Vercel Speed Insights), and
 * browser storage (theme, consent, language).
 */
function content(lang: Locale) {
  const email = socialLinks.email;
  const whatsapp = socialLinks.whatsapp;
  if (lang === "ar") {
    return {
      title: "سياسة الخصوصية",
      intro: `توضّح هذه السياسة البيانات التي يجمعها موقع APEX (apex.sy)، ولماذا، ومع من نشاركها، وكيف تمارس حقوقك. للتواصل بشأن الخصوصية: ${email}.`,
      sections: [
        { heading: "من نحن", paragraphs: [`APEX شركة برمجيات مقرّها سوريا، وهي الجهة المسؤولة عن البيانات التي تُجمع عبر هذا الموقع. يمكنك مراسلتنا على ${email} أو عبر واتساب على ${whatsapp}.`] },
        {
          heading: "ما الذي نجمعه ولماذا",
          paragraphs: [
            "نموذج التواصل: الاسم والبريد الإلكتروني ونوع المشروع ووصفه، ورقم الهاتف والميزانية إن أدخلتهما. نستخدمها للرد على استفسارك وإعداد عرض. الأساس: طلبك أنت.",
            "الحماية من الإساءة: عند إرسال النموذج نحفظ بصمة مشفّرة (hash) لعنوان IP لمدة ساعة واحدة لتحديد عدد الرسائل المسموح بها. لا نحفظ العنوان نفسه.",
            "التحليلات (فقط بعد موافقتك): Google Analytics 4 لقياس الزيارات، وVercel Speed Insights لقياس سرعة الصفحات. لا يُحمَّل أي منهما قبل أن تضغط «موافق».",
            "التواصل المباشر: إن راسلتنا عبر واتساب أو البريد، فإن ما ترسله يُعالَج وفق سياسات تلك الخدمات بالإضافة إلى هذه السياسة.",
          ],
        },
        {
          heading: "مع من نشارك البيانات",
          paragraphs: [
            "Vercel: استضافة الموقع، وتسجّل سجلات تقنية قياسية للطلبات.",
            "Resend: إيصال رسائل نموذج التواصل إلى بريدنا.",
            "Upstash: تخزين البصمة المشفّرة لعنوان IP لمدة ساعة لأغراض تحديد معدل الإرسال.",
            "Google وVercel: أدوات التحليلات أعلاه، فقط بعد موافقتك.",
            "لا نبيع البيانات الشخصية ولا نشاركها لأغراض إعلانية. قد تُعالَج البيانات خارج بلدك لدى هؤلاء المزوّدين.",
          ],
        },
        {
          heading: "مدة الاحتفاظ",
          paragraphs: [
            "رسائل نموذج التواصل: طوال مدة الحاجة للرد على الاستفسار، ثم حتى 24 شهراً، ما لم يتطلب عقد قائم مدة أطول.",
            "بصمة عنوان IP: ساعة واحدة.",
            "بيانات التحليلات: وفق مدة الاحتفاظ المضبوطة في حساب Google Analytics، وبحد أقصى 14 شهراً.",
          ],
        },
        {
          heading: "ما يُحفظ في متصفحك",
          paragraphs: [
            "نحفظ في التخزين المحلي لمتصفحك اختيارك للوضع الفاتح أو الداكن، وقرارك بشأن التحليلات. ونحفظ ملف تعريف ارتباط باسم NEXT_LOCALE لمدة سنة يتذكّر اللغة التي اخترتها. وعند الموافقة على التحليلات تضع Google ملفات تعريف الارتباط الخاصة بها.",
          ],
        },
        {
          heading: "حقوقك",
          paragraphs: [
            `يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، أو الاعتراض على معالجتها، بمراسلتنا على ${email}. نردّ خلال 30 يوماً.`,
            "يمكنك سحب موافقتك على التحليلات في أي وقت من رابط «إعدادات الخصوصية» أسفل كل صفحة.",
            "بحسب البلد الذي تقيم فيه، قد تمنحك قوانين حماية البيانات المحلية حقوقاً إضافية، ويحق لك تقديم شكوى إلى الجهة المختصة في بلدك.",
          ],
        },
        { heading: "التعديلات", paragraphs: ["عند تغيير هذه السياسة نحدّث تاريخ «آخر تحديث» أعلاه. التغييرات الجوهرية نعلنها على هذه الصفحة."] },
      ],
    };
  }
  return {
    title: "Privacy Policy",
    intro: `This policy explains what personal data the APEX website (apex.sy) collects, why, who we share it with, and how to exercise your rights. Privacy questions: ${email}.`,
    sections: [
      { heading: "Who we are", paragraphs: [`APEX is a software company based in Syria and is responsible for the data collected through this website. You can reach us at ${email} or on WhatsApp at ${whatsapp}.`] },
      {
        heading: "What we collect and why",
        paragraphs: [
          "Contact form: your name, email address, project type and description, and your phone number and budget if you enter them. We use them to reply to your enquiry and prepare a proposal, at your request.",
          "Abuse protection: when you submit the form we store a one-way hash of your IP address for one hour to limit how many messages can be sent. We do not store the address itself.",
          "Analytics, only after you consent: Google Analytics 4 to measure visits, and Vercel Speed Insights to measure page speed. Neither loads until you select Accept.",
          "Direct contact: if you message us on WhatsApp or by email, what you send is also handled under those services' own policies.",
        ],
      },
      {
        heading: "Who we share data with",
        paragraphs: [
          "Vercel hosts the website and keeps standard technical request logs.",
          "Resend delivers contact form messages to our inbox.",
          "Upstash stores the hashed IP address for one hour for rate limiting.",
          "Google and Vercel provide the analytics above, only after you consent.",
          "We do not sell personal data or share it for advertising. These providers may process data outside your country.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Contact form messages: for as long as needed to answer the enquiry, then up to 24 months, unless an active contract requires longer.",
          "IP address hash: one hour.",
          "Analytics data: for the retention period set in our Google Analytics account, at most 14 months.",
        ],
      },
      {
        heading: "What is stored in your browser",
        paragraphs: [
          "Your browser's local storage keeps your light or dark theme choice and your analytics decision. A cookie named NEXT_LOCALE remembers the language you chose, for one year. If you accept analytics, Google sets its own cookies.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          `You can ask to access, correct or delete your data, or object to its processing, by emailing ${email}. We reply within 30 days.`,
          "You can withdraw analytics consent at any time with the Privacy settings link at the bottom of every page.",
          "Depending on where you live, local data protection law may give you further rights, and you may complain to the regulator in your country.",
        ],
      },
      { heading: "Changes", paragraphs: ["When this policy changes we update the date above. Material changes are announced on this page."] },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(toLocale(lang), {
    title: isAr ? "سياسة الخصوصية" : "Privacy Policy",
    description: isAr
      ? "ما البيانات التي يجمعها موقع APEX، ولماذا، ومع من نشاركها، ومدة الاحتفاظ بها، وكيف تطلب الاطلاع عليها أو حذفها."
      : "What data the APEX website collects, why, who we share it with, how long we keep it, and how to access or delete it.",
    path: `/${lang}/privacy`,
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = content(lang);
  return (
    <>
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: lang === "ar" ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
          { name: copy.title, url: `${siteUrl}/${lang}/privacy` },
        ])}
      />
      <LegalPage lang={lang} title={copy.title} intro={copy.intro} sections={copy.sections} />
    </>
  );
}
