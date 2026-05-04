import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/locale";

export default async function LegacyPortfolioItemRedirect({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const safeLang = isLocale(lang) ? lang : "en";
  redirect(`/${safeLang}/portfolio/${slug}`);
}
