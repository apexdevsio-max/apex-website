import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locale";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isAr = lang === "ar";

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg,#121212,#1a1a2e)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#00BCD4",
          letterSpacing: "6px",
          marginBottom: 16,
        }}
      >
        APEX
      </div>
      <div
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        {isAr ? "تقنية تتحدث عنك" : "Technology That Speaks for You"}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 48,
          fontSize: 16,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "2px",
        }}
      >
        apex.sy
      </div>
    </div>,
    size,
  );
}
