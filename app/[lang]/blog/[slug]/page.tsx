
import Link              from "next/link";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale }     from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";


const MOCK_POSTS: Record<string, {
  emoji: string; accentColor: string; category: string; readTime: number;
  ar: { title: string; excerpt: string; date: string; content: string };
  en: { title: string; excerpt: string; date: string; content: string };
}> = {
  "nextjs-vs-remix-2025": {
    emoji:"⚡", accentColor:"#00BCD4", category:"Web Dev", readTime:8,
    ar:{
      title:"Next.js مقابل Remix في 2025 — أيهما تختار؟",
      excerpt:"مقارنة تقنية شاملة بين أقوى فريمووركين لتطوير الويب الحديث.",
      date:"١٥ مارس ٢٠٢٥",
      content:`Next.js وRemix هما أقوى خيارين لبناء تطبيقات الويب الحديثة. لكن كيف تختار؟

## الأداء

• Next.js: يعتمد على Static Generation وServer Components مما يمنحه أداءً استثنائياً
• Remix: يعتمد على Server-Side Rendering بشكل افتراضي مع تحسينات ذكية للـ hydration

## تجربة المطوّر

• Next.js: توثيق ممتاز، مجتمع ضخم، وتكامل سلس مع Vercel
• Remix: منحنى تعلم أحدث، لكن يجبرك على فهم عميق لـ web fundamentals

## متى تختار Next.js؟

• المشاريع الكبيرة التي تحتاج Static Generation
• عندما تريد أداءً خارج الصندوق
• إذا كان فريقك مألوفاً مع React ecosystem

## متى تختار Remix؟

• التطبيقات التي تعتمد بشدة على البيانات الديناميكية
• عندما تريد تجربة UX سلسة مع optimistic updates
• إذا كنت تبني تطبيقاً full-stack حقيقياً

## الخلاصة

لمعظم المشاريع في 2025، Next.js لا يزال الخيار الأكثر أماناً والأوسع دعماً. لكن Remix يستحق الاهتمام جداً لمن يريد التعمق في web standards.`,
    },
    en:{
      title:"Next.js vs Remix in 2025 — Which Should You Choose?",
      excerpt:"A comprehensive technical comparison between the two most powerful modern web frameworks.",
      date:"Mar 15, 2025",
      content:`Next.js and Remix are the two most powerful choices for building modern web applications. But how do you choose?

## Performance

• Next.js: Relies on Static Generation and Server Components for exceptional performance
• Remix: Defaults to Server-Side Rendering with smart hydration optimizations

## Developer Experience

• Next.js: Excellent documentation, massive community, seamless Vercel integration
• Remix: Newer learning curve, but forces a deeper understanding of web fundamentals

## When to Choose Next.js?

• Large projects requiring Static Generation
• When you want performance out of the box
• If your team is familiar with the React ecosystem

## When to Choose Remix?

• Data-heavy dynamic applications
• When you want smooth UX with optimistic updates
• If you're building a true full-stack application

## Conclusion

For most projects in 2025, Next.js remains the safest and most widely supported choice. But Remix is definitely worth exploring for those who want to dive deep into web standards.`,
    },
  },
  "react-native-expo-guide": {
    emoji:"📱", accentColor:"#FFBF00", category:"Mobile", readTime:12,
    ar:{
      title:"دليل React Native + Expo الشامل للمبتدئين",
      excerpt:"كل ما تحتاج معرفته لبناء تطبيق موبايل احترافي من الصفر.",
      date:"١ مارس ٢٠٢٥",
      content:`React Native + Expo أصبحا الخيار الأول لبناء تطبيقات الموبايل بـ JavaScript.

## لماذا Expo؟

• إعداد سريع بدون Xcode أو Android Studio
• أدوات تطوير متكاملة (hot reload, debugging)
• مكتبة ضخمة من الـ native modules

## البدء من الصفر

أول خطوة: تثبيت Expo CLI
ثم: إنشاء مشروع جديد بـ expo create-app
بعدها: تشغيل التطبيق على هاتفك مباشرة بـ Expo Go

## الهيكل المقترح

• /app — صفحات التطبيق (Expo Router)
• /components — المكونات القابلة للإعادة
• /hooks — custom hooks
• /utils — helper functions

## النشر

Expo يتيح لك نشر تطبيقك على App Store وGoogle Play بدون تعقيدات native build.

## الخلاصة

إذا كنت مطوّر ويب وتريد دخول عالم الموبايل، React Native + Expo هو أسرع طريق.`,
    },
    en:{
      title:"The Complete React Native + Expo Guide for Beginners",
      excerpt:"Everything you need to know to build a professional mobile app from scratch.",
      date:"Mar 1, 2025",
      content:`React Native + Expo have become the #1 choice for building mobile apps with JavaScript.

## Why Expo?

• Quick setup without Xcode or Android Studio
• Integrated development tools (hot reload, debugging)
• Large library of native modules

## Starting from Scratch

First: Install Expo CLI
Then: Create a new project with expo create-app
After: Run your app directly on your phone with Expo Go

## Recommended Structure

• /app — App screens (Expo Router)
• /components — Reusable components
• /hooks — Custom hooks
• /utils — Helper functions

## Deployment

Expo lets you publish your app to the App Store and Google Play without native build complexities.

## Conclusion

If you're a web developer looking to enter mobile, React Native + Expo is the fastest path.`,
    },
  },
  "ai-tools-developers-2025": {
    emoji:"🤖", accentColor:"#4DD0E1", category:"AI", readTime:6,
    ar:{
      title:"أفضل أدوات الذكاء الاصطناعي للمطورين في 2025",
      excerpt:"قائمة محدّثة بأقوى أدوات AI يجب أن يعرفها كل مطوّر.",
      date:"٢٠ فبراير ٢٠٢٥",
      content:`الذكاء الاصطناعي غيّر طريقة عمل المطورين بشكل جذري. هذه أقوى الأدوات في 2025:

## للكتابة والكود

• GitHub Copilot: الأقوى لاقتراحات الكود المباشر في المحرر
• Claude (Anthropic): ممتاز للتحليل والتوثيق والمهام المعقدة
• Cursor IDE: بيئة تطوير متكاملة مدعومة بالـ AI

## للتصميم

• Midjourney: توليد صور احترافية
• Figma AI: اقتراحات تصميمية مباشرة في Figma
• v0 by Vercel: توليد مكونات React من وصف نصي

## لإنتاج المحتوى

• Sora (OpenAI): توليد فيديو من نص
• ElevenLabs: تحويل نص لصوت بجودة بشرية
• Runway: تحرير فيديو بالـ AI

## الخلاصة

المطوّر الذي يتقن استخدام هذه الأدوات يعمل بكفاءة 3-5 أضعاف مقارنة بمن لا يستخدمها.`,
    },
    en:{
      title:"Best AI Tools for Developers in 2025",
      excerpt:"An updated list of the most powerful AI tools every developer should know.",
      date:"Feb 20, 2025",
      content:`AI has radically changed how developers work. Here are the most powerful tools in 2025:

## For Writing & Code

• GitHub Copilot: The strongest for direct code suggestions in your editor
• Claude (Anthropic): Excellent for analysis, documentation, and complex tasks
• Cursor IDE: AI-powered integrated development environment

## For Design

• Midjourney: Professional image generation
• Figma AI: Design suggestions directly in Figma
• v0 by Vercel: Generate React components from text descriptions

## For Content Production

• Sora (OpenAI): Video generation from text
• ElevenLabs: Text-to-speech with human quality
• Runway: AI-powered video editing

## Conclusion

A developer who masters these tools works 3-5x more efficiently than one who doesn't use them.`,
    },
  },
};

const FALLBACK = (slug: string, lang: string) => ({
  emoji:"📝", accentColor:"#00BCD4", category: lang==="ar"?"مقالات":"Articles", readTime:5,
  title:   lang==="ar" ? "مقال APEX" : "APEX Article",
  excerpt: lang==="ar" ? "مقال تقني من فريق APEX." : "A technical article from the APEX team.",
  date:    "",
  content: lang==="ar" ? "المحتوى قريباً." : "Content coming soon.",
});


export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; slug: string }[] = [];
  for (const lang of SUPPORTED_LOCALES) {
    const mdx = await getBlogPosts(lang);
    for (const p of mdx) {
      const k = `${lang}:${p.slug}`;
      if (!seen.has(k)) { seen.add(k); params.push({ lang, slug: p.slug }); }
    }
    for (const slug of Object.keys(MOCK_POSTS)) {
      const k = `${lang}:${slug}`;
      if (!seen.has(k)) { seen.add(k); params.push({ lang, slug }); }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "ar";
  const mdxPost = await getBlogPostBySlug(locale, slug).catch(() => null);
  const mock = MOCK_POSTS[slug]?.[locale as "ar" | "en"];
  const baseTitle = mdxPost?.title ?? mock?.title ?? slug;
  const description = mdxPost?.excerpt ?? mock?.excerpt ?? "";
  const title = `${baseTitle} — APEX`;
  return buildPageMeta(locale, {
    title,
    description,
    path: `/${lang}/blog/${slug}`,
  });
}


export default async function BlogPostPage({
  params,
}: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr    = lang === "ar";
  const mdxPost = await getBlogPostBySlug(lang, slug).catch(() => null);
  const mock    = MOCK_POSTS[slug];
  const mockC   = mock?.[lang as "ar"|"en"];
  const fb      = FALLBACK(slug, lang);

  const title       = mdxPost?.title   ?? mockC?.title   ?? fb.title;
  const excerpt     = mdxPost?.excerpt ?? mockC?.excerpt ?? fb.excerpt;
  const date        = mockC?.date      ?? fb.date;
  const readTime    = mock?.readTime   ?? fb.readTime;
  const emoji       = mock?.emoji      ?? fb.emoji;
  const accentColor = mock?.accentColor ?? fb.accentColor;
  const category    = mock?.category   ?? fb.category;

  
  const rawContent  = mdxPost?.content ?? mockC?.content ?? fb.content;
  const contentLines = rawContent.split("\n");

  const hoverStyles = `
    .apex-back:hover { color: var(--color-primary) !important; }
    .apex-prose-bullet { display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; }
    .apex-related:hover { border-color:var(--color-primary) !important; transform:translateY(-3px); }
  `;

  
  const relatedSlugs = Object.keys(MOCK_POSTS).filter(s => s !== slug).slice(0, 3);

  return (
    <main className="min-h-screen pt-24 pb-24 px-6"
      style={{ background:"var(--color-background)" }} dir={isAr?"rtl":"ltr"}>
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />

      <div className="max-w-3xl mx-auto">

        {}
        <Link href={`/${lang}/blog`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${isAr?"font-ar flex-row-reverse":"font-en"}`}
          style={{ color:"var(--color-secondary-text)" }}>
          <span style={{ display:"inline-block", transform:isAr?"none":"rotate(180deg)" }}>→</span>
          {isAr?"العودة للمدونة":"Back to Blog"}
        </Link>

        
        <div className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height:"clamp(200px,26vw,320px)", background:"linear-gradient(135deg,#0a0a0a,#1a1a2e)" }}>
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
            backgroundSize:"28px 28px",
          }} aria-hidden="true" />
          <div className="absolute rounded-full pointer-events-none"
            style={{ width:"260px",height:"260px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              background:`radial-gradient(circle,${accentColor}30 0%,transparent 70%)` }} aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize:"80px", filter:"drop-shadow(0 0 24px rgba(255,255,255,0.3))" }}>
            {emoji}
          </div>
          <div className="absolute top-4 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ [isAr?"left":"right"]:"16px",
              background:`color-mix(in srgb,${accentColor} 18%,rgba(0,0,0,0.6))`,
              border:`1px solid ${accentColor}55`, color:accentColor, backdropFilter:"blur(8px)" }}>
            {category}
          </div>
        </div>

        
        <div className={`flex items-center gap-3 mb-4 text-xs ${isAr?"flex-row-reverse":""}`}
          style={{ color:"var(--color-secondary-text)" }}>
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span>{readTime} {isAr?"دقائق قراءة":"min read"}</span>
        </div>

        
        <h1 className={`font-bold mb-4 leading-tight ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"clamp(22px,3.5vw,40px)", color:"var(--color-primary-text)" }}>
          {title}
        </h1>

        
        <p className={`text-lg mb-10 leading-relaxed pb-8 border-b ${isAr?"font-ar":"font-en"}`}
          style={{ color:"var(--color-secondary-text)", borderColor:"var(--color-border)" }}>
          {excerpt}
        </p>

        
        <article className="mb-14">
          {contentLines.map((line, i) => {
            if (!line.trim()) return <div key={i} style={{ height:"8px" }} />;
            if (line.startsWith("## ")) return (
              <h2 key={i} className={`apex-prose-h2 ${isAr?"font-ar":"font-en"}`}>
                {line.replace("## ","")}
              </h2>
            );
            if (line.startsWith("### ")) return (
              <h3 key={i} className={`apex-prose-h3 ${isAr?"font-ar":"font-en"}`}>
                {line.replace("### ","")}
              </h3>
            );
            if (line.startsWith("> ")) return (
              <blockquote key={i} className={`apex-prose-quote ${isAr?"font-ar":"font-en"}`}>
                {line.replace("> ","")}
              </blockquote>
            );
            if (line.startsWith("- ")) return (
              <ul key={i} className={`apex-prose-list ${isAr?"font-ar":"font-en"}`}>
                <li>{line.replace("- ","")}</li>
              </ul>
            );
            if (line.startsWith("• ")) return (
              <div key={i} className="apex-prose-bullet">
                <span className="mt-2 w-2 h-2 rounded-full shrink-0"
                  style={{ background:accentColor, boxShadow:`0 0 6px ${accentColor}` }} />
                <span className={`apex-prose-p ${isAr?"font-ar":"font-en"}`} style={{ margin:0 }}>
                  {line.replace("• ","")}
                </span>
              </div>
            );
            return (
              <p key={i} className={`apex-prose-p ${isAr?"font-ar":"font-en"}`}>
                {line}
              </p>
            );
          })}
        </article>

        
        <div className="rounded-2xl p-8 text-center border mb-14"
          style={{ background:"color-mix(in srgb,var(--color-primary) 6%,var(--color-card))",
            borderColor:"color-mix(in srgb,var(--color-primary) 20%,transparent)" }}>
          <p className={`font-bold mb-4 ${isAr?"font-ar":"font-en"}`}
            style={{ fontSize:"18px", color:"var(--color-primary-text)" }}>
            {isAr ? "هل تريد تطبيق هذه الأفكار في مشروعك؟" : "Want to apply these ideas to your project?"}
          </p>
          <Link href={`/${lang}/contact`}
            className="apex-btn inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white"
            style={{ background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow:"0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)" }}>
            {isAr?"تواصل مع فريق APEX":"Contact the APEX Team"}
            <span className={isAr?"rotate-180 inline-block":""}>→</span>
          </Link>
        </div>

        
        <div>
          <h3 className={`font-bold mb-6 ${isAr?"font-ar":"font-en"}`}
            style={{ fontSize:"18px", color:"var(--color-primary-text)" }}>
            {isAr?"مقالات ذات صلة":"Related Articles"}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedSlugs.map(s => {
              const rel = MOCK_POSTS[s]?.[lang as "ar"|"en"];
              if (!rel) return null;
              return (
                <Link key={s} href={`/${lang}/blog/${s}`}
                  className="apex-related rounded-xl p-4 border transition-all duration-200"
                  style={{ background:"var(--color-card)", borderColor:"var(--color-border)", textDecoration:"none" }}
                  dir={isAr?"rtl":"ltr"}>
                  <div className="text-2xl mb-2">{MOCK_POSTS[s].emoji}</div>
                  <p className={`text-xs font-semibold leading-snug ${isAr?"font-ar":"font-en"}`}
                    style={{ color:"var(--color-primary-text)" }}>
                    {rel.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
