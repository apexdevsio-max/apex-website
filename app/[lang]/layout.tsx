import { ReactNode, Suspense } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam;
  const dictionary = await getDictionary(lang);
  const isAr = lang === "ar";

  return (
    <>
      <Suspense fallback={<div className="h-18 border-b border-apex-border" />}>
        <Header lang={lang} dictionary={dictionary} />
      </Suspense>

      <main
        className={`pt-18 ${isAr ? "font-ar" : "font-en"}`}
        dir={isAr ? "rtl" : "ltr"}
      >
        {children}
      </main>

      <Footer lang={lang} dictionary={dictionary} />
    </>
  );
} 