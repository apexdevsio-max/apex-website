"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AcademyCourse } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { MOCK_COURSES } from "@/lib/mock/academy-data";

const CATS_AR = [
  { key: "all", label: "الكل" },
  { key: "beginner", label: "مبتدئ" },
  { key: "intermediate", label: "متوسط" },
  { key: "advanced", label: "متقدم" },
];

const CATS_EN = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#22c55e",
  intermediate: "#FFBF00",
  advanced: "#ef4444",
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease`,
      }}
    >
      {children}
    </div>
  );
}

type GridCourse = {
  slug: string;
  emoji: string;
  accentColor: string;
  level: "beginner" | "intermediate" | "advanced";
  lessonsCount: number;
  duration: Readonly<Record<Locale, string>>;
  ar: {
    title: string;
    summary: string;
    level: string;
  };
  en: {
    title: string;
    summary: string;
    level: string;
  };
  lessons: ReadonlyArray<{
    slug: string;
    ar: string;
    en: string;
  }>;
};

function CourseCard({ course, lang }: { course: GridCourse; lang: Locale }) {
  const isAr = lang === "ar";
  const content = course[lang];
  const [hovered, setHovered] = useState(false);
  const levelColor = LEVEL_COLORS[course.level] ?? "#00BCD4";

  return (
    <Link
      href={`/${lang}/academy/${course.slug}`}
      className="apex-card-base flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: hovered ? course.accentColor : "var(--color-border)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 50px color-mix(in srgb,${course.accentColor} 18%,transparent)`
          : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ height: "168px", background: "linear-gradient(135deg,#0a0a0a,#1a1a2e)" }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "150px",
            height: "150px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle,${course.accentColor}30 0%,transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: "56px",
            filter: "drop-shadow(0 0 18px rgba(255,255,255,0.28))",
            transition: "transform 0.3s",
            transform: hovered ? "scale(1.12)" : "scale(1)",
          }}
        >
          {course.emoji}
        </span>
        <div
          className="absolute top-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            [isAr ? "left" : "right"]: "10px",
            background: `color-mix(in srgb,${levelColor} 18%,rgba(0,0,0,0.55))`,
            border: `1px solid ${levelColor}55`,
            color: levelColor,
          }}
        >
          {content.level}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6" dir={isAr ? "rtl" : "ltr"}>
        <div
          className={`flex items-center gap-3 mb-3 text-xs flex-wrap ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span>
            📚 {course.lessonsCount} {isAr ? "درس" : "lessons"}
          </span>
          <span>·</span>
          <span>⏱ {course.duration[lang]}</span>
        </div>

        <h3
          className={`font-bold mb-2 leading-snug ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
        >
          {content.title}
        </h3>

        <p
          className={`text-sm leading-relaxed flex-1 mb-4 ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {content.summary}
        </p>

        <div className="mb-4 space-y-1.5">
          {course.lessons.slice(0, 2).map((lesson, index) => (
            <div
              key={lesson.slug}
              className={`flex items-center gap-2 text-xs ${isAr ? "flex-row-reverse" : ""}`}
              style={{ color: "var(--color-secondary-text)" }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{
                  background: `color-mix(in srgb,${course.accentColor} 18%,transparent)`,
                  color: course.accentColor,
                }}
              >
                {index + 1}
              </span>
              <span className={isAr ? "font-ar" : "font-en"}>{lesson[lang]}</span>
            </div>
          ))}

          {course.lessons.length > 2 && (
            <div
              className={`text-xs ${isAr ? "font-ar text-right" : "font-en"}`}
              style={{ color: course.accentColor }}
            >
              +{course.lessons.length - 2} {isAr ? "دروس أخرى" : "more lessons"}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-2 font-bold text-sm mt-auto border-t pt-4 apex-arrow ${hovered ? "apex-arrow-shift" : ""} ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: course.accentColor, borderColor: "var(--color-border)" }}
        >
          {isAr ? "ابدأ الدورة" : "Start Course"}
        </div>
      </div>
    </Link>
  );
}

export function AcademyGrid({
  lang,
  dictionary: _dictionary,
  mdxCourses,
}: {
  lang: Locale;
  dictionary: Dictionary;
  mdxCourses: AcademyCourse[];
}) {
  void _dictionary;
  const isAr = lang === "ar";
  const cats = isAr ? CATS_AR : CATS_EN;
  const [activeFilter, setActiveFilter] = useState("all");

  const courses: ReadonlyArray<GridCourse> =
    mdxCourses.length > 0
      ? mdxCourses.map((course, index) => ({
          ...MOCK_COURSES[index % MOCK_COURSES.length],
          slug: course.slug,
          [lang]: {
            ...MOCK_COURSES[index % MOCK_COURSES.length][lang],
            title: course.title,
            summary: course.summary,
          },
        }))
      : MOCK_COURSES;

  const filtered =
    activeFilter === "all"
      ? courses
      : courses.filter((course) => course.level === activeFilter);

  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="apex-section-label">{isAr ? "الأكاديمية" : "Academy"}</span>
          <div className="apex-divider" />
          <h1
            className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}
          >
            {isAr ? "تعلّم · طوّر · احترف" : "Learn · Build · Master"}
          </h1>
          <p
            className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{ maxWidth: "500px", fontSize: "clamp(14px,1.5vw,16px)", color: "var(--color-secondary-text)" }}
          >
            {isAr
              ? "دورات تقنية عملية مصممة لتأخذك من المبتدئ إلى المحترف"
              : "Practical technical courses designed to take you from beginner to professional"}
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div
            className="grid grid-cols-3 gap-4 mb-12 rounded-2xl p-6 border"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            {[
              { value: "6", label: isAr ? "دورة متاحة" : "Courses" },
              { value: "60+", label: isAr ? "درس عملي" : "Lessons" },
              { value: "32+", label: isAr ? "ساعة تدريبية" : "Hours" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="font-bold"
                  style={{
                    fontSize: "clamp(22px,3vw,34px)",
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-en)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className={`mt-1 text-xs ${isAr ? "font-ar" : "font-en"}`}
                  style={{ color: "var(--color-secondary-text)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {cats.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${isAr ? "font-ar" : "font-en"}`}
                style={
                  activeFilter === cat.key
                    ? {
                        background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                        borderColor: "transparent",
                        color: "#fff",
                        boxShadow: "0 4px 18px color-mix(in srgb,var(--color-primary) 38%,transparent)",
                        transform: "translateY(-1px)",
                      }
                    : {
                        background: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-secondary-text)",
                      }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, index) => (
            <Reveal key={course.slug} delay={index * 60}>
              <CourseCard course={course} lang={lang} />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--color-secondary-text)" }}>
            <div className="text-5xl mb-4">🔍</div>
            <p className={isAr ? "font-ar" : "font-en"}>
              {isAr ? "لا توجد دورات في هذا المستوى حاليًا" : "No courses at this level yet"}
            </p>
          </div>
        )}

        <Reveal delay={100}>
          <div
            className="mt-16 rounded-3xl p-10 text-center border relative overflow-hidden"
            style={{
              background: "color-mix(in srgb,var(--color-primary) 5%,var(--color-card))",
              borderColor: "color-mix(in srgb,var(--color-primary) 18%,transparent)",
            }}
          >
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "400px",
                height: "400px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background: "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 7%,transparent) 0%,transparent 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative z-1">
              <div className="text-4xl mb-4">🎓</div>
              <h2
                className={`font-bold mb-3 ${isAr ? "font-ar" : "font-en"}`}
                style={{ fontSize: "clamp(18px,2.5vw,24px)", color: "var(--color-primary-text)" }}
              >
                {isAr ? "تريد دورة مخصصة لفريقك؟" : "Want a Custom Course for Your Team?"}
              </h2>
              <p
                className={`mb-6 text-sm ${isAr ? "font-ar" : "font-en"}`}
                style={{ color: "var(--color-secondary-text)" }}
              >
                {isAr
                  ? "نصمم برامج تدريبية مخصصة حسب احتياجات فريقك التقني"
                  : "We design custom training programs tailored to your technical team's needs"}
              </p>
              <Link
                href={`/${lang}/contact`}
                className="apex-btn apex-btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white"
              >
                {isAr ? "تواصل معنا" : "Get In Touch"}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
