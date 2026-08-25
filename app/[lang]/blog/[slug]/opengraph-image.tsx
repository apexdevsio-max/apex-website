import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { getBlogPostBySlug } from "@/lib/content/content-loader";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { CATEGORIES, getPostCategoryKeys } from "@/lib/content/taxonomy";
import { MOCK_POSTS, POST_META } from "@/lib/mock/blog-data";

/**
 * Per-article social preview card.
 *
 * Every article without an inline image fell back to the sitewide OG card, so 58
 * of 63 articles shared one identical picture: the same "APEX — Technology That
 * Speaks for You" panel on every LinkedIn share, WhatsApp unfurl, and Discover
 * entry. A preview that does not name the article is a preview nobody clicks, and
 * it is the single asset most likely to be seen by someone who has never seen the
 * site.
 *
 * Generating rather than commissioning is the point: 58 articles need 58 cards,
 * that number keeps growing, and a drawn image would be stale the moment a title
 * is edited. This renders from the article's own title at build time, so it can
 * never disagree with the page it represents.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#00BCD4";

/**
 * Satori rasterises the card itself and has no system fonts, so a face must be
 * supplied as a buffer. It also cannot parse WOFF2 — the repository ships both,
 * and these are the TTFs of the same IBM Plex faces the site renders in, so the
 * card matches the article it links to.
 */
async function loadFont(relative: string): Promise<ArrayBuffer> {
  const buffer = await readFile(path.join(process.cwd(), relative));
  return Uint8Array.from(buffer).buffer;
}

/**
 * Reverses the word order of a single-line Arabic run.
 *
 * `flexDirection: row-reverse` reorders flex children and leaves the text inside
 * each one untouched, so a phrase in its own node still comes out left-to-right
 * and has to be reversed here. Multi-line text uses layoutRtlLines instead,
 * which has to wrap before reversing.
 */
function layoutRtl(text: string): string {
  return text.trim().split(/\s+/).reverse().join(" ");
}

/**
 * Breaks an Arabic title into lines that are each independently reversed.
 *
 * Satori implements no bidi algorithm and ignores `direction: rtl` outright:
 * rendering one string with `direction: rtl`, with no direction, as a flex child
 * and as a block produced four identical results, every one of them laying the
 * words out left-to-right. Glyphs shape and join correctly — that is the font's
 * work — so only word order needs fixing.
 *
 * Reversing the whole string and letting Satori wrap it puts the lines in the
 * wrong order: the words that belong at the start of the title wrap onto the
 * last line, so the card reads bottom-up. Wrapping has to happen first, then
 * each line is reversed on its own, which is what a real bidi implementation
 * would arrive at for a paragraph of uniformly right-to-left text.
 *
 * The break points are chosen by character count because Satori exposes no text
 * measurement; the budget is deliberately conservative so a slightly wide line
 * still fits rather than spilling past the card edge.
 */
function layoutRtlLines(text: string, charsPerLine: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[][] = [[]];

  for (const word of words) {
    const current = lines[lines.length - 1];
    const width = current.reduce((sum, w) => sum + w.length + 1, 0) + word.length;
    // A word longer than the budget still has to go somewhere, so an empty line
    // always accepts one rather than looping forever.
    if (current.length > 0 && width > charsPerLine) lines.push([word]);
    else current.push(word);
  }

  return lines.map((line) => line.reverse().join(" "));
}

/**
 * A long title has to shrink or it overflows the card. Arabic runs shorter than
 * English at the same character count, so the thresholds are measured against the
 * rendered string rather than a word count.
 */
function titleSize(title: string, isAr: boolean): number {
  // Satori over-measures Arabic advance widths, so the same character count
  // occupies noticeably more of the card than its Latin equivalent and has to
  // step down earlier. These thresholds were set against the longest titles in
  // the archive, rendered and inspected rather than estimated.
  if (isAr) {
    if (title.length > 70) return 38;
    if (title.length > 50) return 44;
    if (title.length > 32) return 52;
    return 60;
  }
  if (title.length > 90) return 44;
  if (title.length > 60) return 54;
  if (title.length > 38) return 64;
  return 72;
}

/**
 * Characters that fit on one line at the size titleSize picks for this title.
 * Paired with it deliberately: a change to one without the other either wraps
 * early and wastes the card or overflows it.
 */
function arabicCharsPerLine(title: string): number {
  const size = titleSize(title, true);
  if (size >= 60) return 22;
  if (size >= 52) return 26;
  if (size >= 44) return 31;
  return 36;
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? toLocale(lang) : toLocale("en");
  const isAr = locale === "ar";

  // The card must never be the reason a build fails: a malformed article should
  // degrade to a branded card, not take the whole route down with it.
  let title = "";
  try {
    const post = await getBlogPostBySlug(locale, slug);
    title = post?.title ?? "";
  } catch {
    title = "";
  }
  if (!title) title = MOCK_POSTS[slug]?.[locale]?.title ?? "";

  const emoji = POST_META[slug]?.emoji ?? "";
  const accent = POST_META[slug]?.accentColor ?? ACCENT;
  const categoryKey = getPostCategoryKeys(slug)[0];
  const category = CATEGORIES.find((entry) => entry.key === categoryKey);
  const label = category?.label[locale] ?? (isAr ? "المدونة" : "Blog");

  const [arabicFont, latinFont] = await Promise.all([
    loadFont("fonts/arabic/IBMPlexSansArabic-Bold.ttf"),
    loadFont("fonts/english/IBMPlexSerif-Bold.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#121212,#1a1a2e)",
          padding: "64px 72px",
          // No `direction` here: Satori ignores it. Right-to-left order comes
          // from layoutRtl and from flex alignment instead.
          fontFamily: isAr ? "Plex Arabic" : "Plex Serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.06,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* A bar in the article's own accent colour, so a reader who follows the
            blog sees related articles share a colour before reading a word.
            Pinned to a physical edge: Satori does not resolve `insetInlineStart`
            against `direction`, so the logical property left the bar inside the
            padded box, painted over the wordmark. */}
        <div
          style={{
            position: "absolute",
            ...(isAr ? { right: 0 } : { left: 0 }),
            top: 0,
            bottom: 0,
            width: 12,
            display: "flex",
            background: accent,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            // The wordmark is Latin in both locales, so the row keeps its order
            // and is only pushed to the other edge.
            flexDirection: isAr ? "row-reverse" : "row",
            alignSelf: isAr ? "flex-end" : "flex-start",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, color: accent, letterSpacing: "4px" }}>
            APEX
          </div>
          <div style={{ display: "flex", width: 6, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
            {isAr ? layoutRtl(label) : label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            maxWidth: 1010,
            alignSelf: isAr ? "flex-end" : "flex-start",
            flexDirection: isAr ? "row-reverse" : "row",
            // Satori honours neither -webkit-line-clamp nor overflow, so the
            // shrinking in titleSize is the only thing keeping a long title
            // inside the card. The cap is measured against the tallest title in
            // the archive at its own size.
            maxHeight: 300,
          }}
        >
          {emoji ? (
            <div style={{ fontSize: 52, display: "flex", flexShrink: 0, lineHeight: 1 }}>{emoji}</div>
          ) : null}
          {isAr ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontSize: titleSize(title, isAr),
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.35,
              }}
            >
              {layoutRtlLines(title, arabicCharsPerLine(title)).map((line) => (
                <div key={line} style={{ display: "flex" }}>
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: titleSize(title, isAr),
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.3,
                display: "flex",
              }}
            >
              {title}
            </div>
          )}
        </div>

        {/* Mirrored with `flexDirection` so the domain stays on the outer edge in
            both locales; the Arabic tagline is reordered by layoutRtl. */}
        <div
          style={{
            display: "flex",
            flexDirection: isAr ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>
            apex.sy
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
            {isAr ? layoutRtl("تقنية تتحدث عنك") : "Technology That Speaks for You"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Plex Arabic", data: arabicFont, weight: 700, style: "normal" },
        { name: "Plex Serif", data: latinFont, weight: 700, style: "normal" },
      ],
    }
  );
}
