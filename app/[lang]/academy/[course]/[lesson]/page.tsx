import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getAcademyCourseBySlug,
  getAcademyCourses,
  getAcademyLessonBySlugs,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { MOCK_COURSES } from "@/lib/mock/academy-data";
import { buildPageMeta } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ lang: string; course: string; lesson: string }>;
};

export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; course: string; lesson: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const mdxCourses = await getAcademyCourses(lang);

    for (const course of mdxCourses) {
      for (const lesson of course.lessons) {
        const key = `${lang}:${course.slug}:${lesson.slug}`;
        if (!seen.has(key)) {
          seen.add(key);
          params.push({ lang, course: course.slug, lesson: lesson.slug });
        }
      }
    }

    for (const course of MOCK_COURSES) {
      for (const lesson of course.lessons) {
        const key = `${lang}:${course.slug}:${lesson.slug}`;
        if (!seen.has(key)) {
          seen.add(key);
          params.push({ lang, course: course.slug, lesson: lesson.slug });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, course, lesson } = await params;
  const locale = isLocale(lang) ? lang : "ar";
  let mdx = null;
  try {
    mdx = await getAcademyLessonBySlugs(locale, course, lesson);
  } catch {
    mdx = null;
  }
  const mockCourse = MOCK_COURSES.find((item) => item.slug === course);
  const mockLesson = mockCourse?.lessons.find((item) => item.slug === lesson);
  const mockTitle = mockLesson?.[locale] ?? lesson;

  return buildPageMeta(locale, {
    title: `${mdx?.lesson.title ?? mockTitle} - APEX`,
    description:
      mdx?.lesson.summary ??
      (locale === "ar" ? "درس تدريبي من أكاديمية APEX." : "Training lesson from APEX Academy."),
    path: `/${lang}/academy/${course}/${lesson}`,
  });
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#22c55e",
  intermediate: "#FFBF00",
  advanced: "#ef4444",
};

const hoverStyles = `
  .apex-back:hover { color: var(--color-primary) !important; }
  .apex-nav-lesson { transition: all 0.2s ease; }
  .apex-nav-lesson:hover {
    border-color: var(--color-primary) !important;
    background: color-mix(in srgb,var(--color-primary) 5%,var(--color-card)) !important;
  }
  .apex-btn-primary:hover { opacity: 0.92; transform: translateY(-2px); }
  .apex-btn-outline:hover { background: color-mix(in srgb,var(--color-primary) 10%,transparent); }
`;

export default async function LessonPage({ params }: Props) {
  const { lang, course: courseSlug, lesson: lessonSlug } = await params;
  if (!isLocale(lang) || !courseSlug || !lessonSlug) notFound();

  const isAr = lang === "ar";
  let mdxCourse = null;
  try {
    mdxCourse = await getAcademyCourseBySlug(lang, courseSlug);
  } catch {
    mdxCourse = null;
  }
  const mockCourse = MOCK_COURSES.find((course) => course.slug === courseSlug);
  if (!mdxCourse && !mockCourse) notFound();

  const accentColor = mockCourse?.accentColor ?? "var(--color-primary)";
  const level = mockCourse?.level ?? "beginner";
  const levelColor = LEVEL_COLORS[level] ?? "#00BCD4";
  const levelLabel = mockCourse?.[lang]?.level ?? level;
  const courseTitle = mdxCourse?.title ?? mockCourse?.[lang]?.title ?? courseSlug;

  const allLessons = mdxCourse?.lessons.length
    ? mdxCourse.lessons.map((lesson) => ({ slug: lesson.slug, title: lesson.title }))
    : (mockCourse?.lessons ?? []).map((lesson) => ({
        slug: lesson.slug,
        title: lesson[lang],
      }));

  let mdxLesson = null;
  try {
    mdxLesson = await getAcademyLessonBySlugs(lang, courseSlug, lessonSlug);
  } catch {
    mdxLesson = null;
  }
  const mockLesson = mockCourse?.lessons.find((lesson) => lesson.slug === lessonSlug);
  if (!mdxLesson && !mockLesson) notFound();

  const lessonTitle = mdxLesson?.lesson.title ?? mockLesson?.[lang] ?? lessonSlug;
  const lessonSummary = mdxLesson?.lesson.summary ?? "";
  const lessonContent = mdxLesson?.lesson.content ?? "";

  const currentIndex = allLessons.findIndex((lesson) => lesson.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const contentLines = lessonContent.split("\n");

  return (
    <main
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />

      <div className="max-w-4xl mx-auto">
        <nav
          className={`inline-flex items-center gap-2 text-sm font-semibold mb-10 flex-wrap ${
            isAr ? "font-ar flex-row-reverse" : "font-en"
          }`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <Link href={`/${lang}/academy`} className="apex-back transition-colors hover:underline">
            {isAr ? "الأكاديمية" : "Academy"}
          </Link>
          <span aria-hidden="true">›</span>
          <Link
            href={`/${lang}/academy/${courseSlug}`}
            className="apex-back transition-colors hover:underline truncate max-w-[160px]"
          >
            {courseTitle}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="truncate max-w-[200px]" style={{ color: "var(--color-primary-text)" }}>
            {lessonTitle}
          </span>
        </nav>

        <div
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height: "clamp(140px,16vw,200px)", background: "linear-gradient(135deg,#0a0a0a,#1a1a2e)" }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
              backgroundSize: "26px 26px",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "220px",
              height: "220px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle,${accentColor}30 0%,transparent 70%)`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 flex items-center justify-center font-bold"
            style={{
              fontSize: "clamp(48px,8vw,72px)",
              color: accentColor,
              opacity: 0.9,
              fontFamily: "monospace",
              filter: `drop-shadow(0 0 16px ${accentColor}60)`,
            }}
          >
            {String(currentIndex + 1).padStart(2, "0")}
          </div>
          <div
            className="absolute top-4 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left" : "right"]: "16px",
              background: `color-mix(in srgb,${levelColor} 18%,rgba(0,0,0,0.6))`,
              border: `1px solid ${levelColor}55`,
              color: levelColor,
              backdropFilter: "blur(8px)",
            }}
          >
            {levelLabel}
          </div>
        </div>

        <h1
          className={`font-bold mb-3 leading-tight ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "clamp(20px,3vw,36px)", color: "var(--color-primary-text)" }}
        >
          {lessonTitle}
        </h1>

        {lessonSummary && (
          <p
            className={`text-base mb-10 leading-relaxed pb-8 border-b ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)", borderColor: "var(--color-border)" }}
          >
            {lessonSummary}
          </p>
        )}

        {lessonContent ? (
          <article className="mb-14">
            {contentLines.map((line, index) => {
              if (!line.trim()) return <div key={index} style={{ height: "8px" }} />;

              if (line.startsWith("## ")) {
                return (
                  <h2 key={index} className={`apex-prose-h2 ${isAr ? "font-ar" : "font-en"}`}>
                    {line.replace("## ", "")}
                  </h2>
                );
              }

              if (line.startsWith("### ")) {
                return (
                  <h3 key={index} className={`apex-prose-h3 ${isAr ? "font-ar" : "font-en"}`}>
                    {line.replace("### ", "")}
                  </h3>
                );
              }

              if (line.startsWith("> ")) {
                return (
                  <blockquote key={index} className={`apex-prose-quote ${isAr ? "font-ar" : "font-en"}`}>
                    {line.replace("> ", "")}
                  </blockquote>
                );
              }

              if (line.startsWith("- ") || line.startsWith("• ")) {
                return (
                  <div key={index} className="flex items-start gap-3 mb-2">
                    <span
                      className="mt-2 w-2 h-2 rounded-full shrink-0"
                      style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                    />
                    <span className={`apex-prose-p ${isAr ? "font-ar" : "font-en"}`} style={{ margin: 0 }}>
                      {line.replace(/^[-•]\s/, "")}
                    </span>
                  </div>
                );
              }

              return (
                <p key={index} className={`apex-prose-p ${isAr ? "font-ar" : "font-en"}`}>
                  {line}
                </p>
              );
            })}
          </article>
        ) : (
          <div
            className="rounded-2xl border p-10 mb-14 text-center"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <div className="text-4xl mb-3">🚧</div>
            <p className={`text-sm ${isAr ? "font-ar" : "font-en"}`} style={{ color: "var(--color-secondary-text)" }}>
              {isAr ? "محتوى هذا الدرس قيد الإعداد." : "Lesson content is being prepared."}
            </p>
          </div>
        )}

        {allLessons.length > 1 && (
          <div className="mb-12">
            <h2
              className={`font-bold mb-4 ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
            >
              {isAr ? "دروس الدورة" : "Course Lessons"}
            </h2>
            <div className="space-y-2">
              {allLessons.map((lesson, index) => {
                const isActive = lesson.slug === lessonSlug;
                return (
                  <Link
                    key={lesson.slug}
                    href={`/${lang}/academy/${courseSlug}/${lesson.slug}`}
                    className="apex-nav-lesson flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      background: isActive
                        ? `color-mix(in srgb,${accentColor} 10%,var(--color-card))`
                        : "var(--color-card)",
                      borderColor: isActive ? accentColor : "var(--color-border)",
                      textDecoration: "none",
                    }}
                    dir={isAr ? "rtl" : "ltr"}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: isActive
                          ? accentColor
                          : `color-mix(in srgb,${accentColor} 16%,transparent)`,
                        color: isActive ? "#fff" : accentColor,
                        border: `1px solid ${accentColor}35`,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-sm truncate ${isAr ? "font-ar" : "font-en"}`}
                      style={{
                        color: isActive ? "var(--color-primary-text)" : "var(--color-secondary-text)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {lesson.title}
                    </span>
                    {isActive && (
                      <span className="ms-auto text-xs font-bold shrink-0" style={{ color: accentColor }}>
                        {isAr ? "حاليًا" : "Current"}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className={`grid gap-3 mb-10 ${prevLesson && nextLesson ? "grid-cols-2" : "grid-cols-1"}`}>
          {prevLesson && (
            <Link
              href={`/${lang}/academy/${courseSlug}/${prevLesson.slug}`}
              className="apex-nav-lesson rounded-xl border p-4"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", textDecoration: "none" }}
              dir={isAr ? "rtl" : "ltr"}
            >
              <p className={`text-xs mb-1 ${isAr ? "font-ar" : "font-en"}`} style={{ color: "var(--color-secondary-text)" }}>
                {isAr ? "← الدرس السابق" : "← Previous"}
              </p>
              <p className={`text-sm font-semibold truncate ${isAr ? "font-ar" : "font-en"}`} style={{ color: "var(--color-primary-text)" }}>
                {prevLesson.title}
              </p>
            </Link>
          )}

          {nextLesson && (
            <Link
              href={`/${lang}/academy/${courseSlug}/${nextLesson.slug}`}
              className="apex-nav-lesson rounded-xl border p-4"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                textDecoration: "none",
                textAlign: "right",
              }}
              dir={isAr ? "rtl" : "ltr"}
            >
              <p className={`text-xs mb-1 ${isAr ? "font-ar" : "font-en"}`} style={{ color: "var(--color-secondary-text)" }}>
                {isAr ? "الدرس التالي ←" : "Next →"}
              </p>
              <p className={`text-sm font-semibold truncate ${isAr ? "font-ar" : "font-en"}`} style={{ color: "var(--color-primary-text)" }}>
                {nextLesson.title}
              </p>
            </Link>
          )}
        </div>

        <div className={`flex flex-wrap gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
          <Link
            href={`/${lang}/academy/${courseSlug}`}
            className="apex-btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all border-2"
            style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
          >
            <span style={{ display: "inline-block", transform: isAr ? "none" : "rotate(180deg)" }}>→</span>
            {isAr ? "صفحة الدورة" : "Back to Course"}
          </Link>

          {nextLesson && (
            <Link
              href={`/${lang}/academy/${courseSlug}/${nextLesson.slug}`}
              className="apex-btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white transition-all"
              style={{
                background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                boxShadow: "0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)",
              }}
            >
              {isAr ? "الدرس التالي" : "Next Lesson"}
              <span style={{ display: "inline-block", transform: isAr ? "rotate(180deg)" : "none" }}>→</span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
