import Image from "next/image";
import Link from "next/link";

import type { PortfolioItem } from "@/lib/content/content-loader";
import type { Locale } from "@/lib/i18n/locale";
import { PROJECT_CATEGORY_LABELS } from "@/lib/content/project-style";

/**
 * Project card shared by the home page and the portfolio. Portrait stills (most
 * of the video work is 9:16) are shown whole over a blurred copy of themselves
 * instead of being cropped to a sliver or pillarboxed in black.
 */
export function ProjectCard({ project, lang, headingLevel = "h3" }: { project: PortfolioItem; lang: Locale; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="apex-card group relative flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-apex-card">
        <Image src={project.cover} alt="" fill aria-hidden="true" className="scale-110 object-cover opacity-60 blur-2xl" sizes="200px" quality={40} />
        <Image
          src={project.cover}
          alt=""
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="apex-cat-label mb-2">{PROJECT_CATEGORY_LABELS[project.category][lang]}</p>
        <Heading className="mb-2 text-lg font-bold leading-snug text-apex-text">
          <Link href={`/${lang}/portfolio/${project.slug}`} className="apex-stretched-link">
            {project.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-base leading-relaxed text-apex-muted">{project.summary}</p>
      </div>
    </article>
  );
}
