import Image from "next/image";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Locale } from "@/lib/i18n/locale";

function safeUrlTransform(url: string): string {
  if (url.startsWith("/") || /^(https?:|mailto:)/i.test(url)) return defaultUrlTransform(url);
  return "";
}

export function MarkdownContent({ source, lang }: { source: string; lang: Locale }) {
  const normalized = source
    .replace(/^#\s+.*(?:\r?\n)+/, "")
    .replace(/^•\s+/gm, "- ");
  const fontClass = lang === "ar" ? "font-ar" : "font-en";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      urlTransform={safeUrlTransform}
      components={{
        h1: ({ children }) => <h2 className={`apex-prose-h2 ${fontClass}`}>{children}</h2>,
        h2: ({ children }) => <h2 className={`apex-prose-h2 ${fontClass}`}>{children}</h2>,
        h3: ({ children }) => <h3 className={`apex-prose-h3 ${fontClass}`}>{children}</h3>,
        p: ({ children }) => <p className={`apex-prose-p mb-4 ${fontClass}`}>{children}</p>,
        ul: ({ children }) => <ul className={`apex-prose-list list-disc ${fontClass}`}>{children}</ul>,
        ol: ({ children }) => <ol className={`apex-prose-list list-decimal ${fontClass}`}>{children}</ol>,
        blockquote: ({ children }) => <blockquote className={`apex-prose-quote ${fontClass}`}>{children}</blockquote>,
        hr: () => <hr className="my-10 border-apex-border opacity-40" />,
        a: ({ href, children }) => {
          const external = Boolean(href && !href.startsWith("/"));
          return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="font-semibold underline underline-offset-2" style={{ color: "var(--color-primary)" }}>{children}</a>;
        },
        img: ({ src, alt }) => typeof src === "string" && src.startsWith("/") ? (
          <span className="relative my-8 block aspect-video w-full">
            <Image src={src} alt={alt ?? ""} fill className="rounded-2xl object-cover shadow-lg" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px" />
          </span>
        ) : null,
        table: ({ children }) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-sm">{children}</table></div>,
        th: ({ children }) => <th className="border p-3 text-start" style={{ borderColor: "var(--color-border)" }}>{children}</th>,
        td: ({ children }) => <td className="border p-3" style={{ borderColor: "var(--color-border)" }}>{children}</td>,
        code: ({ children, className }) => <code className={`${className ?? ""} rounded px-1.5 py-0.5`} style={{ background: "var(--color-card)" }}>{children}</code>,
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
}
