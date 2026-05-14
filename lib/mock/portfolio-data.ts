export type MockPortfolioItem = {
  emoji: string;
  gradient: string;
  accentColor: string;
  tags: string[];
  category: string;
  ar: { title: string; summary: string; description: string };
  en: { title: string; summary: string; description: string };
};

export const MOCK_PORTFOLIO: Record<string, MockPortfolioItem> = {
  "ai-video-series": {
    emoji: "🎬",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a0533)",
    accentColor: "#4DD0E1",
    tags: ["Sora", "After Effects", "Midjourney"],
    category: "AI Content",
    ar: {
      title: "سلسلة فيديوهات تسويقية بالذكاء الاصطناعي",
      summary: "إنتاج مرئي متوافق مع الهوية التجارية باستخدام أدوات AI.",
      description:
        "أنتجنا سلسلة فيديوهات تسويقية كاملة تشمل:\n\n• نسخ متعددة للمقاسات والمنصات\n• Motion graphics متقدم\n• سرد بصري منسجم مع الهوية\n• جودة عرض عالية\n• تسليم جاهز للنشر والإعلانات\n\nالنتيجة: حضور رقمي أقوى ومحتوى أسرع إنتاجًا.",
    },
    en: {
      title: "AI-Powered Marketing Video Series",
      summary: "Brand-aligned visual production built with modern AI tools.",
      description:
        "We produced a full marketing video series including:\n\n• Multi-format deliverables for several platforms\n• Advanced motion graphics\n• Brand-aligned storytelling\n• High-quality output\n• Assets ready for publishing and ads\n\nResult: stronger digital presence and faster content production.",
    },
  },
  "ai-design-brand": {
    emoji: "🎨",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a0533)",
    accentColor: "#00BCD4",
    tags: ["Midjourney", "Figma", "Canva AI"],
    category: "AI Content",
    ar: {
      title: "هوية بصرية مدعومة بالذكاء الاصطناعي",
      summary: "نظام بصري متكامل صُمم باستخدام أدوات AI وFigma.",
      description:
        "قدمنا هوية بصرية تشمل:\n\n• شعارًا حديثًا\n• دليل استخدام أساسي\n• قوالب شبكات اجتماعية\n• ألوانًا وخطوطًا وأنماطًا مساندة\n• مواد تسويقية رقمية\n\nالنتيجة: ظهور أوضح واتساق أكبر عبر القنوات.",
    },
    en: {
      title: "AI-Assisted Brand Identity",
      summary: "A complete visual system designed with AI tools and Figma.",
      description:
        "We created a brand identity system including:\n\n• A modern logo\n• A compact brand guide\n• Social media templates\n• Supporting colors, type, and patterns\n• Digital marketing collateral\n\nResult: better visibility and stronger consistency across channels.",
    },
  },
};

export const MOCK_PORTFOLIO_SLUGS = Object.keys(MOCK_PORTFOLIO);

export const FALLBACK_PORTFOLIO = (slug: string, lang: string) => ({
  emoji: "🚀",
  gradient: "linear-gradient(135deg,#0a0a0a,#1a1a2e)",
  accentColor: "#00BCD4",
  tags: ["APEX"],
  category: lang === "ar" ? "مشروع رقمي" : "Digital Project",
  title: lang === "ar" ? "مشروع من APEX" : "An APEX Project",
  summary:
    lang === "ar"
      ? `حل رقمي متكامل يحمل المعرف ${slug}.`
      : `An integrated digital solution under the slug "${slug}".`,
  description:
    lang === "ar"
      ? "تفاصيل المشروع ستتوفر قريبًا."
      : "Project details will be available soon.",
});
