import { ImageResponse } from "next/og";
import { MOCK_SERVICES } from "@/lib/mock/services-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string; service: string }> }) {
  const { lang, service: slug } = await params;
  const locale = lang === "ar" ? "ar" : "en";
  const mock = MOCK_SERVICES[slug]?.[locale];
  const title = mock?.title ?? slug;

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
          position: "absolute",
          top: 40,
          left: 48,
          fontSize: 20,
          fontWeight: 700,
          color: "#00BCD4",
          letterSpacing: "4px",
        }}
      >
        APEX
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: 800,
        }}
      >
        {title}
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
