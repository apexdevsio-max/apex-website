import { getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import { buildBlogCards } from "@/lib/content/blog-view";

/**
 * RSS 2.0 feed per locale, at /<lang>/blog/feed.xml.
 *
 * A feed is the cheapest discovery channel there is: aggregators, newsreaders and
 * Bing's feed crawler all poll it, so new articles get picked up without waiting
 * for the next sitemap fetch. It matters more as publishing cadence rises — at
 * several articles a week, sitemap-only discovery leaves recent work unindexed
 * for days.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

/** The five characters that are not legal as raw text inside XML. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string | undefined): string | undefined {
  if (!date) return undefined;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toUTCString();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) {
    return new Response("Not found", { status: 404 });
  }

  const lang = langParam;
  const isAr = lang === "ar";
  const cards = buildBlogCards(await getBlogPosts(lang), lang);

  const title = isAr ? "مدونة APEX" : "APEX Blog";
  const description = isAr
    ? "أدلة عملية في تطوير التطبيقات والمواقع وتكاليفها في الخليج"
    : "Practical guides to app and web development in the Gulf";
  const feedUrl = `${siteUrl}/${lang}/blog/feed.xml`;

  const items = cards
    .map((card) => {
      const url = `${siteUrl}/${lang}/blog/${card.slug}`;
      const pubDate = toRfc822(card.date);
      return [
        "    <item>",
        `      <title>${escapeXml(card.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <description>${escapeXml(card.excerpt)}</description>`,
        ...(pubDate ? [`      <pubDate>${pubDate}</pubDate>`] : []),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(`${siteUrl}/${lang}/blog`)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${lang}</language>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
