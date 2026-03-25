
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getDictionary }      from "@/lib/i18n/i18n";
import { getAcademyCourses }  from "@/lib/content/content-loader";
import { isLocale }           from "@/lib/i18n/locale";
import { AcademyGrid }        from "@/components/sections/AcademyGrid";
import { buildPageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "الأكاديمية — APEX" : "Academy — APEX",
    description: isAr
      ? "أكاديمية APEX لتعلّم تطوير الويب والموبايل والذكاء الاصطناعي."
      : "APEX Academy for learning web, mobile, and AI development.",
    path: `/${lang}/academy`,
  });
}

export default async function AcademyPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const dictionary = await getDictionary(lang);
  const mdxCourses = await getAcademyCourses(lang);

  return <AcademyGrid lang={lang} dictionary={dictionary} mdxCourses={mdxCourses} />;
}
