// file: app/[lang]/academy/[course]/page.tsx
import Link              from "next/link";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getAcademyCourseBySlug, getAcademyCourses } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale }               from "@/lib/i18n/locale";
import { MOCK_COURSES }                              from "@/lib/mock/academy-data";

type Props = { params: Promise<{ lang: string; course: string }> };

export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; course: string }[] = [];
  for (const lang of SUPPORTED_LOCALES) {
    const mdx = await getAcademyCourses(lang);
    for (const c of mdx) {
      const k = `${lang}:${c.slug}`;
      if (!seen.has(k)) { seen.add(k); params.push({ lang, course: c.slug }); }
    }
    for (const c of MOCK_COURSES) {
      const k = `${lang}:${c.slug}`;
      if (!seen.has(k)) { seen.add(k); params.push({ lang, course: c.slug }); }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, course: courseSlug } = await params;
  const mock    = MOCK_COURSES.find(c => c.slug === courseSlug);
  const content = mock?.[lang as "ar"|"en"];
  return {
    title: content ? `${content.title} — APEX Academy` : `${courseSlug} — APEX Academy`,
    description: content?.summary ?? "",
  };
}

const LEVEL_COLORS: Record<string, string> = {
  beginner:"#22c55e", intermediate:"#FFBF00", advanced:"#ef4444",
};

const hoverStyles = `
  .apex-back:hover { color:var(--color-primary) !important; }
  .apex-lesson-card { transition:all 0.2s ease; }
  .apex-lesson-card:hover { border-color:var(--color-primary) !important; transform:translateX(4px); background:color-mix(in srgb,var(--color-primary) 5%,var(--color-card)) !important; }
  [dir="rtl"] .apex-lesson-card:hover { transform:translateX(-4px); }
  .apex-btn-primary:hover { opacity:0.92; transform:translateY(-2px); }
  .apex-btn-outline:hover { background:color-mix(in srgb,var(--color-primary) 10%,transparent); }
`;

export default async function CoursePage({ params }: Props) {
  const { lang, course: courseSlug } = await params;
  if (!isLocale(lang) || !courseSlug) notFound();

  const isAr      = lang === "ar";
  const mdxCourse = await getAcademyCourseBySlug(lang, courseSlug).catch(() => null);
  const mock      = MOCK_COURSES.find(c => c.slug === courseSlug);
  if (!mdxCourse && !mock) notFound();

  const mockContent = mock?.[lang as "ar"|"en"];
  const title       = mdxCourse?.title   ?? mockContent?.title   ?? courseSlug;
  const summary     = mdxCourse?.summary ?? mockContent?.summary ?? "";
  const emoji       = mock?.emoji        ?? "📚";
  const accentColor = mock?.accentColor  ?? "var(--color-primary)";
  const level       = mock?.level        ?? "beginner";
  const levelLabel  = mockContent?.level ?? level;
  const levelColor  = LEVEL_COLORS[level] ?? "#00BCD4";
  const duration    = mock?.duration[lang as "ar"|"en"] ?? "";

  const lessons = mdxCourse?.lessons.length
    ? mdxCourse.lessons.map(l => ({ slug: l.slug, title: l.title, summary: l.summary }))
    : (mock?.lessons ?? []).map(l => ({ slug: l.slug, title: l[lang as "ar"|"en"], summary: "" }));

  return (
    <main className="min-h-screen pt-24 pb-24 px-6"
      style={{ background:"var(--color-background)" }} dir={isAr?"rtl":"ltr"}>
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
      <div className="max-w-4xl mx-auto">

        <Link href={`/${lang}/academy`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${isAr?"font-ar flex-row-reverse":"font-en"}`}
          style={{ color:"var(--color-secondary-text)" }}>
          <span style={{ display:"inline-block", transform:isAr?"none":"rotate(180deg)" }}>→</span>
          {isAr?"العودة للأكاديمية":"Back to Academy"}
        </Link>

        <div className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height:"clamp(200px,24vw,300px)", background:"linear-gradient(135deg,#0a0a0a,#1a1a2e)" }}>
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
            backgroundSize:"26px 26px",
          }} aria-hidden="true" />
          <div className="absolute rounded-full pointer-events-none"
            style={{ width:"260px",height:"260px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              background:`radial-gradient(circle,${accentColor}30 0%,transparent 70%)` }} aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize:"84px",filter:"drop-shadow(0 0 24px rgba(255,255,255,0.3))" }}>
            {emoji}
          </div>
          <div className="absolute top-4 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ [isAr?"left":"right"]:"16px",
              background:`color-mix(in srgb,${levelColor} 18%,rgba(0,0,0,0.6))`,
              border:`1px solid ${levelColor}55`, color:levelColor, backdropFilter:"blur(8px)" }}>
            {levelLabel}
          </div>
        </div>

        <div className={`flex items-center gap-4 mb-4 text-sm flex-wrap ${isAr?"flex-row-reverse":""}`}
          style={{ color:"var(--color-secondary-text)" }}>
          <span>📚 {lessons.length} {isAr?"درس":"lessons"}</span>
          {duration && <><span>·</span><span>⏱ {duration}</span></>}
        </div>

        <h1 className={`font-bold mb-4 leading-tight ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"clamp(22px,3.5vw,40px)", color:"var(--color-primary-text)" }}>
          {title}
        </h1>
        <p className={`text-lg mb-10 leading-relaxed pb-8 border-b ${isAr?"font-ar":"font-en"}`}
          style={{ color:"var(--color-secondary-text)", borderColor:"var(--color-border)" }}>
          {summary}
        </p>

        <h2 className={`font-bold mb-5 ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"18px", color:"var(--color-primary-text)" }}>
          {isAr?"محتوى الدورة":"Course Content"}
        </h2>

        <div className="space-y-3 mb-12">
          {lessons.map((lesson, i) => (
            <Link key={lesson.slug}
              href={`/${lang}/academy/${courseSlug}/${lesson.slug}`}
              className="apex-lesson-card flex items-center gap-4 rounded-xl border p-4"
              style={{ background:"var(--color-card)", borderColor:"var(--color-border)", textDecoration:"none" }}
              dir={isAr?"rtl":"ltr"}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background:`color-mix(in srgb,${accentColor} 16%,transparent)`, color:accentColor,
                  border:`1px solid ${accentColor}35` }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isAr?"font-ar":"font-en"}`}
                  style={{ color:"var(--color-primary-text)" }}>
                  {lesson.title}
                </p>
                {lesson.summary && (
                  <p className={`text-xs mt-0.5 truncate ${isAr?"font-ar":"font-en"}`}
                    style={{ color:"var(--color-secondary-text)" }}>
                    {lesson.summary}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-bold"
                style={{ color:accentColor, transform:isAr?"rotate(180deg)":"none", display:"inline-block" }}>
                →
              </span>
            </Link>
          ))}
        </div>

        <div className={`flex flex-wrap gap-4 ${isAr?"flex-row-reverse":""}`}>
          {lessons[0] && (
            <Link href={`/${lang}/academy/${courseSlug}/${lessons[0].slug}`}
              className="apex-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all"
              style={{ background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                boxShadow:"0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)" }}>
              {isAr?"ابدأ الدورة الآن":"Start Course Now"}
              <span style={{ display:"inline-block", transform:isAr?"rotate(180deg)":"none" }}>→</span>
            </Link>
          )}
          <Link href={`/${lang}/academy`}
            className="apex-btn-outline inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all border-2"
            style={{ color:"var(--color-primary)", border:"2px solid var(--color-primary)" }}>
            {isAr?"دورات أخرى":"More Courses"}
          </Link>
        </div>
      </div>
    </main>
  );
}