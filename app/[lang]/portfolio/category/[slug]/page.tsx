
import Link              from "next/link";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import {
  getPortfolioItemBySlug,
  getPortfolioItems,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";


const MOCK_DETAIL: Record<string, {
  emoji: string; gradient: string; accentColor: string; tags: string[]; category: string;
  ar: { title: string; summary: string; description: string };
  en: { title: string; summary: string; description: string };
}> = {
  "ecommerce-fashion":     { emoji:"🛒", gradient:"linear-gradient(135deg,#1a1a2e,#16213e)", accentColor:"#00BCD4", tags:["Next.js","Stripe","Tailwind"], category:"E-Commerce",
    ar:{ title:"منصة متجر أزياء متكاملة",     summary:"متجر إلكتروني احترافي مع بوابة دفع آمنة.", description:"بنينا منصة تجارة إلكترونية متكاملة تشمل:\n\n• واجهة مستخدم سلسة وسريعة مع Next.js 14\n• تكامل كامل مع Stripe للمدفوعات الآمنة\n• لوحة تحكم لإدارة المخزون والطلبات\n• نظام تقييمات ومراجعات المنتجات\n• دعم كامل للجوال مع تجربة PWA\n\nالنتيجة: زيادة 40% في معدل التحويل خلال الشهر الأول." },
    en:{ title:"Full Fashion E-Commerce Platform", summary:"Professional online store with secure payment gateway.", description:"We built a complete e-commerce platform including:\n\n• Smooth and fast UI with Next.js 14\n• Full Stripe integration for secure payments\n• Admin dashboard for inventory and order management\n• Product ratings and review system\n• Full mobile support with PWA experience\n\nResult: 40% increase in conversion rate within the first month." } },

  "edu-app-ios":           { emoji:"📚", gradient:"linear-gradient(135deg,#0f0c29,#302b63)", accentColor:"#FFBF00", tags:["React Native","Expo","Firebase"], category:"Mobile App",
    ar:{ title:"تطبيق تعليمي تفاعلي iOS",      summary:"تطبيق موبايل للتعليم بمحتوى تفاعلي.", description:"طورنا تطبيق تعليمي تفاعلي يشمل:\n\n• 200+ درس تفاعلي مع اختبارات ذكية\n• نظام شهادات رقمية موثّقة\n• متابعة تقدم الطالب لحظياً\n• وضع عدم الاتصال الكامل\n• تكامل مع Apple Push Notifications\n\nالنتيجة: 4.8 نجمة على App Store مع 10,000+ تحميل." },
    en:{ title:"Interactive iOS Educational App",  summary:"Mobile learning app with interactive content.", description:"We developed an interactive educational app featuring:\n\n• 200+ interactive lessons with smart quizzes\n• Digital certificate system\n• Real-time student progress tracking\n• Full offline mode\n• Apple Push Notifications integration\n\nResult: 4.8 stars on App Store with 10,000+ downloads." } },

  "ai-video-series":       { emoji:"🎬", gradient:"linear-gradient(135deg,#0d0d1a,#1a0533)", accentColor:"#4DD0E1", tags:["Sora","After Effects","Midjourney"], category:"AI Content",
    ar:{ title:"سلسلة فيديوهات مصممة بالـ AI",  summary:"إنتاج محتوى فيديو احترافي بأدوات الذكاء الاصطناعي.", description:"أنتجنا سلسلة فيديوهات تسويقية كاملة:\n\n• 12 فيديو احترافي بأدوات AI الجيل الجديد\n• سيناريو وأسلوب سرد مخصص للعلامة التجارية\n• موشن جرافيك متقدم مع After Effects\n• نسخ متعددة للمنصات (YouTube, TikTok, Instagram)\n• جودة 4K مع صوت احترافي\n\nالنتيجة: 500% زيادة في المشاركة على وسائل التواصل." },
    en:{ title:"AI-Designed Video Series",         summary:"Professional video content using AI tools.", description:"We produced a complete marketing video series:\n\n• 12 professional videos with next-gen AI tools\n• Custom brand narrative and storytelling style\n• Advanced motion graphics with After Effects\n• Multiple versions for platforms (YouTube, TikTok, Instagram)\n• 4K quality with professional audio\n\nResult: 500% increase in social media engagement." } },

  "mobile-game-adventure": { emoji:"🎮", gradient:"linear-gradient(135deg,#0d1b2a,#1b263b)", accentColor:"#FFBF00", tags:["Unity","C#","AdMob"], category:"Mobile Game",
    ar:{ title:"لعبة مغامرات موبايل",           summary:"لعبة أكشن ثلاثية الأبعاد بـ Unity.", description:"صممنا وطورنا لعبة مغامرات ثلاثية الأبعاد:\n\n• 50+ مستوى بتصاميم فريدة\n• نظام تقدم وأسلحة قابلة للترقية\n• فيزياء واقعية مع Unity Physics\n• تكامل AdMob للدخل الإعلاني\n• ليدربورد عالمي مع Google Play Games\n\nالنتيجة: 50,000+ تحميل في الأسبوع الأول." },
    en:{ title:"Mobile Adventure Game",            summary:"3D action game built with Unity.", description:"We designed and developed a 3D adventure game:\n\n• 50+ levels with unique designs\n• Progression system with upgradeable weapons\n• Realistic physics with Unity Physics\n• AdMob integration for ad revenue\n• Global leaderboard with Google Play Games\n\nResult: 50,000+ downloads in the first week." } },

  "saas-dashboard":        { emoji:"💻", gradient:"linear-gradient(135deg,#0f2027,#203a43)", accentColor:"#00BCD4", tags:["Next.js","TypeScript","Prisma"], category:"Web Dev",
    ar:{ title:"لوحة تحكم SaaS متقدمة",        summary:"منصة ويب لإدارة الأعمال مع تحليلات.", description:"بنينا منصة SaaS متكاملة تشمل:\n\n• لوحة تحليلات لحظية مع Recharts\n• إدارة المستخدمين والصلاحيات المتعددة\n• تقارير قابلة للتصدير PDF/Excel\n• نظام إشعارات وتنبيهات ذكي\n• API موثّق للتكامل مع الأنظمة الخارجية\n\nالنتيجة: وفّر 60% من وقت الفريق الإداري." },
    en:{ title:"Advanced SaaS Dashboard",          summary:"Business management platform with analytics.", description:"We built a complete SaaS platform featuring:\n\n• Real-time analytics dashboard with Recharts\n• User management with multi-role permissions\n• PDF/Excel exportable reports\n• Smart notification and alert system\n• Documented API for external system integration\n\nResult: Saved 60% of the admin team's time." } },

  "business-app":          { emoji:"📊", gradient:"linear-gradient(135deg,#141e30,#243b55)", accentColor:"#5C6BC0", tags:["Flutter","Dart","REST API"], category:"Mobile App",
    ar:{ title:"تطبيق إدارة أعمال Flutter",     summary:"تطبيق iOS/Android لإدارة الفريق.", description:"طورنا تطبيق أعمال شامل بـ Flutter:\n\n• إدارة المشاريع والمهام بـ Kanban board\n• محادثات داخلية مشفّرة\n• تتبع الوقت والحضور\n• تقارير الأداء المرئية\n• تكامل مع Google Workspace\n\nالنتيجة: رفع إنتاجية الفريق 35% خلال شهر." },
    en:{ title:"Flutter Business Management App",  summary:"iOS/Android app for team management.", description:"We developed a comprehensive business app with Flutter:\n\n• Project and task management with Kanban board\n• Encrypted internal messaging\n• Time and attendance tracking\n• Visual performance reports\n• Google Workspace integration\n\nResult: Boosted team productivity by 35% within a month." } },

  "real-estate-platform":  { emoji:"🏠", gradient:"linear-gradient(135deg,#1a1a2e,#16213e)", accentColor:"#4DD0E1", tags:["Next.js","Maps API","PostgreSQL"], category:"Web Dev",
    ar:{ title:"منصة عقارات رقمية متكاملة",     summary:"موقع عقارات مع خرائط تفاعلية وبحث متقدم.", description:"بنينا منصة عقارية شاملة تشمل:\n\n• خرائط تفاعلية مع Google Maps API\n• بحث متقدم بفلاتر متعددة\n• نظام إدارة قوائم العقارات\n• لوحة تحكم للوكلاء والمشترين\n• تكامل مع بوابات الدفع المحلية\n\nالنتيجة: 1000+ عقار مدرج في أول شهرين." },
    en:{ title:"Integrated Real Estate Platform",  summary:"Real estate website with interactive maps and advanced search.", description:"We built a comprehensive real estate platform featuring:\n\n• Interactive maps with Google Maps API\n• Advanced search with multiple filters\n• Property listing management system\n• Dashboard for agents and buyers\n• Integration with local payment gateways\n\nResult: 1,000+ properties listed in the first two months." } },

  "food-delivery-app":     { emoji:"🍔", gradient:"linear-gradient(135deg,#200122,#6f0000)", accentColor:"#FFBF00", tags:["React Native","Node.js","MongoDB"], category:"Mobile App",
    ar:{ title:"تطبيق توصيل طعام سريع",         summary:"تطبيق توصيل مع تتبع لحظي للطلب.", description:"طورنا تطبيق توصيل متكامل يشمل:\n\n• تتبع لحظي للطلب على الخريطة\n• إدارة مطاعم ومطابخ متعددة\n• نظام تقييمات وتعليقات المستخدمين\n• دفع رقمي وكاش عند الاستلام\n• إشعارات لحظية لكل مرحلة من الطلب\n\nالنتيجة: 200+ مطعم مسجّل في أول 3 أشهر." },
    en:{ title:"Fast Food Delivery App",           summary:"Delivery app with real-time order tracking.", description:"We developed a complete delivery app featuring:\n\n• Real-time order tracking on the map\n• Multi-restaurant and cloud kitchen management\n• User ratings and review system\n• Digital payments and cash on delivery\n• Real-time notifications at every order stage\n\nResult: 200+ registered restaurants in the first 3 months." } },

  "ai-design-brand":       { emoji:"🎨", gradient:"linear-gradient(135deg,#0d0d1a,#1a0533)", accentColor:"#00BCD4", tags:["Midjourney","Figma","Canva AI"], category:"AI Content",
    ar:{ title:"هوية بصرية مصممة بالـ AI",       summary:"هوية تجارية متكاملة بأدوات الذكاء الاصطناعي.", description:"صممنا هوية بصرية متكاملة تشمل:\n\n• شعار احترافي مصمم بـ Midjourney + Figma\n• دليل استخدام الهوية البصرية (Brand Guide)\n• قوالب سوشيال ميديا جاهزة للاستخدام\n• ألوان وخطوط وأنماط مخصصة للعلامة\n• مواد تسويقية رقمية وطباعية\n\nالنتيجة: هوية متماسكة رفعت التعرف على العلامة 80%." },
    en:{ title:"AI-Designed Brand Identity",       summary:"Complete brand identity designed with AI tools.", description:"We designed a complete brand identity including:\n\n• Professional logo designed with Midjourney + Figma\n• Full Brand Usage Guide\n• Ready-to-use social media templates\n• Custom colors, fonts, and brand patterns\n• Digital and print marketing materials\n\nResult: Cohesive identity that increased brand recognition by 80%." } },

  "electronics-store":     { emoji:"📱", gradient:"linear-gradient(135deg,#0f2027,#2c5364)", accentColor:"#5C6BC0", tags:["WooCommerce","WordPress","PHP"], category:"E-Commerce",
    ar:{ title:"متجر إلكترونيات ومستلزمات",      summary:"متجر إلكتروني لبيع الإلكترونيات.", description:"بنينا متجر إلكترونيات متكامل يشمل:\n\n• كتالوج منتجات ضخم مع تصفية متقدمة\n• مقارنة المنتجات جنباً إلى جنب\n• نظام تقييمات وتعليقات التحقق\n• تكامل مع شركات الشحن المحلية\n• لوحة تحكم مبيعات تفصيلية\n\nالنتيجة: 500+ منتج مع معدل مبيعات 150% بعد الإطلاق." },
    en:{ title:"Electronics & Accessories Store",  summary:"E-commerce store for electronics with product comparison.", description:"We built a complete electronics store featuring:\n\n• Large product catalog with advanced filtering\n• Side-by-side product comparison\n• Verified ratings and review system\n• Integration with local shipping companies\n• Detailed sales control panel\n\nResult: 500+ products with 150% sales rate after launch." } },

  "fitness-tracker":       { emoji:"💪", gradient:"linear-gradient(135deg,#1a1a2e,#0f3460)", accentColor:"#FFBF00", tags:["Swift","HealthKit","SwiftUI"], category:"Mobile App",
    ar:{ title:"تطبيق تتبع اللياقة البدنية",     summary:"تطبيق iOS بتكامل HealthKit.", description:"طورنا تطبيق لياقة احترافي يشمل:\n\n• تتبع التمارين والسعرات الحرارية يومياً\n• تكامل مع Apple Watch و HealthKit\n• خطط تمرين مخصصة بالذكاء الاصطناعي\n• تتبع النوم وجودة الراحة\n• مجتمع تحديات ومنافسات أسبوعية\n\nالنتيجة: 4.9 نجمة على App Store مع 25,000+ مستخدم نشط." },
    en:{ title:"Fitness & Health Tracker App",     summary:"iOS app with HealthKit integration.", description:"We developed a professional fitness app featuring:\n\n• Daily workout and calorie tracking\n• Apple Watch and HealthKit integration\n• AI-personalized workout plans\n• Sleep and recovery quality tracking\n• Community challenges and weekly competitions\n\nResult: 4.9 stars on App Store with 25,000+ active users." } },

  "uiux-banking":          { emoji:"🏦", gradient:"linear-gradient(135deg,#0a0a0a,#1a1a2e)", accentColor:"#4DD0E1", tags:["Figma","Protopie","User Research"], category:"UI/UX",
    ar:{ title:"تصميم UI/UX تطبيق بنكي",         summary:"دراسة حالة تصميمية شاملة لتطبيق بنكي.", description:"أجرينا دراسة حالة تصميمية متكاملة تشمل:\n\n• أبحاث مستخدم مع 50+ مقابلة عمق\n• رسم خرائط رحلة المستخدم (User Journey)\n• Wireframes و Prototypes تفاعلية\n• اختبار قابلية الاستخدام مع مجموعات تركيز\n• توثيق نظام التصميم (Design System)\n\nالنتيجة: خفّض معدل التخلي عن التطبيق 45%." },
    en:{ title:"Banking App UI/UX Design",         summary:"Comprehensive design case study for a banking app.", description:"We conducted a comprehensive design case study including:\n\n• User research with 50+ in-depth interviews\n• User Journey mapping\n• Interactive Wireframes and Prototypes\n• Usability testing with focus groups\n• Design System documentation\n\nResult: Reduced app abandonment rate by 45%." } },
};

const CATEGORIES_AR = [
  { key: "all",       label: "الكل" },
  { key: "web",       label: "تطوير ويب" },
  { key: "mobile",    label: "تطبيقات موبايل" },
  { key: "ecommerce", label: "متاجر إلكترونية" },
  { key: "ai",        label: "ذكاء اصطناعي" },
];
const CATEGORIES_EN = [
  { key: "all",       label: "All" },
  { key: "web",       label: "Web Dev" },
  { key: "mobile",    label: "Mobile Apps" },
  { key: "ecommerce", label: "E-Commerce" },
  { key: "ai",        label: "AI Content" },
];

const FALLBACK_DATA = (slug: string, lang: string) => ({
  emoji: "🚀", gradient: "linear-gradient(135deg,#0a0a0a,#1a1a2e)",
  accentColor: "#00BCD4", tags: ["APEX"],
  category: lang === "ar" ? "مشروع رقمي" : "Digital Project",
  title:       lang === "ar" ? "مشروع APEX"              : "APEX Project",
  summary:     lang === "ar" ? "مشروع رقمي متكامل من APEX." : "An integrated digital project by APEX.",
  description: lang === "ar" ? "تفاصيل المشروع قريباً."     : "Project details coming soon.",
});


export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; slug: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const mdxItems = await getPortfolioItems(lang);
    for (const item of mdxItems) {
      const key = `${lang}:${item.slug}`;
      if (!seen.has(key)) { seen.add(key); params.push({ lang, slug: item.slug }); }
    }
    for (const slug of Object.keys(MOCK_DETAIL)) {
      const key = `${lang}:${slug}`;
      if (!seen.has(key)) { seen.add(key); params.push({ lang, slug }); }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const isAr = lang === "ar";
  const category = (isAr ? CATEGORIES_AR : CATEGORIES_EN).find((c) => c.key === slug);
  const title = category ? `${category.label} — APEX` : `${slug} — APEX`;
  const description = isAr
    ? "استكشف أعمال APEX ضمن هذا التصنيف."
    : "Explore APEX projects in this category.";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title,
    description,
    path: `/${lang}/portfolio/category/${slug}`,
  });
}


export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr = lang === "ar";

  
  const mdxItem     = await getPortfolioItemBySlug(lang, slug);
  const mock        = MOCK_DETAIL[slug];
  const mockContent = mock?.[lang as "ar" | "en"];
  const fb          = FALLBACK_DATA(slug, lang);

  const title       = mdxItem?.title       ?? mockContent?.title       ?? fb.title;
  const summary     = mdxItem?.summary     ?? mockContent?.summary     ?? fb.summary;
  const description = mdxItem?.description ?? mockContent?.description ?? fb.description;
  const emoji       = mock?.emoji       ?? fb.emoji;
  const gradient    = mock?.gradient    ?? fb.gradient;
  const accentColor = mock?.accentColor ?? fb.accentColor;
  const tags        = mock?.tags        ?? fb.tags;
  const category    = mock?.category    ?? fb.category;

  
  const hoverStyles = `
    .apex-back-link:hover { color: var(--color-primary) !important; }
    .apex-tag-chip        { background: color-mix(in srgb,var(--color-primary) 12%,transparent); color:var(--color-primary); border:1px solid color-mix(in srgb,var(--color-primary) 28%,transparent); }
    .apex-btn-primary     { background:linear-gradient(135deg,var(--color-primary),var(--color-accent)); box-shadow:0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent); }
    .apex-btn-primary:hover { opacity:0.92; transform:translateY(-2px); }
    .apex-btn-outline     { color:var(--color-primary); border:2px solid var(--color-primary); }
    .apex-btn-outline:hover { background:color-mix(in srgb,var(--color-primary) 10%,transparent); }
    .apex-result-item     { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid var(--color-border); }
    .apex-result-item:last-child { border-bottom:none; }
  `;

  
  const lines = description.split("\n").filter(l => l.trim() !== "");

  return (
    <main
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />

      <div className="max-w-4xl mx-auto">

        {}
        <Link
          href={`/${lang}/portfolio`}
          className={`apex-back-link inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${isAr ? "font-ar flex-row-reverse" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span style={{ display:"inline-block", transform: isAr ? "none" : "rotate(180deg)" }}>→</span>
          {isAr ? "العودة لجميع الأعمال" : "Back to Portfolio"}
        </Link>

        
        <div className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height:"clamp(240px,30vw,380px)", background: gradient }}>
          
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
            backgroundSize:"28px 28px",
          }} aria-hidden="true" />
          
          <div className="absolute rounded-full pointer-events-none"
            style={{ width:"300px",height:"300px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              background:`radial-gradient(circle,${accentColor}35 0%,transparent 70%)` }}
            aria-hidden="true" />
          
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize:"96px", filter:"drop-shadow(0 0 30px rgba(255,255,255,0.35))" }}>
            {emoji}
          </div>
          
          <div className="absolute top-4 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left":"right"]:"16px",
              background:`color-mix(in srgb,${accentColor} 18%,rgba(0,0,0,0.6))`,
              border:`1px solid ${accentColor}55`,
              color: accentColor,
              backdropFilter:"blur(8px)",
            }}>
            {category}
          </div>
        </div>

        
        <div className={`flex flex-wrap gap-2 mb-5 ${isAr ? "flex-row-reverse" : ""}`}>
          {tags.map(t => (
            <span key={t} className="apex-tag-chip text-xs font-bold px-3 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>

        
        <h1 className={`font-bold mb-4 leading-tight ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize:"clamp(24px,3.5vw,42px)", color:"var(--color-primary-text)" }}>
          {title}
        </h1>

        <p className={`text-lg mb-10 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
          style={{ color:"var(--color-secondary-text)" }}>
          {summary}
        </p>

        
        <div
          className="rounded-2xl border p-8 mb-12"
          style={{ background:"var(--color-card)", borderColor:"var(--color-border)" }}
        >
          {lines.map((line, i) => {
            const isBullet = line.startsWith("•");
            const isResult = line.startsWith("النتيجة") || line.startsWith("Result");

            if (isResult) return (
              <div key={i} className={`mt-6 pt-5 border-t ${isAr ? "font-ar" : "font-en"}`}
                style={{ borderColor:"var(--color-border)" }}>
                <p className="font-bold" style={{ color: accentColor, fontSize:"15px" }}>{line}</p>
              </div>
            );

            if (isBullet) return (
              <div key={i} className="apex-result-item">
                <span className="mt-1 w-2 h-2 rounded-full shrink-0"
                  style={{ background: accentColor, boxShadow:`0 0 8px ${accentColor}` }} />
                <span className={`text-sm leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                  style={{ color:"var(--color-primary-text)" }}>
                  {line.replace("• ", "")}
                </span>
              </div>
            );

            return (
              <p key={i} className={`mb-3 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                style={{ color:"var(--color-secondary-text)", fontSize:"15px" }}>
                {line}
              </p>
            );
          })}
        </div>

        
        <div className={`flex flex-wrap gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
          <Link
            href={`/${lang}/contact`}
            className={`apex-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all ${isAr ? "font-ar" : "font-en"}`}
          >
            {isAr ? "ابدأ مشروعاً مشابهاً" : "Start a Similar Project"}
            <span style={{ display:"inline-block", transform: isAr ? "rotate(180deg)" : "none" }}>→</span>
          </Link>
          <Link
            href={`/${lang}/portfolio`}
            className={`apex-btn-outline inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all ${isAr ? "font-ar" : "font-en"}`}
          >
            {isAr ? "عرض المزيد من الأعمال" : "More Projects"}
          </Link>
        </div>
      </div>
    </main>
  );
}
