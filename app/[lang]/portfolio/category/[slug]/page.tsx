import { permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/locale";

// This route only exists to catch the old /portfolio/category/<slug> URLs.
// `redirect()` emits a temporary 307, which tells search engines to keep the old
// URL indexed and passes no ranking signal to the destination. These moves are
// permanent, so 308 is what actually consolidates the two URLs.
export default async function LegacyPortfolioItemRedirect({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const safeLang = isLocale(lang) ? lang : "en";
  permanentRedirect(`/${safeLang}/portfolio/${slug}`);
}
