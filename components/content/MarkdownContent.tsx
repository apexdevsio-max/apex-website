import Image from "next/image";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Locale } from "@/lib/i18n/locale";
import { headingText, slugifyHeading } from "@/lib/content/headings";

function safeUrlTransform(url: string): string {
  if (url.startsWith("/") || url.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(url)) return defaultUrlTransform(url);
  return "";
}

/**
 * The page renders the title as its own <h1>, so the body's first `# ` heading is
 * dropped wherever it sits. Anchoring the strip to the start of the file missed
 * articles that open with an image, which then rendered a second title.
 */
export function stripBodyTitle(source: string): string {
  return source.replace(/^#[^\S\n]+.*(?:\r?\n)+/m, "");
}

export function MarkdownContent({ source }: { source: string; lang: Locale }) {
  const normalized = stripBodyTitle(source).replace(/^•\s+/gm, "- ");

  // Headings are numbered in render order so repeated titles get distinct ids;
  // collectHeadings applies the same rule, which keeps the TOC links matching.
  const usedIds = new Map<string, number>();
  const headingId = (children: unknown): string | undefined => {
    const base = slugifyHeading(headingText(children));
    if (!base) return undefined;
    const seen = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      urlTransform={safeUrlTransform}
      components={{
        h1: ({ children }) => <h2 id={headingId(children)} className="apex-prose-h2 scroll-mt-28">{children}</h2>,
        h2: ({ children }) => <h2 id={headingId(children)} className="apex-prose-h2 scroll-mt-28">{children}</h2>,
        h3: ({ children }) => <h3 id={headingId(children)} className="apex-prose-h3 scroll-mt-28">{children}</h3>,
        p: ({ children }) => <p className="apex-prose-p">{children}</p>,
        ul: ({ children }) => <ul className="apex-prose-list list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="apex-prose-list list-decimal">{children}</ol>,
        blockquote: ({ children }) => <blockquote className="apex-prose-quote">{children}</blockquote>,
        hr: () => <hr className="my-10 border-apex-border" />,
        a: ({ href, children }) => {
          // Only links to other sites open in a new tab; anchors and mail links stay put.
          const external = Boolean(href && /^https?:\/\//i.test(href));
          return (
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="font-semibold text-apex-primary underline underline-offset-2"
            >
              {children}
            </a>
          );
        },
        // Intrinsic proportions: the old forced 16:9 crop cut diagrams and tall
        // screenshots. The first image is usually the hero, so it loads eagerly.
        img: ({ src, alt }) =>
          typeof src === "string" && src.startsWith("/") ? (
            <Image
              src={src}
              alt={alt ?? ""}
              width={1280}
              height={720}
              className="my-8 h-auto w-full rounded-2xl"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          ) : null,
        // Wide tables scroll inside a focusable region so keyboard users can scroll them too.
        table: ({ children }) => (
          <div className="apex-table-wrap" role="region" aria-label="table" tabIndex={0}>
            <table>{children}</table>
          </div>
        ),
        th: ({ children }) => <th>{children}</th>,
        td: ({ children }) => <td>{children}</td>,
        // Code reads left to right even inside an Arabic article.
        pre: ({ children }) => <pre dir="ltr" className="apex-prose-pre">{children}</pre>,
        code: ({ children, className }) =>
          className?.startsWith("language-") ? <code className={className}>{children}</code> : <code className="apex-prose-code">{children}</code>,
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
}
