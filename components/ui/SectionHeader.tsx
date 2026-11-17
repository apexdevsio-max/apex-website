import type { ReactNode } from "react";

/**
 * The heading block that opens a section or page. Start-aligned by default:
 * the old design centred an identical label/divider/title stack on every section.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  as: Heading = "h2",
  align = "start",
  id,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  as?: "h1" | "h2";
  align?: "start" | "center";
  id?: string;
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <header className={`mb-10 md:mb-14 ${centered ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}`}>
      {eyebrow && <p className="apex-eyebrow">{eyebrow}</p>}
      <Heading id={id} className={Heading === "h1" ? "apex-page-title" : "apex-section-title"}>
        {title}
      </Heading>
      {subtitle && <p className="apex-section-subtitle mt-4">{subtitle}</p>}
      {children}
    </header>
  );
}
