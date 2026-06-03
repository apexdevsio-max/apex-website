
/* Path: app/[lang]/academy/page.tsx */
import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { getAcademyCourses }  from "@/lib/content/content-loader";
import { isLocale }           from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { JsonLd, buildOrganizationSchema, buildBreadcrumbSchema } from "@/lib/seo/schema";

const AcademyGrid = dynamic(
  () => import("@/components/sections/AcademyGrid").then((m) => m.AcademyGrid),
  { ssr: true }
);

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "الأكاديمية - APEX" : "Academy - APEX",
    description: isAr
      ? "أكاديمية APEX لتعلم تطوير الويب والموبايل والذكاء الاصطناعي." : "APEX Academy for learning web, mobile, and AI development.",
    path: `/${lang}/academy`,
  });
}

export default async function AcademyPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const isAr       = lang === "ar";
  const mdxCourses = await getAcademyCourses(lang);

  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "الأكاديمية" : "Academy", url: `${siteUrl}/${lang}/academy` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <AcademyGrid lang={lang} mdxCourses={mdxCourses} />
    </>);
}
