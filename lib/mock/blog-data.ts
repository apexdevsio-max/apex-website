export type MockPost = {
  emoji: string;
  accentColor: string;
  categories: string[];
  readTime: number;
  ar: { title: string; excerpt: string; date: string; content: string };
  en: { title: string; excerpt: string; date: string; content: string };
};


/**
 * Presentation metadata for every published article: the card emoji, accent
 * colour, category tags that drive the blog filter, and reading time.
 *
 * MOCK_POSTS below carries full placeholder copy and predates the MDX content;
 * it is kept only for the three listing-only slugs. Articles backed by real MDX
 * take their title, excerpt and date from the file and only need what is here,
 * so a new article means one row in this table — not a duplicated body.
 *
 * Without an entry, BlogGrid falls back to the "selected" category and a generic
 * emoji, which is what made 34 articles share one filter bucket and one icon.
 */
export type PostMeta = {
  emoji: string;
  accentColor: string;
  categories: string[];
  readTime: number;
};

export const POST_META: Record<string, PostMeta> = {
"ai-chatbot-cost": { emoji: "🤖", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "ai-for-business-guide": { emoji: "🧠", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "ai-privacy-risks": { emoji: "🛡️", accentColor: "#FF7043", categories: ["selected","practical"], readTime: 8 },
  "api-security-guide": { emoji: "🔐", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 6 },
  "app-development-abu-dhabi": { emoji: "🕌", accentColor: "#FF7043", categories: ["practical"], readTime: 6 },
  "app-development-company-riyadh": { emoji: "🏙️", accentColor: "#FF7043", categories: ["practical"], readTime: 8 },
  "app-development-contract": { emoji: "📜", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "app-development-jeddah": { emoji: "🌊", accentColor: "#FF7043", categories: ["practical"], readTime: 6 },
  "app-performance-optimization": { emoji: "🚄", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 7 },
  "app-store-requirements": { emoji: "🏪", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 7 },
  "app-vs-pwa": { emoji: "📲", accentColor: "#4CAF50", categories: ["mobile","comparisons"], readTime: 6 },
  "arabic-localization-guide": { emoji: "🌐", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 9 },
  "arabic-numerals-formats": { emoji: "🔢", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "arabic-ocr-document-processing": { emoji: "📑", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "arabic-search-guide": { emoji: "🔎", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 7 },
  "arabic-web-fonts": { emoji: "🔤", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 6 },
  "childrens-data-protection": { emoji: "🧒", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "choosing-ai-model-arabic": { emoji: "🧠", accentColor: "#FFBF00", categories: ["selected","comparisons"], readTime: 7 },
  "choosing-development-company": { emoji: "🤝", accentColor: "#7C3AED", categories: ["practical","comparisons"], readTime: 9 },
  "clean-architecture-flutter": { emoji: "🏛️", accentColor: "#54C5F8", categories: ["lang-framework","mobile"], readTime: 6 },
  "clinic-booking-app-cost": { emoji: "🏥", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 7 },
  "data-residency-gulf": { emoji: "🗄️", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "delivery-app-cost": { emoji: "🚚", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 7 },
  "digital-identity-integration": { emoji: "🪪", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "ecommerce-ai-features": { emoji: "🛍️", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 8 },
  "ecommerce-development-cost-saudi": { emoji: "🛒", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 8 },
  "educational-app-cost": { emoji: "🎓", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 6 },
  "fintech-sama-compliance": { emoji: "🏦", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "flutter": { emoji: "💙", accentColor: "#54C5F8", categories: ["lang-framework","comparisons"], readTime: 6 },
  "flutter-rtl-arabic-guide": { emoji: "🔄", accentColor: "#54C5F8", categories: ["lang-framework","mobile"], readTime: 7 },
  "flutter-vs-react-native": { emoji: "⚔️", accentColor: "#54C5F8", categories: ["lang-framework","comparisons"], readTime: 7 },
  "freelancer-vs-agency": { emoji: "🤝", accentColor: "#7C3AED", categories: ["comparisons","practical"], readTime: 6 },
  "gulf-compliance-guide": { emoji: "⚖️", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 9 },
  "gulf-payment-gateways": { emoji: "💳", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "health-apps-uae-compliance": { emoji: "⚕️", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 6 },
  "hijri-dates-guide": { emoji: "📅", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 6 },
  "hosting-comparison": { emoji: "☁️", accentColor: "#00BCD4", categories: ["web","comparisons"], readTime: 6 },
  "i18n-arabic-guide": { emoji: "🌍", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 7 },
  "internal-ai-assistant": { emoji: "🏢", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "llm-running-costs": { emoji: "💸", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "localization-mistakes": { emoji: "⚠️", accentColor: "#FF7043", categories: ["practical","selected"], readTime: 7 },
  "maintenance-inhouse-vs-contract": { emoji: "🔧", accentColor: "#7C3AED", categories: ["comparisons","practical"], readTime: 6 },
  "mobile-app-development-cost": { emoji: "📱", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 9 },
  "mobile-app-development-cost-gulf": { emoji: "🌍", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 6 },
  "mobile-app-testing": { emoji: "🧪", accentColor: "#4CAF50", categories: ["mobile","practical"], readTime: 7 },
  "mvp-vs-full-product": { emoji: "🚀", accentColor: "#7C3AED", categories: ["comparisons","practical"], readTime: 6 },
  "native-vs-hybrid-app": { emoji: "🔀", accentColor: "#4CAF50", categories: ["mobile","comparisons"], readTime: 6 },
  "outsourcing-vs-inhouse": { emoji: "⚖️", accentColor: "#7C3AED", categories: ["comparisons","practical"], readTime: 8 },
  "pdpl-compliance-guide": { emoji: "🛡️", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "privacy-policy-guide": { emoji: "📄", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 7 },
  "rag-knowledge-base": { emoji: "📚", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "react-native": { emoji: "⚙️", accentColor: "#54C5F8", categories: ["lang-framework","comparisons"], readTime: 7 },
  "react-native-rtl-arabic": { emoji: "🔃", accentColor: "#54C5F8", categories: ["lang-framework","mobile"], readTime: 8 },
  "rtl-css-guide": { emoji: "🎨", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 7 },
  "seo-vs-geo": { emoji: "🔍", accentColor: "#7C3AED", categories: ["comparisons","selected"], readTime: 8 },
  "shopify-vs-custom-store": { emoji: "🏪", accentColor: "#00BCD4", categories: ["web","comparisons"], readTime: 6 },
  "software-company-qatar": { emoji: "🇶🇦", accentColor: "#FF7043", categories: ["practical"], readTime: 6 },
  "template-vs-custom-design": { emoji: "🎨", accentColor: "#00BCD4", categories: ["web","comparisons"], readTime: 6 },
  "uae-data-protection-guide": { emoji: "🇦🇪", accentColor: "#FFBF00", categories: ["selected","practical"], readTime: 8 },
  "web-design-company-dubai": { emoji: "🏗️", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 7 },
  "website-design-cost": { emoji: "💻", accentColor: "#00BCD4", categories: ["web","practical"], readTime: 7 },
  "wordpress-vs-nextjs": { emoji: "⚡", accentColor: "#00BCD4", categories: ["web","comparisons"], readTime: 6 },
  "writing-rfp-software": { emoji: "📋", accentColor: "#7C3AED", categories: ["practical","selected"], readTime: 7 },
};

export const MOCK_POSTS: Record<string, MockPost> = {
  "nextjs-vs-remix-2025": {
    emoji: "\u26a1",
    accentColor: "#00BCD4",
    categories: ["comparisons"],
    readTime: 8,
    ar: {
      title: "Next.js مقابل Remix في 2025 — أيهما تختار؟",
      excerpt: "مقارنة تقنية شاملة بين أقوى إطارين لتطوير الويب الحديث.",
      date: "15 مارس 2025",
      content: `Next.js وRemix هما أقوى خيارين لبناء تطبيقات الويب الحديثة. لكن كيف تختار؟

## الأداء

- Next.js: يعتمد على Static Generation وServer Components مما يمنحه أداء استثنائيًا
- Remix: يعتمد على Server-Side Rendering بشكل افتراضي مع تحسينات ذكية للـ hydration

## تجربة المطور

- Next.js: توثيق ممتاز، مجتمع ضخم، وتكامل سلس مع Vercel
- Remix: منحنى تعلم أحدث، لكنه يجبرك على فهم عميق لأساسيات الويب

## متى تختار Next.js؟

- المشاريع الكبيرة التي تحتاج Static Generation
- عندما تريد أداءً قويًا من البداية
- إذا كان فريقك مألوفًا مع منظومة React

## متى تختار Remix؟

- التطبيقات التي تعتمد بشدة على البيانات الديناميكية
- عندما تريد تجربة UX سلسة مع optimistic updates
- إذا كنت تبني تطبيقًا full-stack حقيقيًا

## الخلاصة

لمعظم المشاريع في 2025، لا يزال Next.js الخيار الأكثر أمانًا والأوسع دعمًا. لكن Remix يستحق الاهتمام جدًا لمن يريد التعمق في معايير الويب.`,
    },
    en: {
      title: "Next.js vs Remix in 2025 — Which Should You Choose?",
      excerpt: "A comprehensive technical comparison between the two most powerful modern web frameworks.",
      date: "Mar 15, 2025",
      content: `Next.js and Remix are two of the strongest choices for building modern web applications. But how do you choose?

## Performance

- Next.js: Relies on Static Generation and Server Components for excellent performance
- Remix: Defaults to Server-Side Rendering with smart hydration optimizations

## Developer Experience

- Next.js: Excellent documentation, massive community, seamless Vercel integration
- Remix: Newer learning curve, but it forces a deeper understanding of web fundamentals

## When to Choose Next.js?

- Large projects requiring Static Generation
- When you want strong performance out of the box
- If your team is familiar with the React ecosystem

## When to Choose Remix?

- Data-heavy dynamic applications
- When you want smooth UX with optimistic updates
- If you're building a true full-stack application

## Conclusion

For most projects in 2025, Next.js remains the safest and most widely supported choice. But Remix is definitely worth exploring if you want to go deeper into web standards.`,
    },
  },
  "react-native-expo-guide": {
    emoji: "\ud83d\udcf1",
    accentColor: "#FFBF00",
    categories: ["mobile"],
    readTime: 12,
    ar: {
      title: "دليل React Native + Expo الشامل للمبتدئين",
      excerpt: "كل ما تحتاج معرفته لبناء تطبيق موبايل احترافي من الصفر.",
      date: "1 مارس 2025",
      content: `React Native + Expo أصبحا من أفضل الخيارات لبناء تطبيقات الموبايل باستخدام JavaScript.

## لماذا Expo؟

- إعداد سريع دون Xcode أو Android Studio
- أدوات تطوير متكاملة مثل hot reload وdebugging
- مكتبة كبيرة من الـ native modules

## البدء من الصفر

أول خطوة: تثبيت Expo CLI
ثم: إنشاء مشروع جديد باستخدام expo create-app
بعدها: تشغيل التطبيق مباشرة على هاتفك باستخدام Expo Go

## الهيكل المقترح

- /app — صفحات التطبيق
- /components — المكونات القابلة لإعادة الاستخدام
- /hooks — custom hooks
- /utils — helper functions

## النشر

Expo يسهّل نشر تطبيقك على App Store وGoogle Play دون تعقيدات بناء native.

## الخلاصة

إذا كنت مطور ويب وتريد دخول عالم الموبايل، React Native + Expo هو أسرع طريق.`,
    },
    en: {
      title: "The Complete React Native + Expo Guide for Beginners",
      excerpt: "Everything you need to know to build a professional mobile app from scratch.",
      date: "Mar 1, 2025",
      content: `React Native + Expo have become one of the best ways to build mobile apps with JavaScript.

## Why Expo?

- Quick setup without Xcode or Android Studio
- Integrated development tools like hot reload and debugging
- A large library of native modules

## Starting from Scratch

First: Install Expo CLI
Then: Create a new project with expo create-app
After that: Run your app directly on your phone with Expo Go

## Recommended Structure

- /app — App screens
- /components — Reusable components
- /hooks — Custom hooks
- /utils — Helper functions

## Deployment

Expo lets you publish your app to the App Store and Google Play without native build complexity.

## Conclusion

If you're a web developer looking to enter mobile, React Native + Expo is one of the fastest paths.`,
    },
  },
  "ai-tools-developers-2025": {
    emoji: "\ud83e\udd16",
    accentColor: "#4DD0E1",
    categories: ["selected"],
    readTime: 6,
    ar: {
      title: "أفضل أدوات الذكاء الاصطناعي للمطورين في 2025",
      excerpt: "قائمة محدثة بأقوى أدوات AI التي يجب أن يعرفها كل مطور.",
      date: "20 فبراير 2025",
      content: `الذكاء الاصطناعي غيّر طريقة عمل المطورين بشكل جذري. هذه بعض أقوى الأدوات في 2025:

## للكتابة والكود

- GitHub Copilot: قوي لاقتراحات الكود المباشرة داخل المحرر
- Claude: ممتاز للتحليل والتوثيق والمهام المعقدة
- Cursor IDE: بيئة تطوير متكاملة مدعومة بالذكاء الاصطناعي

## للتصميم

- Midjourney: توليد صور احترافية
- Figma AI: اقتراحات تصميمية مباشرة داخل Figma
- v0 by Vercel: توليد مكونات React من وصف نصي

## لإنتاج المحتوى

- Sora: توليد فيديو من نص
- ElevenLabs: تحويل النص إلى صوت بجودة بشرية
- Runway: تحرير فيديو مدعوم بالذكاء الاصطناعي

## الخلاصة

المطور الذي يتقن استخدام هذه الأدوات يعمل بكفاءة أعلى بكثير ممن لا يستخدمها.`,
    },
    en: {
      title: "Best AI Tools for Developers in 2025",
      excerpt: "An updated list of the most powerful AI tools every developer should know.",
      date: "Feb 20, 2025",
      content: `AI has radically changed how developers work. Here are some of the most useful tools in 2025:

## For Writing & Code

- GitHub Copilot: Strong for direct code suggestions in your editor
- Claude: Excellent for analysis, documentation, and complex tasks
- Cursor IDE: AI-powered integrated development environment

## For Design

- Midjourney: Professional image generation
- Figma AI: Design suggestions directly in Figma
- v0 by Vercel: Generate React components from text descriptions

## For Content Production

- Sora: Video generation from text
- ElevenLabs: Text-to-speech with human-like quality
- Runway: AI-powered video editing

## Conclusion

A developer who masters these tools can work far more efficiently than one who ignores them.`,
    },
  },
  "flutter": {
    emoji: "\ud83d\udc99",
    accentColor: "#54C5F8",
    categories: ["lang-framework", "comparisons"],
    readTime: 15,
    ar: {
      title: "ما هو Flutter؟ دليل شامل لتطوير التطبيقات متعددة المنصات",
      excerpt: "دليل شامل لإطار Flutter من Google لبناء تطبيقات Android و iOS والويب من قاعدة كود واحدة.",
      date: "12 مايو 2026",
      content: "",
    },
    en: {
      title: "What is Flutter? A Complete Guide to Cross-Platform App Development",
      excerpt: "A comprehensive guide to Flutter — Google's UI framework for building Android, iOS, web, and desktop apps from a single codebase.",
      date: "May 12, 2026",
      content: "",
    },
  },
  "seo-vs-geo": {
    emoji: "\ud83d\udd0d",
    accentColor: "#7C3AED",
    categories: ["comparisons", "selected"],
    readTime: 14,
    ar: {
      title: "SEO vs GEO: طرق تحسين محركات البحث ومحركات الذكاء الاصطناعي",
      excerpt: "دراسة معمقة للفرق بين SEO vs GEO وكيف غيّر الذكاء الاصطناعي مستقبل الظهور الرقمي. اكتشف كيف تجعل محتواك قابلاً للاقتباس داخل ChatGPT وGoogle AI وPerplexity.",
      date: "23 مايو 2026",
      content: "",
    },
    en: {
      title: "SEO vs GEO: How AI Search Engines Are Reshaping the Future of Digital Visibility",
      excerpt: "A comprehensive guide explaining the difference between SEO and GEO, and how AI-powered search is transforming the future of digital content and online visibility.",
      date: "May 23, 2026",
      content: "",
    },
  },
  "mobile-app-development-cost": {
    emoji: "\ud83d\udcf1",
    accentColor: "#4CAF50",
    categories: ["mobile", "practical"],
    readTime: 16,
    ar: {
      title: "تكلفة تطوير تطبيق موبايل في 2025 — دليل الأسعار الحقيقية",
      excerpt: "اكتشف تكلفة تطوير تطبيق موبايل في 2025 بأرقام واقعية. دليل شامل يشرح العوامل المؤثرة في السعر وكيف تختار الشركة المناسبة.",
      date: "1 يناير 2026",
      content: "",
    },
    en: {
      title: "Mobile App Development Cost in 2025 — The Real Numbers Guide",
      excerpt: "Discover the real cost of mobile app development in 2025. A comprehensive guide covering every pricing factor, honest cost ranges, and how to choose the right development partner.",
      date: "Jan 1, 2026",
      content: "",
    },
  },
  "react-native": {
    emoji: "\u2699\ufe0f",
    accentColor: "#61DAFB",
    categories: ["lang-framework", "comparisons"],
    readTime: 10,
    ar: {
      title: "React Native: دليل شامل لتطوير تطبيقات Android وiOS",
      excerpt: "شرح شامل لـ React Native، طريقة عمله، مميزاته وعيوبه، وأشهر التطبيقات المبنية به.",
      date: "20 مايو 2026",
      content: "",
    },
    en: {
      title: "React Native: Complete Guide to Building Android and iOS Apps",
      excerpt: "A complete guide to React Native including how it works, advantages, limitations, and real-world applications.",
      date: "May 20, 2026",
      content: "",
    },
  },
};

export const MOCK_POST_SLUGS = Object.keys(MOCK_POSTS);

/**
 * Slugs that have a real MDX article behind them in `content/blog/`. The three
 * entries in MOCK_POSTS without one (nextjs-vs-remix-2025, react-native-expo-guide,
 * ai-tools-developers-2025) exist only as listing placeholders — they used to be
 * prerendered as their own routes, which published thin "Content coming soon..."
 * pages into the index and linked to them from every article's Related section.
 *
 * Keep this in sync when an article gains or loses its MDX file. Tests assert
 * both directions: every slug here resolves to a real file, and every file on
 * disk is listed here. The one-way check alone let this list sit at five entries
 * while 34 further articles shipped, which left every article showing the same
 * three "Related" links.
 */
export const PUBLISHED_POST_SLUGS = [
"ai-chatbot-cost",
  "ai-for-business-guide",
  "ai-privacy-risks",
  "api-security-guide",
  "app-development-abu-dhabi",
  "app-development-company-riyadh",
  "app-development-contract",
  "app-development-jeddah",
  "app-performance-optimization",
  "app-store-requirements",
  "app-vs-pwa",
  "arabic-localization-guide",
  "arabic-numerals-formats",
  "arabic-ocr-document-processing",
  "arabic-search-guide",
  "arabic-web-fonts",
  "childrens-data-protection",
  "choosing-ai-model-arabic",
  "choosing-development-company",
  "clean-architecture-flutter",
  "clinic-booking-app-cost",
  "data-residency-gulf",
  "delivery-app-cost",
  "digital-identity-integration",
  "ecommerce-ai-features",
  "ecommerce-development-cost-saudi",
  "educational-app-cost",
  "fintech-sama-compliance",
  "flutter",
  "flutter-rtl-arabic-guide",
  "flutter-vs-react-native",
  "freelancer-vs-agency",
  "gulf-compliance-guide",
  "gulf-payment-gateways",
  "health-apps-uae-compliance",
  "hijri-dates-guide",
  "hosting-comparison",
  "i18n-arabic-guide",
  "internal-ai-assistant",
  "llm-running-costs",
  "localization-mistakes",
  "maintenance-inhouse-vs-contract",
  "mobile-app-development-cost",
  "mobile-app-development-cost-gulf",
  "mobile-app-testing",
  "mvp-vs-full-product",
  "native-vs-hybrid-app",
  "outsourcing-vs-inhouse",
  "pdpl-compliance-guide",
  "privacy-policy-guide",
  "rag-knowledge-base",
  "react-native",
  "react-native-rtl-arabic",
  "rtl-css-guide",
  "seo-vs-geo",
  "shopify-vs-custom-store",
  "software-company-qatar",
  "template-vs-custom-design",
  "uae-data-protection-guide",
  "web-design-company-dubai",
  "website-design-cost",
  "wordpress-vs-nextjs",
  "writing-rfp-software",
] as const;

export const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  "lang-framework": { ar: "لغات برمجة و أطر عمل", en: "Languages & Frameworks" },
  mobile: { ar: "برمجة الموبايل", en: "Mobile Programming" },
  web: { ar: "برمجة الويب", en: "Web Programming" },
  comparisons: { ar: "تقييمات و مقارنات", en: "Reviews & Comparisons" },
  selected: { ar: "مواضيع منتقاة", en: "Selected Topics" },
  practical: { ar: "تجارب عملية", en: "Practical Experiences" },
};

export const FALLBACK_POST = (slug: string, lang: string) => ({
  emoji: "\ud83d\udcdd",
  accentColor: "#00BCD4",
  categories: [lang === "ar" ? "مقالات" : "Articles"],
  readTime: 5,
  title: lang === "ar" ? "مقال APEX" : "APEX Article",
  excerpt: lang === "ar" ? "مقال تقني من فريق APEX." : "A technical article from the APEX team.",
  date: "",
  content: lang === "ar" ? "المحتوى قريبًا." : "Content coming soon.",
});
