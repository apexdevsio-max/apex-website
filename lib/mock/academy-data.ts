// file: lib/mock/academy-data.ts
// Shared mock data — importable from both Server and Client components

export const MOCK_COURSES = [
  {
    slug: "nextjs-fullstack",
    emoji: "⚡",
    accentColor: "#00BCD4",
    level: "intermediate",
    lessonsCount: 12,
    duration: { ar: "6 ساعات", en: "6 hours" },
    ar: {
      title: "Next.js Full-Stack من الصفر للاحتراف",
      summary: "تعلّم بناء تطبيقات ويب متكاملة بـ Next.js 14 مع App Router وServer Components وقواعد البيانات.",
      level: "متوسط",
    },
    en: {
      title: "Next.js Full-Stack from Zero to Pro",
      summary: "Learn to build complete web applications with Next.js 14, App Router, Server Components, and databases.",
      level: "Intermediate",
    },
    lessons: [
      { slug: "intro-nextjs",      ar: "مقدمة في Next.js 14",               en: "Introduction to Next.js 14" },
      { slug: "app-router",        ar: "App Router والـ File-based Routing",  en: "App Router & File-based Routing" },
      { slug: "server-components", ar: "Server Components vs Client",         en: "Server vs Client Components" },
      { slug: "data-fetching",     ar: "جلب البيانات وcaching",               en: "Data Fetching & Caching" },
    ],
  },
  {
    slug: "react-native-mobile",
    emoji: "📱",
    accentColor: "#FFBF00",
    level: "beginner",
    lessonsCount: 10,
    duration: { ar: "5 ساعات", en: "5 hours" },
    ar: {
      title: "React Native — بناء تطبيقات iOS وAndroid",
      summary: "ابنِ تطبيقات موبايل احترافية لـ iOS وAndroid بكود واحد باستخدام React Native وExpo.",
      level: "مبتدئ",
    },
    en: {
      title: "React Native — Build iOS & Android Apps",
      summary: "Build professional iOS and Android apps with a single codebase using React Native and Expo.",
      level: "Beginner",
    },
    lessons: [
      { slug: "setup-expo",      ar: "إعداد بيئة التطوير مع Expo",       en: "Setup Development Environment with Expo" },
      { slug: "core-components", ar: "المكونات الأساسية في React Native", en: "Core Components in React Native" },
      { slug: "navigation",      ar: "التنقل بين الشاشات",               en: "Screen Navigation" },
      { slug: "api-integration", ar: "التكامل مع APIs الخارجية",          en: "External API Integration" },
    ],
  },
  {
    slug: "ai-for-developers",
    emoji: "🤖",
    accentColor: "#4DD0E1",
    level: "advanced",
    lessonsCount: 8,
    duration: { ar: "4 ساعات", en: "4 hours" },
    ar: {
      title: "الذكاء الاصطناعي للمطورين — دليل عملي",
      summary: "تعلّم دمج أدوات الذكاء الاصطناعي في مشاريعك: OpenAI، LangChain، وبناء Chatbots ذكية.",
      level: "متقدم",
    },
    en: {
      title: "AI for Developers — Practical Guide",
      summary: "Learn to integrate AI tools into your projects: OpenAI, LangChain, and building intelligent chatbots.",
      level: "Advanced",
    },
    lessons: [
      { slug: "openai-api",     ar: "استخدام OpenAI API",   en: "Using the OpenAI API" },
      { slug: "langchain-basics",ar: "مقدمة في LangChain",  en: "LangChain Basics" },
      { slug: "build-chatbot",  ar: "بناء Chatbot ذكي",     en: "Building an Intelligent Chatbot" },
      { slug: "ai-image-gen",   ar: "توليد الصور بالـ AI",  en: "AI Image Generation" },
    ],
  },
  {
    slug: "tailwind-ui-design",
    emoji: "🎨",
    accentColor: "#5C6BC0",
    level: "beginner",
    lessonsCount: 9,
    duration: { ar: "4.5 ساعات", en: "4.5 hours" },
    ar: {
      title: "Tailwind CSS — تصميم واجهات احترافية",
      summary: "أتقن Tailwind CSS من الصفر وابنِ واجهات مستخدم جميلة وسريعة بدون كتابة CSS يدوي.",
      level: "مبتدئ",
    },
    en: {
      title: "Tailwind CSS — Professional UI Design",
      summary: "Master Tailwind CSS from scratch and build beautiful, fast user interfaces without writing manual CSS.",
      level: "Beginner",
    },
    lessons: [
      { slug: "tailwind-setup",    ar: "إعداد Tailwind في مشروعك", en: "Setting Up Tailwind in Your Project" },
      { slug: "utility-classes",   ar: "فهم الـ Utility Classes",   en: "Understanding Utility Classes" },
      { slug: "responsive-design", ar: "التصميم المتجاوب",          en: "Responsive Design" },
      { slug: "dark-mode",         ar: "إضافة Dark Mode",           en: "Adding Dark Mode" },
    ],
  },
  {
    slug: "typescript-mastery",
    emoji: "🔷",
    accentColor: "#00BCD4",
    level: "intermediate",
    lessonsCount: 11,
    duration: { ar: "5.5 ساعات", en: "5.5 hours" },
    ar: {
      title: "TypeScript — من المبتدئ للمحترف",
      summary: "أتقن TypeScript وتعلّم كتابة كود أكثر أماناً وقابلية للصيانة في مشاريع JavaScript الكبيرة.",
      level: "متوسط",
    },
    en: {
      title: "TypeScript — From Beginner to Pro",
      summary: "Master TypeScript and learn to write safer, more maintainable code for large JavaScript projects.",
      level: "Intermediate",
    },
    lessons: [
      { slug: "ts-basics",      ar: "أساسيات TypeScript",  en: "TypeScript Basics" },
      { slug: "types-interfaces",ar: "Types وInterfaces",   en: "Types & Interfaces" },
      { slug: "generics",       ar: "الـ Generics",         en: "Generics" },
      { slug: "ts-with-react",  ar: "TypeScript مع React",  en: "TypeScript with React" },
    ],
  },
  {
    slug: "ecommerce-development",
    emoji: "🛒",
    accentColor: "#FFBF00",
    level: "advanced",
    lessonsCount: 14,
    duration: { ar: "7 ساعات", en: "7 hours" },
    ar: {
      title: "بناء متجر إلكتروني متكامل من الصفر",
      summary: "تعلّم بناء متجر إلكتروني احترافي مع بوابة دفع وإدارة مخزون وتحليلات مبيعات.",
      level: "متقدم",
    },
    en: {
      title: "Build a Complete E-Commerce Store from Scratch",
      summary: "Learn to build a professional e-commerce store with payment gateway, inventory management, and sales analytics.",
      level: "Advanced",
    },
    lessons: [
      { slug: "store-architecture", ar: "هيكلة المتجر الإلكتروني",  en: "Store Architecture" },
      { slug: "product-catalog",    ar: "كتالوج المنتجات والفلاتر", en: "Product Catalog & Filters" },
      { slug: "stripe-payments",    ar: "تكامل Stripe للمدفوعات",   en: "Stripe Payment Integration" },
      { slug: "admin-dashboard",    ar: "لوحة تحكم الإدارة",        en: "Admin Dashboard" },
    ],
  },
];

export type MockCourse = typeof MOCK_COURSES[0];