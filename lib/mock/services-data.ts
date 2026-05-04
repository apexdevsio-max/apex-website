export type MockService = {
  emoji:       string;
  accentColor: string;
  gradient:    string;
  ar: { title: string; summary: string; ctaLabel: string; features: string[]; process: string[]; result: string };
  en: { title: string; summary: string; ctaLabel: string; features: string[]; process: string[]; result: string };
};

export const MOCK_SERVICES: Record<string, MockService> = {
  "web-development": {
    emoji: "🌐", accentColor: "#00BCD4",
    gradient: "linear-gradient(135deg,#0f2027,#203a43)",
    ar: {
      title: "تطوير الويب", ctaLabel: "ابدأ مشروع ويب",
      summary:  "نبني مواقع وتطبيقات ويب احترافية بأحدث التقنيات.",
      features: ["تطوير بـ Next.js وReact","أداء عالٍ وسرعة تحميل استثنائية","تصميم متجاوب لكل الأجهزة","SEO مدمج من الأساس","لوحة تحكم سهلة الاستخدام","أمان وحماية من الثغرات"],
      process:  ["تحليل متطلباتك وبناء الخطة","تصميم Wireframes والـ Prototype","التطوير الكامل وربط قاعدة البيانات","الاختبار والتأكد من الجودة","الإطلاق والدعم المستمر"],
      result:   "مواقع تحقق نتائج حقيقية — معدلات تحويل أعلى وتجربة مستخدم لا تُنسى.",
    },
    en: {
      title: "Web Development", ctaLabel: "Start a Web Project",
      summary:  "We build professional websites and web applications with cutting-edge technology.",
      features: ["Development with Next.js & React","High performance and exceptional load speed","Responsive design for all devices","Built-in SEO from the ground up","Easy-to-use admin dashboard","Security and vulnerability protection"],
      process:  ["Analyze requirements and build the plan","Design Wireframes and Prototype","Full development and database integration","Testing and quality assurance","Launch and ongoing support"],
      result:   "Websites that deliver real results — higher conversion rates and an unforgettable user experience.",
    },
  },
  "mobile-apps": {
    emoji: "📱", accentColor: "#FFBF00",
    gradient: "linear-gradient(135deg,#0f0c29,#302b63)",
    ar: {
      title: "تطبيقات الموبايل", ctaLabel: "ابنِ تطبيقك",
      summary:  "نطوّر تطبيقات iOS وAndroid احترافية.",
      features: ["تطبيقات أصيلة وهجينة","تصميم UI/UX عصري","أداء سلس على كل الأجهزة","إشعارات Push وربط API","نشر على App Store وGoogle Play","صيانة ودعم مستمر"],
      process:  ["تحديد نوع التطبيق والتقنية","تصميم شاشات التطبيق","التطوير والاختبار","الرفع على المتاجر","المتابعة والتحديثات"],
      result:   "تطبيقات يحبها المستخدمون — تقييمات عالية ومعدل احتفاظ ممتاز.",
    },
    en: {
      title: "Mobile Apps", ctaLabel: "Build Your App",
      summary:  "We develop professional iOS and Android applications.",
      features: ["Native and hybrid applications","Modern UI/UX design","Smooth performance on all devices","Push notifications and API integration","Publishing on App Store & Google Play","Ongoing maintenance and support"],
      process:  ["Define app type and technology","Design app screens","Development and testing","App store submission","Follow-up and updates"],
      result:   "Apps users love — high ratings and excellent retention rates.",
    },
  },
  "ai-solutions": {
    emoji: "🤖", accentColor: "#4DD0E1",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a0533)",
    ar: {
      title: "حلول الذكاء الاصطناعي", ctaLabel: "استكشف حلول AI",
      summary:  "ندمج AI في منتجاتك لتضاعف كفاءتك.",
      features: ["دمج OpenAI وClaude APIs","بناء Chatbots ذكية","أتمتة العمليات المتكررة","تحليل البيانات والتنبؤ","توليد المحتوى بالـ AI","تخصيص تجربة المستخدم"],
      process:  ["تحليل عملياتك الحالية","تحديد نقاط التحسين بالـ AI","بناء النموذج الأولي","التدريب والاختبار","التكامل والإطلاق"],
      result:   "أتمتة تُوفّر 60% من وقت فريقك وتُحسّن دقة القرارات.",
    },
    en: {
      title: "AI Solutions", ctaLabel: "Explore AI Solutions",
      summary:  "We integrate AI into your products to multiply your efficiency.",
      features: ["OpenAI and Claude API integration","Building intelligent chatbots","Automating repetitive processes","Data analysis and prediction","AI-powered content generation","Personalizing user experience"],
      process:  ["Analyze your current operations","Identify AI improvement points","Build the prototype","Training and testing","Integration and launch"],
      result:   "Automation that saves 60% of your team's time and improves decision accuracy.",
    },
  },
  "uiux-design": {
    emoji: "🎨", accentColor: "#5C6BC0",
    gradient: "linear-gradient(135deg,#141e30,#243b55)",
    ar: {
      title: "تصميم UI/UX", ctaLabel: "صمّم معنا",
      summary:  "نصمم تجارب مستخدم استثنائية تُحوّل الزوار لعملاء.",
      features: ["أبحاث المستخدم والـ User Journey","Wireframes وPrototypes تفاعلية","تصميم نظام بصري متماسك","اختبار قابلية الاستخدام","تسليم Design System كامل","دعم الـ Handoff للمطورين"],
      process:  ["أبحاث وتحليل المستخدم","رسم User Journey Maps","بناء Wireframes","التصميم البصري الكامل","الاختبار والتحسين"],
      result:   "تصاميم تُقلّل معدل الارتداد 45% وتُضاعف معدل التحويل.",
    },
    en: {
      title: "UI/UX Design", ctaLabel: "Design With Us",
      summary:  "We design exceptional user experiences that turn visitors into customers.",
      features: ["User research and User Journey","Interactive Wireframes and Prototypes","Cohesive visual design system","Usability testing","Full Design System delivery","Developer handoff support"],
      process:  ["User research and analysis","Draw User Journey Maps","Build Wireframes","Complete visual design","Testing and refinement"],
      result:   "Designs that reduce bounce rate by 45% and double conversion rates.",
    },
  },
  "ecommerce": {
    emoji: "🛒", accentColor: "#FFBF00",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    ar: {
      title: "المتاجر الإلكترونية", ctaLabel: "أطلق متجرك",
      summary:  "نبني متاجر تبيع على مدار الساعة.",
      features: ["كتالوج منتجات متقدم","بوابات دفع موثوقة","إدارة مخزون ذكية","تحليلات مبيعات تفصيلية","دعم تعدد العملات والشحن","SEO للمتاجر الإلكترونية"],
      process:  ["تحديد نموذج العمل","تصميم تجربة التسوق","بناء المتجر والتكاملات","اختبار عمليات الدفع","الإطلاق والتسويق"],
      result:   "متاجر تُحقق ROI خلال الأشهر الأولى — زيادة مبيعات موثّقة.",
    },
    en: {
      title: "E-Commerce", ctaLabel: "Launch Your Store",
      summary:  "We build stores that sell around the clock.",
      features: ["Advanced product catalog","Reliable payment gateways","Smart inventory management","Detailed sales analytics","Multi-currency and shipping support","E-commerce SEO"],
      process:  ["Define business model","Design the shopping experience","Build store and integrations","Test payment flows","Launch and marketing"],
      result:   "Stores that achieve ROI within the first months — documented sales growth.",
    },
  },
  "content-creation": {
    emoji: "🎬", accentColor: "#4DD0E1",
    gradient: "linear-gradient(135deg,#0d1b2a,#1b263b)",
    ar: {
      title: "صناعة المحتوى", ctaLabel: "أنتج محتوى مميز",
      summary:  "ننتج محتوى يُبهر ويحوّل المشاهدين لعملاء.",
      features: ["فيديوهات إعلانية احترافية","ريلز وتيك توك مميزة","تصاميم سوشيال ميديا","محتوى AI بأحدث الأدوات","سيناريو وإخراج احترافي","توزيع على المنصات"],
      process:  ["تحديد الهوية والرسالة","كتابة السيناريو والمحتوى","الإنتاج والتصوير/التصميم","المونتاج والتحرير","النشر والتحليل"],
      result:   "محتوى يُضاعف التفاعل 5 أضعاف ويُحوّل المشاهدين لعملاء فعليين.",
    },
    en: {
      title: "Content Creation", ctaLabel: "Create Great Content",
      summary:  "We produce content that dazzles and converts viewers into customers.",
      features: ["Professional ad videos","Standout Reels and TikToks","Social media designs","AI-powered content with latest tools","Professional scripting and direction","Multi-platform distribution"],
      process:  ["Define brand identity and message","Write scripts and content","Production and filming/design","Editing and post-production","Publishing and analytics"],
      result:   "Content that multiplies engagement 5x and converts viewers into real customers.",
    },
  },
};

export const MOCK_SERVICE_SLUGS = Object.keys(MOCK_SERVICES);