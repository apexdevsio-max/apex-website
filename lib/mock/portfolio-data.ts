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
  "ecommerce-fashion": {
    emoji: "🛒",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    accentColor: "#00BCD4",
    tags: ["Next.js", "Stripe", "Tailwind"],
    category: "E-Commerce",
    ar: {
      title: "منصة متجر أزياء متكاملة",
      summary: "متجر إلكتروني احترافي مع تجربة شراء سريعة وآمنة.",
      description:
        "بنينا منصة تجارة إلكترونية متكاملة تشمل:\n\n• واجهة شراء سريعة وواضحة\n• تكامل مع بوابة دفع آمنة\n• إدارة للمخزون والطلبات\n• نظام تقييمات ومراجعات\n• تجربة محسنة على الجوال\n\nالنتيجة: تحسن واضح في معدل التحويل خلال الأسابيع الأولى.",
    },
    en: {
      title: "Integrated Fashion Store Platform",
      summary: "A polished online store with a fast and secure buying experience.",
      description:
        "We built a complete e-commerce platform including:\n\n• A clear and fast storefront\n• Secure payment gateway integration\n• Inventory and order management\n• Ratings and reviews\n• A strong mobile shopping experience\n\nResult: a measurable conversion lift in the first weeks after launch.",
    },
  },
  "edu-app-ios": {
    emoji: "📚",
    gradient: "linear-gradient(135deg,#0f0c29,#302b63)",
    accentColor: "#FFBF00",
    tags: ["React Native", "Expo", "Firebase"],
    category: "Mobile App",
    ar: {
      title: "تطبيق تعليمي تفاعلي",
      summary: "تجربة تعلم على الجوال مع محتوى تفاعلي وتتبع للتقدم.",
      description:
        "طوّرنا تطبيقًا تعليميًا يضم:\n\n• دروسًا واختبارات تفاعلية\n• متابعة تقدم المتعلم\n• وضع استخدام دون اتصال\n• إشعارات ذكية\n• بنية سهلة للإدارة والتحديث\n\nالنتيجة: تجربة تعليمية أفضل ومعدلات استخدام أعلى.",
    },
    en: {
      title: "Interactive Learning App",
      summary: "A mobile learning experience with interactive content and progress tracking.",
      description:
        "We delivered a mobile learning app featuring:\n\n• Interactive lessons and quizzes\n• Learner progress tracking\n• Offline usage mode\n• Smart notifications\n• Easy content administration\n\nResult: better engagement and a smoother learning journey.",
    },
  },
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
  "saas-dashboard": {
    emoji: "💻",
    gradient: "linear-gradient(135deg,#0f2027,#203a43)",
    accentColor: "#00BCD4",
    tags: ["Next.js", "TypeScript", "Prisma"],
    category: "Web Dev",
    ar: {
      title: "لوحة تحكم SaaS تحليلية",
      summary: "منصة ويب لإدارة العمليات مع لوحات وبيانات لحظية.",
      description:
        "صممنا وبنينا منصة SaaS تشمل:\n\n• لوحة مؤشرات لحظية\n• إدارة مستخدمين وصلاحيات\n• تقارير قابلة للتصدير\n• تنبيهات وإشعارات\n• واجهات تكامل خارجية\n\nالنتيجة: قرارات أسرع وتقليل وقت المتابعة اليدوية.",
    },
    en: {
      title: "Analytics SaaS Dashboard",
      summary: "A web platform for operations management with live dashboards.",
      description:
        "We designed and built a SaaS product that includes:\n\n• Real-time dashboards\n• User and permission management\n• Exportable reports\n• Alerts and notifications\n• External integration endpoints\n\nResult: faster decisions and less manual follow-up work.",
    },
  },
  "real-estate-platform": {
    emoji: "🏠",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    accentColor: "#4DD0E1",
    tags: ["Next.js", "Maps API", "PostgreSQL"],
    category: "Web Dev",
    ar: {
      title: "منصة عقارية رقمية",
      summary: "موقع عقارات مع خرائط تفاعلية وبحث متقدم.",
      description:
        "بنينا منصة عقارية شاملة تتضمن:\n\n• خرائط تفاعلية\n• بحثًا بمرشحات متعددة\n• إدارة قوائم العقارات\n• لوحات تحكم للأطراف المختلفة\n• تجربة استخدام محسنة للباحثين عن العقار\n\nالنتيجة: نشر أسرع للعقارات وتجربة بحث أوضح.",
    },
    en: {
      title: "Real Estate Platform",
      summary: "A property platform with interactive maps and advanced search.",
      description:
        "We built a real estate platform featuring:\n\n• Interactive maps\n• Advanced filtered search\n• Property listing management\n• Dashboards for different stakeholders\n• A clearer browsing experience for buyers and renters\n\nResult: faster listings workflow and better search usability.",
    },
  },
  "food-delivery-app": {
    emoji: "🍔",
    gradient: "linear-gradient(135deg,#200122,#6f0000)",
    accentColor: "#FFBF00",
    tags: ["React Native", "Node.js", "MongoDB"],
    category: "Mobile App",
    ar: {
      title: "تطبيق توصيل طعام",
      summary: "تطبيق طلب وتوصيل مع تتبع لحظي للطلبات.",
      description:
        "طوّرنا تطبيق توصيل متكامل يشمل:\n\n• تتبع مباشر على الخريطة\n• إدارة مطاعم وعروض متعددة\n• تقييمات ومراجعات\n• دفع رقمي ونقدي\n• إشعارات لكل مرحلة من الطلب\n\nالنتيجة: تجربة تشغيل أوضح للمطاعم والمستخدمين معًا.",
    },
    en: {
      title: "Food Delivery App",
      summary: "A delivery app with live order tracking and smooth checkout.",
      description:
        "We developed a complete delivery app featuring:\n\n• Live map tracking\n• Restaurant and offer management\n• Ratings and reviews\n• Digital and cash payments\n• Status notifications across the order lifecycle\n\nResult: a clearer experience for restaurants and end users alike.",
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
  "uiux-banking": {
    emoji: "🏦",
    gradient: "linear-gradient(135deg,#0a0a0a,#1a1a2e)",
    accentColor: "#4DD0E1",
    tags: ["Figma", "ProtoPie", "User Research"],
    category: "UI/UX",
    ar: {
      title: "تصميم UI/UX لتطبيق مالي",
      summary: "دراسة تجربة مستخدم وواجهات لتطبيق يتعامل مع تدفقات حساسة.",
      description:
        "نفذنا دراسة وتجربة تصميم متكاملة تشمل:\n\n• أبحاث مستخدمين\n• خرائط رحلة الاستخدام\n• Wireframes وPrototypes\n• اختبارات قابلية استخدام\n• توثيق نظام تصميم\n\nالنتيجة: رحلة أوضح وثقة أعلى أثناء الاستخدام.",
    },
    en: {
      title: "UI/UX Design for a Financial App",
      summary: "A product design case study for flows that require clarity and trust.",
      description:
        "We ran a full design engagement including:\n\n• User research\n• Journey mapping\n• Wireframes and prototypes\n• Usability testing\n• Design system documentation\n\nResult: a clearer user journey and more confidence across key flows.",
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
