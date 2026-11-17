import Link from "next/link";

/** Visible trail matching the BreadcrumbList JSON-LD on the same page. */
export function Breadcrumbs({ label, items }: { label: string; items: Array<{ name: string; href?: string }> }) {
  return (
    <nav aria-label={label} className="mb-6 text-sm text-apex-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${index}-${item.name}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-[44px] items-center hover:text-apex-primary hover:underline">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
