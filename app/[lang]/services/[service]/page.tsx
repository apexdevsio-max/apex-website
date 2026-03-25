
import Link              from "next/link";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";

import { getServiceBySlug, getServices } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale }   from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";


const MOCK_SERVICES: Record<string, {
  emoji: string; accentColor: string; gradient: string;
  ar: { title: string; summary: string; ctaLabel: string; features: string[]; process: string[]; result: string };
  en: { title: string; summary: string; ctaLabel: string; features: string[]; process: string[]; result: string };
}> = {
  "web-development": {
    emoji:"🌐", accentColor:"#00BCD4", gradient:"linear-gradient(135deg,#0f2027,#203a43)",
    ar:{ title:"تطوير الويب", summary:"نبني مواقع وتطبيقات ويب احترافية بأحدث التقنيات.", ctaLabel:"ابدأ مشروع ويب",
      features:["تطوير بـ Next.js وReact","أداء عالٍ وسرعة تحميل استثنائية","تصميم متجاوب لكل الأجهزة","SEO مدمج من الأساس","لوحة تحكم سهلة الاستخدام","أمان وحماية من الثغرات"],
      process:["تحليل متطلباتك وبناء الخطة","تصميم Wireframes والـ Prototype","التطوير الكامل وربط قاعدة البيانات","الاختبار والتأكد من الجودة","الإطلاق والدعم المستمر"],
      result:"مواقع تحقق نتائج حقيقية — معدلات تحويل أعلى وتجربة مستخدم لا تُنسى." },
    en:{ title:"Web Development", summary:"We build professional websites and web applications with cutting-edge technology.", ctaLabel:"Start a Web Project",
      features:["Development with Next.js & React","High performance and exceptional load speed","Responsive design for all devices","Built-in SEO from the ground up","Easy-to-use admin dashboard","Security and vulnerability protection"],
      process:["Analyze requirements and build the plan","Design Wireframes and Prototype","Full development and database integration","Testing and quality assurance","Launch and ongoing support"],
      result:"Websites that deliver real results — higher conversion rates and an unforgettable user experience." },
  },
  "mobile-apps": {
    emoji:"📱", accentColor:"#FFBF00", gradient:"linear-gradient(135deg,#0f0c29,#302b63)",
    ar:{ title:"تطبيقات الموبايل", summary:"نطوّر تطبيقات iOS وAndroid احترافية.", ctaLabel:"ابنِ تطبيقك",
      features:["تطبيقات أصيلة وهجينة","تصميم UI/UX عصري","أداء سلس على كل الأجهزة","إشعارات Push وربط API","نشر على App Store وGoogle Play","صيانة ودعم مستمر"],
      process:["تحديد نوع التطبيق والتقنية","تصميم شاشات التطبيق","التطوير والاختبار","الرفع على المتاجر","المتابعة والتحديثات"],
      result:"تطبيقات يحبها المستخدمون — تقييمات عالية ومعدل احتفاظ ممتاز." },
    en:{ title:"Mobile Apps", summary:"We develop professional iOS and Android applications.", ctaLabel:"Build Your App",
      features:["Native and hybrid applications","Modern UI/UX design","Smooth performance on all devices","Push notifications and API integration","Publishing on App Store & Google Play","Ongoing maintenance and support"],
      process:["Define app type and technology","Design app screens","Development and testing","App store submission","Follow-up and updates"],
      result:"Apps users love — high ratings and excellent retention rates." },
  },
  "ai-solutions": {
    emoji:"🤖", accentColor:"#4DD0E1", gradient:"linear-gradient(135deg,#0d0d1a,#1a0533)",
    ar:{ title:"حلول الذكاء الاصطناعي", summary:"ندمج AI في منتجاتك لتضاعف كفاءتك.", ctaLabel:"استكشف حلول AI",
      features:["دمج OpenAI وClaude APIs","بناء Chatbots ذكية","أتمتة العمليات المتكررة","تحليل البيانات والتنبؤ","توليد المحتوى بالـ AI","تخصيص تجربة المستخدم"],
      process:["تحليل عملياتك الحالية","تحديد نقاط التحسين بالـ AI","بناء النموذج الأولي","التدريب والاختبار","التكامل والإطلاق"],
      result:"أتمتة تُوفّر 60% من وقت فريقك وتُحسّن دقة القرارات." },
    en:{ title:"AI Solutions", summary:"We integrate AI into your products to multiply your efficiency.", ctaLabel:"Explore AI Solutions",
      features:["OpenAI and Claude API integration","Building intelligent chatbots","Automating repetitive processes","Data analysis and prediction","AI-powered content generation","Personalizing user experience"],
      process:["Analyze your current operations","Identify AI improvement points","Build the prototype","Training and testing","Integration and launch"],
      result:"Automation that saves 60% of your team's time and improves decision accuracy." },
  },
  "uiux-design": {
    emoji:"🎨", accentColor:"#5C6BC0", gradient:"linear-gradient(135deg,#141e30,#243b55)",
    ar:{ title:"تصميم UI/UX", summary:"نصمم تجارب مستخدم استثنائية تُحوّل الزوار لعملاء.", ctaLabel:"صمّم معنا",
      features:["أبحاث المستخدم والـ User Journey","Wireframes وPrototypes تفاعلية","تصميم نظام بصري متماسك","اختبار قابلية الاستخدام","تسليم Design System كامل","دعم الـ Handoff للمطورين"],
      process:["أبحاث وتحليل المستخدم","رسم User Journey Maps","بناء Wireframes","التصميم البصري الكامل","الاختبار والتحسين"],
      result:"تصاميم تُقلّل معدل الارتداد 45% وتُضاعف معدل التحويل." },
    en:{ title:"UI/UX Design", summary:"We design exceptional user experiences that turn visitors into customers.", ctaLabel:"Design With Us",
      features:["User research and User Journey","Interactive Wireframes and Prototypes","Cohesive visual design system","Usability testing","Full Design System delivery","Developer handoff support"],
      process:["User research and analysis","Draw User Journey Maps","Build Wireframes","Complete visual design","Testing and refinement"],
      result:"Designs that reduce bounce rate by 45% and double conversion rates." },
  },
  "ecommerce": {
    emoji:"🛒", accentColor:"#FFBF00", gradient:"linear-gradient(135deg,#1a1a2e,#16213e)",
    ar:{ title:"المتاجر الإلكترونية", summary:"نبني متاجر تبيع على مدار الساعة.", ctaLabel:"أطلق متجرك",
      features:["كتالوج منتجات متقدم","بوابات دفع موثوقة","إدارة مخزون ذكية","تحليلات مبيعات تفصيلية","دعم تعدد العملات والشحن","SEO للمتاجر الإلكترونية"],
      process:["تحديد نموذج العمل","تصميم تجربة التسوق","بناء المتجر والتكاملات","اختبار عمليات الدفع","الإطلاق والتسويق"],
      result:"متاجر تُحقق ROI خلال الأشهر الأولى — زيادة مبيعات موثّقة." },
    en:{ title:"E-Commerce", summary:"We build stores that sell around the clock.", ctaLabel:"Launch Your Store",
      features:["Advanced product catalog","Reliable payment gateways","Smart inventory management","Detailed sales analytics","Multi-currency and shipping support","E-commerce SEO"],
      process:["Define business model","Design the shopping experience","Build store and integrations","Test payment flows","Launch and marketing"],
      result:"Stores that achieve ROI within the first months — documented sales growth." },
  },
  "content-creation": {
    emoji:"🎬", accentColor:"#4DD0E1", gradient:"linear-gradient(135deg,#0d1b2a,#1b263b)",
    ar:{ title:"صناعة المحتوى", summary:"ننتج محتوى يُبهر ويحوّل المشاهدين لعملاء.", ctaLabel:"أنتج محتوى مميز",
      features:["فيديوهات إعلانية احترافية","ريلز وتيك توك مميزة","تصاميم سوشيال ميديا","محتوى AI بأحدث الأدوات","سيناريو وإخراج احترافي","توزيع على المنصات"],
      process:["تحديد الهوية والرسالة","كتابة السيناريو والمحتوى","الإنتاج والتصوير/التصميم","المونتاج والتحرير","النشر والتحليل"],
      result:"محتوى يُضاعف التفاعل 5 أضعاف ويُحوّل المشاهدين لعملاء فعليين." },
    en:{ title:"Content Creation", summary:"We produce content that dazzles and converts viewers into customers.", ctaLabel:"Create Great Content",
      features:["Professional ad videos","Standout Reels and TikToks","Social media designs","AI-powered content with latest tools","Professional scripting and direction","Multi-platform distribution"],
      process:["Define brand identity and message","Write scripts and content","Production and filming/design","Editing and post-production","Publishing and analytics"],
      result:"Content that multiplies engagement 5x and converts viewers into real customers." },
  },
};


export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; service: string }[] = [];
  for (const lang of SUPPORTED_LOCALES) {
    const mdx = await getServices(lang);
    for (const s of mdx) {
      const k = `${lang}:${s.slug}`;
      if (!seen.has(k)) { seen.add(k); params.push({ lang, service: s.slug }); }
    }
    for (const slug of Object.keys(MOCK_SERVICES)) {
      const k = `${lang}:${slug}`;
      if (!seen.has(k)) { seen.add(k); params.push({ lang, service: slug }); }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; service: string }> }): Promise<Metadata> {
  const { lang, service: slug } = await params;
  const locale = isLocale(lang) ? lang : "ar";
  const mdx = await getServiceBySlug(locale, slug).catch(() => null);
  const mock = MOCK_SERVICES[slug]?.[locale as "ar"|"en"];
  const title = `${mdx?.title ?? mock?.title ?? slug} — APEX`;
  const description = mdx?.summary ?? mock?.summary ?? "";
  return buildPageMeta(locale, {
    title,
    description,
    path: `/${lang}/services/${slug}`,
  });
}


export default async function ServiceDetailsPage({
  params,
}: { params: Promise<{ lang: string; service: string }> }) {
  const { lang, service: slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr    = lang === "ar";
  const mdxItem = await getServiceBySlug(lang, slug).catch(() => null);
  const mock    = MOCK_SERVICES[slug];
  if (!mdxItem && !mock) notFound();

  const mockContent = mock?.[lang as "ar"|"en"];
  const title       = mdxItem?.title       ?? mockContent?.title       ?? slug;
  const summary     = mdxItem?.summary     ?? mockContent?.summary     ?? "";
  const description = mdxItem?.description ?? "";
  const ctaLabel    = mdxItem?.ctaLabel    ?? mockContent?.ctaLabel    ?? (isAr?"تواصل معنا":"Contact Us");
  const emoji       = mock?.emoji          ?? "🚀";
  const accentColor = mock?.accentColor    ?? "var(--color-primary)";
  const gradient    = mock?.gradient       ?? "linear-gradient(135deg,#0a0a0a,#1a1a2e)";
  const features    = mockContent?.features ?? [];
  const process     = mockContent?.process  ?? [];
  const result      = mockContent?.result   ?? "";

  const hoverStyles = `
    .apex-back:hover  { color:var(--color-primary) !important; }
    .apex-feature     { transition:border-color 0.2s ease, background 0.2s ease; }
    .apex-feature:hover { border-color:${accentColor} !important; background:color-mix(in srgb,${accentColor} 6%,var(--color-card)) !important; }
    .apex-cta-btn:hover { opacity:0.92; transform:translateY(-2px); }
    .apex-btn-outline:hover { background:color-mix(in srgb,var(--color-primary) 10%,transparent); }
  `;

  return (
    <main className="min-h-screen pt-24 pb-24 px-6"
      style={{ background:"var(--color-background)" }} dir={isAr?"rtl":"ltr"}>
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />

      <div className="max-w-4xl mx-auto">

        {}
        <Link href={`/${lang}/services`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${isAr?"font-ar flex-row-reverse":"font-en"}`}
          style={{ color:"var(--color-secondary-text)" }}>
          <span style={{ display:"inline-block", transform:isAr?"none":"rotate(180deg)" }}>→</span>
          {isAr?"العودة للخدمات":"Back to Services"}
        </Link>

        
        <div className="relative rounded-3xl overflow-hidden mb-10"
          style={{ height:"clamp(200px,26vw,320px)", background:gradient }}>
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
            backgroundSize:"28px 28px",
          }} aria-hidden="true" />
          <div className="absolute rounded-full pointer-events-none"
            style={{ width:"280px",height:"280px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              background:`radial-gradient(circle,${accentColor}32 0%,transparent 70%)` }}
            aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize:"88px",filter:"drop-shadow(0 0 28px rgba(255,255,255,0.32))" }}>
            {emoji}
          </div>
        </div>

        
        <h1 className={`font-bold mb-4 leading-tight ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"clamp(24px,3.5vw,42px)", color:"var(--color-primary-text)" }}>
          {title}
        </h1>
        <p className={`text-lg mb-10 leading-relaxed pb-8 border-b ${isAr?"font-ar":"font-en"}`}
          style={{ color:"var(--color-secondary-text)", borderColor:"var(--color-border)" }}>
          {summary}
        </p>

        
        {description && (
          <div className={`rounded-2xl border p-8 mb-10 leading-loose whitespace-pre-line ${isAr?"font-ar":"font-en"}`}
            style={{ background:"var(--color-card)", borderColor:"var(--color-border)",
              color:"var(--color-primary-text)", fontSize:"15px" }}>
            {description}
          </div>
        )}

        
        {(features.length > 0 || process.length > 0) && (
          <div className="grid md:grid-cols-2 gap-8 mb-10">

            
            {features.length > 0 && (
              <div>
                <h2 className={`font-bold mb-5 ${isAr?"font-ar":"font-en"}`}
                  style={{ fontSize:"17px", color:"var(--color-primary-text)" }}>
                  {isAr?"ما تشمله الخدمة":"What's Included"}
                </h2>
                <div className="space-y-2">
                  {features.map((f, i) => (
                    <div key={i} className="apex-feature flex items-center gap-3 p-3 rounded-xl border"
                      style={{ background:"var(--color-card)", borderColor:"var(--color-border)",
                        flexDirection:isAr?"row-reverse":"row" }}>
                      <span className="w-2 h-2 rounded-full shrink-0"
                        style={{ background:accentColor, boxShadow:`0 0 6px ${accentColor}` }} />
                      <span className={`text-sm ${isAr?"font-ar":"font-en"}`}
                        style={{ color:"var(--color-primary-text)" }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {process.length > 0 && (
              <div>
                <h2 className={`font-bold mb-5 ${isAr?"font-ar":"font-en"}`}
                  style={{ fontSize:"17px", color:"var(--color-primary-text)" }}>
                  {isAr?"كيف نعمل؟":"Our Process"}
                </h2>
                <div className="space-y-3">
                  {process.map((step, i) => (
                    <div key={i} className="flex items-start gap-3"
                      style={{ flexDirection:isAr?"row-reverse":"row" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ background:`color-mix(in srgb,${accentColor} 16%,transparent)`,
                          color:accentColor, border:`1px solid ${accentColor}35` }}>
                        {i + 1}
                      </div>
                      <p className={`text-sm leading-relaxed pt-0.5 ${isAr?"font-ar":"font-en"}`}
                        style={{ color:"var(--color-primary-text)" }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        
        {result && (
          <div className="rounded-2xl p-7 mb-10 border"
            style={{ background:`color-mix(in srgb,${accentColor} 7%,var(--color-card))`,
              borderColor:`${accentColor}40` }}>
            <div className="flex items-start gap-4" style={{ flexDirection:isAr?"row-reverse":"row" }}>
              <span className="text-3xl shrink-0">🏆</span>
              <div style={{ textAlign:isAr?"right":"left" }}>
                <p className={`font-bold mb-1 ${isAr?"font-ar":"font-en"}`}
                  style={{ color:accentColor, fontSize:"14px" }}>
                  {isAr?"النتائج المتوقعة":"Expected Results"}
                </p>
                <p className={`text-sm leading-relaxed ${isAr?"font-ar":"font-en"}`}
                  style={{ color:"var(--color-primary-text)" }}>
                  {result}
                </p>
              </div>
            </div>
          </div>
        )}

        
        <div className={`flex flex-wrap gap-4 ${isAr?"flex-row-reverse":""}`}>
          <Link href={`/${lang}/contact`}
            className="apex-cta-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all"
            style={{ background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow:"0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)" }}>
            {ctaLabel}
            <span style={{ display:"inline-block", transform:isAr?"rotate(180deg)":"none" }}>→</span>
          </Link>
          <Link href={`/${lang}/services`}
            className="apex-btn-outline inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all border-2"
            style={{ color:"var(--color-primary)", borderColor:"var(--color-primary)" }}>
            {isAr?"خدمات أخرى":"Other Services"}
          </Link>
        </div>
      </div>
    </main>
  );
}
