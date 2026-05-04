export type MockPost = {
  emoji: string;
  accentColor: string;
  category: string;
  readTime: number;
  ar: { title: string; excerpt: string; date: string; content: string };
  en: { title: string; excerpt: string; date: string; content: string };
};

export const MOCK_POSTS: Record<string, MockPost> = {
  "nextjs-vs-remix-2025": {
    emoji: "\u26a1",
    accentColor: "#00BCD4",
    category: "Web Dev",
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
    category: "Mobile",
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
    category: "AI",
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
};

export const MOCK_POST_SLUGS = Object.keys(MOCK_POSTS);

export const FALLBACK_POST = (slug: string, lang: string) => ({
  emoji: "\ud83d\udcdd",
  accentColor: "#00BCD4",
  category: lang === "ar" ? "مقالات" : "Articles",
  readTime: 5,
  title: lang === "ar" ? "مقال APEX" : "APEX Article",
  excerpt: lang === "ar" ? "مقال تقني من فريق APEX." : "A technical article from the APEX team.",
  date: "",
  content: lang === "ar" ? "المحتوى قريبًا." : "Content coming soon.",
});
