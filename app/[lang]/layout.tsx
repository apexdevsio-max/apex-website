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
      <Suspense
        fallback={
          <div
            className="border-b border-apex-border w-full"
            style={{ height: "70px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
          />
        }
      >
        <Header lang={lang} dictionary={dictionary} />
      </Suspense>

      <main
        className={`${isAr ? "font-ar" : "font-en"}`}
        style={{ paddingTop: "70px" }}
        dir={isAr ? "rtl" : "ltr"}
      >
        {children}
      </main>

      <Footer lang={lang} dictionary={dictionary} />
    </>
  );
}
