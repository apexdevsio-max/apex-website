import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import type { Locale } from "@/lib/i18n/locale";

/**
 * Shared renderer for every social preview card on the site.
 *
 * The three card routes used to build their own JSX. Only the blog card loaded a
 * font, so the sitewide and service cards handed Arabic text to Satori with no
 * Arabic face: it either rendered reversed, unjoined letters or threw
 * `lookupType: 5 - substFormat: 3 is not yet supported` from the fallback font,
 * which surfaced in production as HTTP 500 on every Arabic page's preview.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const BRAND = "#22AAEE";

// Literal paths so output file tracing can see them. A helper that joined a
// variable path hid these files from the tracer, so the deployed function had no
// fonts and every card route returned 500.
const ARABIC_FONT = path.join(process.cwd(), "fonts", "arabic", "IBMPlexSansArabic-Bold.ttf");
const LATIN_FONT = path.join(process.cwd(), "fonts", "english", "IBMPlexSerif-Bold.ttf");

let fontsPromise: Promise<[ArrayBuffer, ArrayBuffer]> | undefined;

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return Uint8Array.from(buffer).buffer;
}

function loadFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  fontsPromise ??= Promise.all([readFile(ARABIC_FONT), readFile(LATIN_FONT)]).then(
    ([arabic, latin]) => [toArrayBuffer(arabic), toArrayBuffer(latin)]
  );
  return fontsPromise;
}

/**
 * Reverses the word order of a single-line Arabic run.
 *
 * Satori implements no bidi algorithm and ignores `direction: rtl`. Glyphs shape
 * and join correctly (that is the font's work), so only word order needs fixing.
 */
function layoutRtl(text: string): string {
  return text.trim().split(/\s+/).reverse().join(" ");
}

/**
 * Wraps an Arabic title into lines, then reverses each line on its own.
 *
 * Reversing the whole string and letting Satori wrap it puts the opening words on
 * the last line, so the card reads bottom-up. Break points are chosen by
 * character count because Satori exposes no text measurement.
 */
function layoutRtlLines(text: string, charsPerLine: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[][] = [[]];

  for (const word of words) {
    const current = lines[lines.length - 1];
    const width = current.reduce((sum, w) => sum + w.length + 1, 0) + word.length;
    if (current.length > 0 && width > charsPerLine) lines.push([word]);
    else current.push(word);
  }

  return lines.map((line) => line.reverse().join(" "));
}

/** Satori honours no line clamp, so a long title has to shrink to stay inside the card. */
function titleSize(title: string, isAr: boolean): number {
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

function arabicCharsPerLine(title: string): number {
  const size = titleSize(title, true);
  if (size >= 60) return 22;
  if (size >= 52) return 26;
  if (size >= 44) return 31;
  return 36;
}

type OgCardInput = {
  locale: Locale;
  /** Short label above the title, e.g. the article's category. */
  eyebrow: string;
  title: string;
  accent?: string;
};

export async function renderOgCard({ locale, eyebrow, title, accent = BRAND }: OgCardInput) {
  const isAr = locale === "ar";
  const [arabicFont, latinFont] = await loadFonts();
  const tagline = isAr ? "شركة برمجيات تعمل مع عملاء الخليج" : "Software studio for Gulf businesses";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#0b1220,#13233a)",
          padding: "64px 72px",
          fontFamily: isAr ? "Plex Arabic" : "Plex Serif",
        }}
      >
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
            flexDirection: isAr ? "row-reverse" : "row",
            alignSelf: isAr ? "flex-end" : "flex-start",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, color: accent, letterSpacing: "4px" }}>APEX</div>
          <div style={{ display: "flex", width: 6, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} />
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>
            {isAr ? layoutRtl(eyebrow) : eyebrow}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 1010,
            maxHeight: 300,
            alignSelf: isAr ? "flex-end" : "flex-start",
          }}
        >
          {isAr ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontSize: titleSize(title, true),
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.35,
              }}
            >
              {layoutRtlLines(title, arabicCharsPerLine(title)).map((line, index) => (
                <div key={`${index}-${line}`} style={{ display: "flex" }}>
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: titleSize(title, false),
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isAr ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", letterSpacing: "2px" }}>apex.sy</div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
            {isAr ? layoutRtl(tagline) : tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      // Built once and never changes until the next deploy.
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable" },
      // No emoji are rendered, so Satori never fetches remote emoji assets.
      fonts: [
        { name: "Plex Arabic", data: arabicFont, weight: 700, style: "normal" },
        { name: "Plex Serif", data: latinFont, weight: 700, style: "normal" },
      ],
    }
  );
}
