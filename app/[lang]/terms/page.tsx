import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/locale";

type Props = { params: Promise<{ lang: string }> };

const CONTENT = {
  en: {
    title: "Terms of Service — APEX",
    heading: "Terms of Service",
    updated: "Last updated: March 14, 2026",
    body: [
      "By using our site, you agree to use it lawfully and respectfully.",
      "Project timelines and deliverables are defined in individual agreements.",
      "All delivered work remains protected by intellectual property laws.",
    ],
  },
  ar: {
    title: "شروط الاستخدام — APEX",
    heading: "شروط الاستخدام",
    updated: "آخر تحديث: 14 مارس 2026",
    body: [
      "باستخدام موقعنا، فإنك توافق على استخدامه بشكل قانوني ومحترم.",
      "الجداول الزمنية والتسليمات تُحدد ضمن الاتفاقيات الخاصة بكل مشروع.",
      "جميع الأعمال المسلّمة محمية بموجب قوانين الملكية الفكرية.",
    ],
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: CONTENT[lang].title,
  };
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const copy = CONTENT[lang];

  return (
    <main className="px-6 py-20 max-w-3xl mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-4xl font-bold mb-4">{copy.heading}</h1>
      <p className="text-apex-muted mb-8">{copy.updated}</p>
      <div className="space-y-4 text-apex-muted leading-relaxed">
        {copy.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </main>
  );
}
