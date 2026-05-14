import Link from "next/link";

type ContentCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  index?: number;
};

export function ContentCard({
  title,
  description,
  href,
  ctaLabel,
  index = 0,
}: ContentCardProps) {
  return (
    <article
      className="rounded-2xl border border-apex-border p-6 bg-apex-card apex-card-fade-in"
      style={
        {
          boxShadow: "0 20px 44px rgba(0, 0, 0, 0.26)",
          "--card-index": index,
        } as React.CSSProperties
      }
    >
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <p className="text-apex-muted mb-4">{description}</p>
      <Link href={href} className="text-apex-primary font-medium">
        {ctaLabel}
      </Link>
    </article>
  );
}
