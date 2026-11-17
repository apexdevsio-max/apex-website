import Link from "next/link";

type Item = { key: string; label: string; href: string; active: boolean };

/** Horizontal set of filter links, scrollable on phones. Shared by the blog and portfolio. */
export function FilterRail({ label, items }: { label: string; items: Item[] }) {
  return (
    <nav aria-label={label} className="apex-rail mb-10 flex flex-nowrap gap-2 overflow-x-auto py-1 md:flex-wrap md:overflow-visible">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`apex-chip ${item.active ? "apex-chip-active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
