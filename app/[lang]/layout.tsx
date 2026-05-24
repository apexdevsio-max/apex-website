import { ReactNode } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { Footer } from "@/components/layout/Footer";

const Header = dynamic(
  () => import("@/components/layout/Header").then((m) => m.Header),
  {
    ssr: true,
    loading: () => (
      <div
        className="w-full border-b border-apex-border"
        style={{
          height: "70px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--color-background)",
        }}
      />
    ),
  }
);

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
      <div
        data-header-placeholder
        className="w-full"
        style={{ height: "70px", flexShrink: 0 }}
      />

      <Header lang={lang} dictionary={dictionary} />

      <main
        className={`${isAr ? "font-ar" : "font-en"}`}
        dir={isAr ? "rtl" : "ltr"}
      >
        {children}
      </main>

      <Footer lang={lang} dictionary={dictionary} />
    </>
  );
}
