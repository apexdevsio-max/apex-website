// file: app/[lang]/blog/page.tsx
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getDictionary } from "@/lib/i18n/i18n";
import { getBlogPosts }  from "@/lib/content/content-loader";
import { isLocale }      from "@/lib/i18n/locale";
import { BlogGrid }      from "@/components/sections/BlogGrid";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return {
    title: isAr ? "المدونة — APEX" : "Blog — APEX",
    description: isAr
      ? "مقالات تقنية متخصصة في تطوير الويب والموبايل والذكاء الاصطناعي."
      : "Technical articles on web development, mobile, and AI.",
  };
}

export default async function BlogPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const dictionary = await getDictionary(lang);
  const mdxPosts   = await getBlogPosts(lang);

  return <BlogGrid lang={lang} dictionary={dictionary} mdxPosts={mdxPosts} />;
}