
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale }     from "@/lib/i18n/locale";
import type { BlogPost }   from "@/lib/content/content-loader";


const MOCK_POSTS = [
  {
    slug: "nextjs-vs-remix-2025",
    category: "web",
    emoji: "⚡",
    readTime: 8,
    accentColor: "#00BCD4",
    featured: true,
    ar: {
      title: "Next.js مقابل Remix في 2025 — أيهما تختار؟",
      excerpt: "مقارنة تقنية شاملة بين أقوى فريمووركين لتطوير الويب الحديث مع أمثلة عملية وحالات استخدام واقعية.",
      date: "١٥ مارس ٢٠٢٥",
    },
    en: {
      title: "Next.js vs Remix in 2025 — Which Should You Choose?",
      excerpt: "A comprehensive technical comparison between the two most powerful modern web frameworks, with practical examples and real-world use cases.",
      date: "Mar 15, 2025",
    },
  },
  {
    slug: "react-native-expo-guide",
    category: "mobile",
    emoji: "📱",
    readTime: 12,
    accentColor: "#FFBF00",
    featured: false,
    ar: {
      title: "دليل React Native + Expo الشامل للمبتدئين",
      excerpt: "كل ما تحتاج معرفته لبناء تطبيق موبايل احترافي من الصفر باستخدام React Native وExpo في 2025.",
      date: "١ مارس ٢٠٢٥",
    },
    en: {
      title: "The Complete React Native + Expo Guide for Beginners",
      excerpt: "Everything you need to know to build a professional mobile app from scratch using React Native and Expo in 2025.",
      date: "Mar 1, 2025",
    },
  },
  {
    slug: "ai-tools-developers-2025",
    category: "ai",
    emoji: "🤖",
    readTime: 6,
    accentColor: "#4DD0E1",
    featured: false,
    ar: {
      title: "أفضل أدوات الذكاء الاصطناعي للمطورين في 2025",
      excerpt: "قائمة محدّثة بأقوى أدوات AI التي يجب أن يعرفها كل مطوّر لرفع إنتاجيته ومستوى كوده.",
      date: "٢٠ فبراير ٢٠٢٥",
    },
    en: {
      title: "Best AI Tools for Developers in 2025",
      excerpt: "An updated list of the most powerful AI tools every developer should know to boost productivity and code quality.",
      date: "Feb 20, 2025",
    },
  },
  {
    slug: "tailwind-css-tips",
    category: "web",
    emoji: "🎨",
    readTime: 5,
    accentColor: "#5C6BC0",
    featured: false,
    ar: {
      title: "١٠ نصائح احترافية في Tailwind CSS تغيّر طريقة عملك",
      excerpt: "نصائح عملية ومتقدمة في Tailwind CSS يجهلها معظم المطورين وتوفّر عليك ساعات من العمل.",
      date: "١٠ فبراير ٢٠٢٥",
    },
    en: {
      title: "10 Pro Tailwind CSS Tips That Will Change How You Work",
      excerpt: "Practical advanced Tailwind CSS tips most developers don't know, saving you hours of work.",
      date: "Feb 10, 2025",
    },
  },
  {
    slug: "flutter-vs-react-native",
    category: "mobile",
    emoji: "🔥",
    readTime: 10,
    accentColor: "#FFBF00",
    featured: false,
    ar: {
      title: "Flutter أم React Native — المعركة الحقيقية في 2025",
      excerpt: "مقارنة معمّقة بين Flutter وReact Native من حيث الأداء وتجربة المطوّر وحالات الاستخدام المثالية.",
      date: "٥ فبراير ٢٠٢٥",
    },
    en: {
      title: "Flutter vs React Native — The Real Battle in 2025",
      excerpt: "An in-depth comparison between Flutter and React Native in terms of performance, developer experience, and ideal use cases.",
      date: "Feb 5, 2025",
    },
  },
  {
    slug: "ecommerce-seo-guide",
    category: "web",
    emoji: "🛒",
    readTime: 9,
    accentColor: "#00BCD4",
    featured: false,
    ar: {
      title: "دليل SEO للمتاجر الإلكترونية — استراتيجيات 2025",
      excerpt: "استراتيجيات SEO متقدمة مخصصة للمتاجر الإلكترونية لزيادة الظهور في محركات البحث ومضاعفة المبيعات.",
      date: "٢٨ يناير ٢٠٢٥",
    },
    en: {
      title: "E-Commerce SEO Guide — 2025 Strategies",
      excerpt: "Advanced SEO strategies tailored for e-commerce stores to boost search engine visibility and multiply sales.",
      date: "Jan 28, 2025",
    },
  },
];

const CATS_AR = [
  { key: "all", label: "الكل" },
  { key: "web", label: "تطوير ويب" },
  { key: "mobile", label: "موبايل" },
  { key: "ai", label: "ذكاء اصطناعي" },
];
const CATS_EN = [
  { key: "all",    label: "All" },
  { key: "web",    label: "Web Dev" },
  { key: "mobile", label: "Mobile" },
  { key: "ai",     label: "AI" },
];


function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease` }}>
      {children}
    </div>
  );
}

/* ─── Featured card ─────────────────────────────────────── */
function FeaturedCard({ post, lang }: {
  post: typeof MOCK_POSTS[0]; lang: Locale;
}) {
  const isAr    = lang === "ar";
  const content = post[lang];
  const [hov, setHov] = useState(false);

  return (
    <Link href={`/${lang}/blog/${post.slug}`}
      className="apex-card-base group col-span-full flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor:  hov ? post.accentColor : "var(--color-border)",
        transform:    hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow:    hov ? `0 20px 50px color-mix(in srgb,${post.accentColor} 18%,transparent)` : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      dir={isAr ? "rtl" : "ltr"}
    >
      
      <div className="relative shrink-0 flex items-center justify-center"
        style={{ width: "100%", maxWidth: "340px", minHeight: "220px",
          background: `linear-gradient(135deg,#0f0c29,#302b63)` }}>
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
          backgroundSize:"24px 24px",
        }} aria-hidden="true" />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width:"200px",height:"200px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            background:`radial-gradient(circle,${post.accentColor}35 0%,transparent 70%)` }} aria-hidden="true" />
        <span style={{ fontSize:"72px",filter:"drop-shadow(0 0 20px rgba(255,255,255,0.3))",
          transition:"transform 0.3s",transform:hov?"scale(1.1)":"scale(1)" }}>
          {post.emoji}
        </span>
        
        <div className="absolute top-3 px-3 py-1 rounded-full text-xs font-bold"
          style={{ [isAr?"left":"right"]:"12px", background:`color-mix(in srgb,${post.accentColor} 22%,rgba(0,0,0,0.5))`,
            border:`1px solid ${post.accentColor}55`, color:post.accentColor, backdropFilter:"blur(8px)" }}>
          {isAr ? "⭐ مميز" : "⭐ Featured"}
        </div>
      </div>

      
      <div className="flex flex-col justify-center p-8 flex-1">
        <div className={`flex items-center gap-3 mb-4 ${isAr?"flex-row-reverse":""}`}>
          <span className="apex-tag">{isAr ? CATS_AR.find(c=>c.key===post.category)?.label : CATS_EN.find(c=>c.key===post.category)?.label}</span>
          <span className="text-xs" style={{color:"var(--color-secondary-text)"}}>
            {content.date} · {post.readTime} {isAr?"دقائق":"min read"}
          </span>
        </div>
        <h2 className={`font-bold mb-3 leading-snug ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"clamp(18px,2.2vw,24px)", color:"var(--color-primary-text)" }}>
          {content.title}
        </h2>
        <p className={`leading-relaxed mb-5 ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"14px", color:"var(--color-secondary-text)" }}>
          {content.excerpt}
        </p>
        <div className={`flex items-center gap-2 font-bold text-sm apex-arrow ${hov?"apex-arrow-shift":""} ${isAr?"flex-row-reverse":""}`}
          style={{ color:post.accentColor }}>
          {isAr ? "قراءة المقال" : "Read Article"}
        </div>
      </div>
    </Link>
  );
}

/* ─── Regular card ──────────────────────────────────────── */
function PostCard({ post, lang }: { post: typeof MOCK_POSTS[0]; lang: Locale }) {
  const isAr    = lang === "ar";
  const content = post[lang];
  const [hov, setHov] = useState(false);

  return (
    <Link href={`/${lang}/blog/${post.slug}`}
      className="apex-card-base flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor:  hov ? post.accentColor : "var(--color-border)",
        transform:    hov ? "translateY(-5px)" : "translateY(0)",
        boxShadow:    hov ? `0 16px 40px color-mix(in srgb,${post.accentColor} 16%,transparent)` : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      
      <div className="relative flex items-center justify-center"
        style={{ height:"160px", background:`linear-gradient(135deg,#0a0a0a,#1a1a2e)` }}>
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
          backgroundSize:"20px 20px",
        }} aria-hidden="true" />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width:"140px",height:"140px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            background:`radial-gradient(circle,${post.accentColor}28 0%,transparent 70%)` }} aria-hidden="true" />
        <span style={{ fontSize:"52px", filter:"drop-shadow(0 0 16px rgba(255,255,255,0.25))",
          transition:"transform 0.3s", transform:hov?"scale(1.1)":"scale(1)" }}>
          {post.emoji}
        </span>
        <div className="absolute top-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{ [isAr?"left":"right"]:"10px", background:`color-mix(in srgb,${post.accentColor} 20%,rgba(0,0,0,0.5))`,
            border:`1px solid ${post.accentColor}50`, color:post.accentColor }}>
          {isAr ? CATS_AR.find(c=>c.key===post.category)?.label : CATS_EN.find(c=>c.key===post.category)?.label}
        </div>
      </div>

      
      <div className="flex flex-col flex-1 p-6" dir={isAr?"rtl":"ltr"}>
        <div className={`flex items-center gap-2 mb-3 text-xs ${isAr?"flex-row-reverse":""}`}
          style={{ color:"var(--color-secondary-text)" }}>
          <span>{content.date}</span>
          <span>·</span>
          <span>{post.readTime} {isAr?"دقائق":"min"}</span>
        </div>
        <h3 className={`font-bold mb-2 leading-snug flex-1 ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"15px", color:"var(--color-primary-text)" }}>
          {content.title}
        </h3>
        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isAr?"font-ar":"font-en"}`}
          style={{ color:"var(--color-secondary-text)" }}>
          {content.excerpt}
        </p>
        <div className={`flex items-center gap-2 font-bold text-sm mt-auto apex-arrow ${hov?"apex-arrow-shift":""} ${isAr?"flex-row-reverse":""}`}
          style={{ color:post.accentColor }}>
          {isAr?"قراءة المقال":"Read Article"}
        </div>
      </div>
    </Link>
  );
}

/* ─── Main component ────────────────────────────────────── */
export function BlogGrid({
  lang, dictionary, mdxPosts,
}: {
  lang: Locale; dictionary: Dictionary; mdxPosts: BlogPost[];
}) {
  const isAr = lang === "ar";
  const cats = isAr ? CATS_AR : CATS_EN;
  const [activeFilter, setActiveFilter] = useState("all");

  /* Build posts list — prefer MDX, fallback to mock */
  const posts = mdxPosts.length > 0
    ? mdxPosts.map((p, i) => ({
        ...MOCK_POSTS[i % MOCK_POSTS.length],
        slug: p.slug,
        [lang]: { title: p.title, excerpt: p.excerpt, date: "" },
      }))
    : MOCK_POSTS;

  const featured = posts.find(p => p.featured);
  const regular  = posts.filter(p => !p.featured);
  const filtered = activeFilter === "all"
    ? regular
    : regular.filter(p => p.category === activeFilter);

  return (
    <main className="min-h-screen pt-28 pb-24 px-6"
      style={{ background:"var(--color-background)" }} dir={isAr?"rtl":"ltr"}>
      <div className="max-w-6xl mx-auto">

        
        <Reveal className="text-center mb-14">
          <span className="apex-section-label gold">{isAr?"المدونة":"Blog"}</span>
          <div className="apex-divider reverse" />
          <h1 className={`mt-5 font-bold leading-tight ${isAr?"font-ar":"font-en"}`}
            style={{ fontSize:"clamp(28px,4vw,52px)", color:"var(--color-primary-text)" }}>
            {isAr ? "مقالات تقنية متخصصة" : "Technical Articles & Insights"}
          </h1>
          <p className={`mt-4 mx-auto leading-relaxed ${isAr?"font-ar":"font-en"}`}
            style={{ maxWidth:"500px", fontSize:"clamp(14px,1.5vw,16px)", color:"var(--color-secondary-text)" }}>
            {isAr
              ? "نشاركك خبراتنا في تطوير الويب، الموبايل، والذكاء الاصطناعي"
              : "We share our expertise in web, mobile, and AI development"}
          </p>
        </Reveal>

        
        {featured && (
          <Reveal delay={80} className="mb-10">
            <FeaturedCard post={featured} lang={lang} />
          </Reveal>
        )}

        
        <Reveal delay={100}>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {cats.map(cat => (
              <button key={cat.key} onClick={() => setActiveFilter(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${isAr?"font-ar":"font-en"}`}
                style={activeFilter === cat.key ? {
                  background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                  borderColor:"transparent", color:"#fff",
                  boxShadow:"0 4px 18px color-mix(in srgb,var(--color-primary) 38%,transparent)",
                  transform:"translateY(-1px)",
                } : {
                  background:"var(--color-card)", borderColor:"var(--color-border)", color:"var(--color-secondary-text)",
                }}>
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <PostCard post={p} lang={lang} />
            </Reveal>
          ))}
        </div>

        
        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color:"var(--color-secondary-text)" }}>
            <div className="text-5xl mb-4">📭</div>
            <p className={isAr?"font-ar":"font-en"}>
              {isAr?"لا توجد مقالات في هذا القسم حالياً":"No articles in this category yet"}
            </p>
          </div>
        )}

        
        <Reveal delay={120}>
          <div className="mt-20 rounded-3xl p-10 text-center border relative overflow-hidden"
            style={{ background:"color-mix(in srgb,var(--color-primary) 6%,var(--color-card))", borderColor:"color-mix(in srgb,var(--color-primary) 20%,transparent)" }}>
            <div className="absolute rounded-full pointer-events-none"
              style={{ width:"400px",height:"400px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                background:"radial-gradient(circle,color-mix(in srgb,var(--color-primary) 8%,transparent) 0%,transparent 70%)" }}
              aria-hidden="true" />
            <div className="relative z-1">
              <div className="text-4xl mb-4">📬</div>
              <h2 className={`font-bold mb-3 ${isAr?"font-ar":"font-en"}`}
                style={{ fontSize:"clamp(18px,2.5vw,26px)", color:"var(--color-primary-text)" }}>
                {isAr ? "لا تفوّت أي مقال جديد" : "Don't Miss a New Article"}
              </h2>
              <p className={`mb-6 ${isAr?"font-ar":"font-en"}`}
                style={{ color:"var(--color-secondary-text)", fontSize:"14px" }}>
                {isAr
                  ? "تابعنا على وسائل التواصل للحصول على أحدث المقالات التقنية"
                  : "Follow us on social media for the latest technical articles"}
              </p>
              <Link href={`/${lang}/contact`}
                className="apex-btn apex-btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white">
                {isAr ? "تواصل معنا" : "Get In Touch"}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
