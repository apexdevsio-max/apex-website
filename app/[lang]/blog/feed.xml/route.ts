import { getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import { getPrimaryCategory } from "@/lib/content/taxonomy";
import { stripBodyTitle } from "@/components/content/MarkdownContent";

/** RSS 2.0 feed per locale, at /<lang>/blog/feed.xml, with full article text. */
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

/** A CDATA section cannot contain "]]>", so it is split across two sections. */
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return new Response("Not found", { status: 404 });

  const isAr = lang === "ar";
  const posts = await getBlogPosts(lang);
  const feedUrl = `${siteUrl}/${lang}/blog/feed.xml`;
  const lastBuild = toRfc822(posts.map((post) => post.dateModified ?? post.datePublished ?? "").sort().at(-1));

  const items = posts.map((post) => {
    const url = `${siteUrl}/${lang}/blog/${post.slug}`;
    const pubDate = toRfc822(post.datePublished);
    const category = getPrimaryCategory(post)?.label[lang];
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(post.excerpt)}</description>`,
      // The article body as Markdown, so readers are not left with a teaser.
      `      <content:encoded>${cdata(stripBodyTitle(post.content))}</content:encoded>`,
      `      <dc:creator>${isAr ? "فريق APEX" : "APEX team"}</dc:creator>`,
      ...(category ? [`      <category>${escapeXml(category)}</category>`] : []),
      ...(pubDate ? [`      <pubDate>${pubDate}</pubDate>`] : []),
      "    </item>",
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(isAr ? "مدونة APEX" : "APEX blog")}</title>`,
    `    <link>${escapeXml(`${siteUrl}/${lang}/blog`)}</link>`,
    `    <description>${escapeXml(
      isAr ? "أدلة عملية في تطوير التطبيقات والمواقع وتكاليفها في الخليج" : "Practical guides to app and web development in the Gulf"
    )}</description>`,
    `    <language>${lang}</language>`,
    ...(lastBuild ? [`    <lastBuildDate>${lastBuild}</lastBuildDate>`] : []),
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
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
