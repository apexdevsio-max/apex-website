import Image from "next/image";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Locale } from "@/lib/i18n/locale";
import { headingText, slugifyHeading } from "@/lib/content/headings";

function safeUrlTransform(url: string): string {
  if (url.startsWith("/") || /^(https?:|mailto:)/i.test(url)) return defaultUrlTransform(url);
  return "";
}

export function MarkdownContent({ source, lang }: { source: string; lang: Locale }) {
  const normalized = source
    .replace(/^#\s+.*(?:\r?\n)+/, "")
    .replace(/^•\s+/gm, "- ");
  const fontClass = lang === "ar" ? "font-ar" : "font-en";

  // Headings are numbered in render order so repeated titles get distinct ids.
  // `collectHeadings` applies the same rule over the raw source, which is what
  // keeps the table of contents' hrefs matching the ids stamped here. The
  // renderer walks headings in document order, so the two counters stay in step.
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
        // Ids make each section addressable: they are what the table of contents
        // links to, what lets a reader share a link to one section, and what
        // Google reads to offer "jump to" links under the search result.
        // `scroll-mt` keeps an anchored heading clear of the fixed header.
        h1: ({ children }) => <h2 id={headingId(children)} className={`apex-prose-h2 scroll-mt-28 ${fontClass}`}>{children}</h2>,
        h2: ({ children }) => <h2 id={headingId(children)} className={`apex-prose-h2 scroll-mt-28 ${fontClass}`}>{children}</h2>,
        h3: ({ children }) => <h3 id={headingId(children)} className={`apex-prose-h3 scroll-mt-28 ${fontClass}`}>{children}</h3>,
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
        // Fenced blocks arrive as <pre><code>. Without a `pre` component the block
        // inherited the article's prose flow: indentation collapsed, newlines
        // became spaces, and inside the Arabic article (`dir="rtl"` on the page
        // wrapper) the source rendered right-to-left. `dir="ltr"` is set here
        // rather than in CSS so it applies to the element's text ordering itself,
        // and the block scrolls in its own box so long lines never widen the page.
        pre: ({ children }) => <pre dir="ltr" className="apex-prose-pre">{children}</pre>,
        // `inline` is not passed by react-markdown v10, so a fenced block is
        // distinguished by the language class remark puts on it. Inline spans keep
        // the pill treatment; block code defers entirely to `.apex-prose-pre`,
        // since a nested background and padding would double up inside it.
        code: ({ children, className }) =>
          className?.startsWith("language-")
            ? <code className={className}>{children}</code>
            : <code className="apex-prose-code">{children}</code>,
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
}
