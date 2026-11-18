import { getBlogPosts, getPortfolioItems, getServices } from "@/lib/content/content-loader";
import { CATEGORIES } from "@/lib/content/taxonomy";
import type { Locale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import { socialLinks } from "@/data/social-links";

/**
 * llms.txt (https://llmstxt.org), generated from the same content the site
 * renders. The hand-maintained file drifted: it had two H1s, filed 30 articles
 * under "Blog Categories", and advertised services with no page behind them.
 */
export async function buildLlmsTxt(lang: Locale): Promise<string> {
  const isAr = lang === "ar";
  const [services, projects, posts] = await Promise.all([getServices(lang), getPortfolioItems(lang), getBlogPosts(lang)]);
  const link = (title: string, path: string, note?: string) => `- [${title}](${siteUrl}${path})${note ? `: ${note}` : ""}`;

  const lines: string[] = [
    "# APEX",
    "",
    isAr
      ? "> شركة برمجيات مقرّها سوريا تبني تطبيقات الجوال والمواقع وأنظمة الذكاء الاصطناعي بالعربية والإنجليزية، وتعمل عن بُعد مع عملاء حول العالم."
      : "> A software company based in Syria that builds mobile apps, websites and AI systems in Arabic and English, working remotely with clients around the world.",
    "",
    isAr
      ? `التواصل: واتساب ${socialLinks.whatsapp}، البريد ${socialLinks.email}. اللغات: العربية والإنجليزية. النسخة الإنجليزية: ${siteUrl}/llms.txt`
      : `Contact: WhatsApp ${socialLinks.whatsapp}, email ${socialLinks.email}. Languages: Arabic and English. Arabic version: ${siteUrl}/ar/llms.txt`,
    "",
    isAr ? "## الخدمات" : "## Services",
    ...services.map((s) => link(s.title, `/${lang}/services/${s.slug}`, s.summary)),
    "",
    isAr ? "## الأعمال" : "## Portfolio",
    ...projects.map((p) => link(p.title, `/${lang}/portfolio/${p.slug}`, p.summary)),
  ];

  for (const category of CATEGORIES) {
    const inCategory = posts.filter((post) => post.categories[0] === category.key);
    if (inCategory.length === 0) continue;
    // The pillar leads its cluster.
    inCategory.sort((a, b) => Number(b.slug === category.pillar) - Number(a.slug === category.pillar));
    lines.push("", `## ${category.label[lang]}`, ...inCategory.map((post) => link(post.title, `/${lang}/blog/${post.slug}`, post.excerpt)));
  }

  lines.push(
    "",
    "## Optional",
    link(isAr ? "من نحن" : "About", `/${lang}/about`),
    link(isAr ? "تواصل معنا" : "Contact", `/${lang}/contact`),
    link(isAr ? "خلاصة RSS" : "RSS feed", `/${lang}/blog/feed.xml`),
    ""
  );
  return lines.join("\n");
}

export function llmsResponse(body: string) {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=86400" },
  });
}
