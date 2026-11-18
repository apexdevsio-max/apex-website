import type { Locale } from "@/lib/i18n/locale";

/**
 * Blog taxonomy: topic clusters, their URL slugs, landing-page copy, and the
 * pillar article each one is built around.
 *
 * The previous six categories ("Practical Experiences", "Selected Topics", ...)
 * described nothing a reader searches for, and one of them held 55 of 71 posts.
 * These follow the clusters in docs/phase-3-keyword-map.md. A post lists its
 * categories in frontmatter; the first one is its primary category.
 */
export const CATEGORY_KEYS = ["costs", "compliance", "arabic", "ai", "mobile", "web-ecommerce", "vendor"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type Category = {
  key: CategoryKey;
  /** URL segment under /blog/category/. Changing one needs a redirect in next.config.ts. */
  slug: string;
  label: Record<Locale, string>;
  /** Meta description, and the lead sentence on the landing page. */
  description: Record<Locale, string>;
  /** Unique prose for the landing page so it is more than a list of links. */
  intro: Record<Locale, string>;
  /** The hub article every other post in the cluster links up to. */
  pillar: string;
};

export const CATEGORIES: readonly Category[] = [
  {
    key: "costs",
    slug: "app-costs",
    pillar: "mobile-app-development-cost",
    label: { en: "Costs & pricing", ar: "التكاليف والأسعار" },
    description: {
      en: "What apps, websites and AI systems cost to build and run, with dated price ranges in US dollars and Gulf currencies.",
      ar: "كم يكلّف بناء التطبيقات والمواقع وأنظمة الذكاء الاصطناعي وتشغيلها، بنطاقات أسعار مؤرخة بالدولار والعملات الخليجية.",
    },
    intro: {
      en: "Every price range in these guides comes from one rate card, so the same tier costs the same on every page. Each guide states what drives the number up or down, what the ongoing costs are after launch, and when a cheaper option is the right call. Start with the mobile app cost guide; the vertical guides (clinics, delivery, real estate, e-commerce) only cover what differs from it.",
      ar: "كل نطاق سعري في هذه الأدلة مأخوذ من جدول أسعار واحد، فالفئة نفسها لها السعر نفسه في كل صفحة. يشرح كل دليل ما يرفع الرقم أو يخفضه، وما التكاليف المستمرة بعد الإطلاق، ومتى يكون الخيار الأرخص هو الصحيح. ابدأ بدليل تكلفة تطبيقات الجوال؛ أدلة القطاعات (العيادات، التوصيل، العقار، المتاجر) تغطي فقط ما يختلف عنه.",
    },
  },
  {
    key: "compliance",
    slug: "gulf-compliance",
    pillar: "gulf-compliance-guide",
    label: { en: "Gulf compliance & data", ar: "الامتثال وحماية البيانات في الخليج" },
    description: {
      en: "Saudi PDPL, the UAE data protection law, ZATCA e-invoicing, SAMA and health-app rules, explained for the teams that build the software.",
      ar: "نظام حماية البيانات الشخصية السعودي، وقانون حماية البيانات الإماراتي، والفوترة الإلكترونية، ومتطلبات ساما وتطبيقات الصحة، مشروحة لفرق التطوير.",
    },
    intro: {
      en: "These guides translate Gulf regulation into engineering decisions: where data may be stored, what consent has to look like in the interface, what a breach response needs, and which approvals add weeks to a timeline. Each one links to the regulator's own text. They are written by engineers, not lawyers, so treat them as a map of the questions to put to your legal adviser.",
      ar: "تحوّل هذه الأدلة الأنظمة الخليجية إلى قرارات هندسية: أين يجوز تخزين البيانات، وكيف يجب أن تبدو الموافقة في الواجهة، وما المطلوب عند التسرب، وأي الموافقات تضيف أسابيع إلى الجدول الزمني. يربط كل دليل بنص الجهة المنظِّمة نفسها. كتبها مهندسون لا محامون، فاعتبرها خريطة للأسئلة التي تطرحها على مستشارك القانوني.",
    },
  },
  {
    key: "arabic",
    slug: "arabic-rtl",
    pillar: "arabic-localization-guide",
    label: { en: "Arabic, RTL & localisation", ar: "العربية واتجاه RTL والتعريب" },
    description: {
      en: "Building products that work properly in Arabic: right-to-left layout, fonts, numerals, Hijri dates, search and OCR.",
      ar: "بناء منتجات تعمل بالعربية كما يجب: تخطيط من اليمين لليسار، والخطوط، والأرقام، والتاريخ الهجري، والبحث، والتعرف الضوئي.",
    },
    intro: {
      en: "Arabic support is usually treated as translation and then fails on layout, mixed-direction text, numerals and search. These guides cover each of those in the frameworks we use (CSS, Flutter, React Native) with code you can copy, and the mistakes we see most often in apps that were localised after launch.",
      ar: "يُعامَل دعم العربية عادةً كترجمة، ثم يتعثر في التخطيط والنص ثنائي الاتجاه والأرقام والبحث. تغطي هذه الأدلة كل واحدة من هذه المشكلات في الأطر التي نستخدمها (CSS وFlutter وReact Native) بأمثلة برمجية جاهزة، مع الأخطاء الأكثر تكراراً في التطبيقات التي عُرّبت بعد إطلاقها.",
    },
  },
  {
    key: "ai",
    slug: "ai-for-business",
    pillar: "ai-for-business-guide",
    label: { en: "AI for business", ar: "الذكاء الاصطناعي للأعمال" },
    description: {
      en: "Where AI is reliable enough to deploy in a business, which models handle Arabic, and what it costs to run.",
      ar: "أين يكون الذكاء الاصطناعي موثوقاً بما يكفي للتطبيق في شركتك، وأي النماذج تتعامل مع العربية، وكم يكلّف تشغيله.",
    },
    intro: {
      en: "Most AI projects that stall do so because the task was not a good fit, not because the model was weak. These guides start from the task: chat assistants over your own documents, Arabic OCR, internal knowledge search, and e-commerce features. They cover model choice for Arabic, running costs per conversation, and the privacy questions to settle before any customer data reaches a third-party API.",
      ar: "معظم مشاريع الذكاء الاصطناعي التي تتعثر تفعل ذلك لأن المهمة لم تكن مناسبة، لا لأن النموذج ضعيف. تبدأ هذه الأدلة من المهمة: مساعدات محادثة على مستنداتك، والتعرف الضوئي على النص العربي، والبحث في المعرفة الداخلية، وميزات المتاجر. وتغطي اختيار النموذج للعربية، وتكلفة التشغيل لكل محادثة، وأسئلة الخصوصية التي يجب حسمها قبل أن تصل بيانات العملاء إلى واجهة طرف ثالث.",
    },
  },
  {
    key: "mobile",
    slug: "mobile-development",
    pillar: "flutter-vs-react-native",
    label: { en: "Mobile development", ar: "تطوير تطبيقات الجوال" },
    description: {
      en: "Choosing between Flutter, React Native, native and PWA, and building apps that pass store review and stay fast.",
      ar: "الاختيار بين Flutter وReact Native والتطوير الأصيل وتطبيقات الويب التقدمية، وبناء تطبيقات تجتاز مراجعة المتاجر وتبقى سريعة.",
    },
    intro: {
      en: "We build most business apps in Flutter, and these guides explain when that is the wrong choice. They compare the frameworks on the criteria that decide real projects (team skills, Arabic support, native features, long-term maintenance), then cover architecture, testing, performance and store requirements.",
      ar: "نبني معظم تطبيقات الأعمال بـ Flutter، وتشرح هذه الأدلة متى يكون ذلك خياراً خاطئاً. تقارن الأطر وفق المعايير التي تحسم المشاريع الحقيقية (مهارات الفريق، ودعم العربية، والميزات الأصيلة، والصيانة على المدى الطويل)، ثم تغطي البنية والاختبار والأداء ومتطلبات المتاجر.",
    },
  },
  {
    key: "web-ecommerce",
    slug: "web-ecommerce",
    pillar: "shopify-vs-custom-store",
    label: { en: "Web & e-commerce", ar: "الويب والمتاجر الإلكترونية" },
    description: {
      en: "Websites and online stores: platforms, hosting, speed, payment gateways and search visibility.",
      ar: "المواقع والمتاجر الإلكترونية: المنصات، والاستضافة، والسرعة، وبوابات الدفع، والظهور في محركات البحث.",
    },
    intro: {
      en: "Whether to use Salla, Zid, Shopify, WordPress or a custom build depends on catalogue size, integrations and who will run the site after launch. These guides walk through those trade-offs, then the parts that decide whether a site performs: hosting region, page speed, local payment gateways and visibility in both search engines and AI answers.",
      ar: "يعتمد الاختيار بين سلة وزد وShopify وWordPress والبناء المخصّص على حجم الكتالوج والتكاملات ومن سيدير الموقع بعد الإطلاق. تشرح هذه الأدلة تلك الموازنات، ثم الأجزاء التي تحدد أداء الموقع: منطقة الاستضافة، وسرعة الصفحات، وبوابات الدفع المحلية، والظهور في محركات البحث وإجابات الذكاء الاصطناعي.",
    },
  },
  {
    key: "vendor",
    slug: "choosing-a-vendor",
    pillar: "choosing-development-company",
    label: { en: "Choosing & working with a vendor", ar: "اختيار شريك التطوير والعمل معه" },
    description: {
      en: "How to choose a development partner, write an RFP, scope an MVP, read a contract and plan maintenance.",
      ar: "كيف تختار شريك التطوير، وتكتب طلب العروض، وتحدد نطاق النسخة الأولى، وتقرأ العقد، وتخطط للصيانة.",
    },
    intro: {
      en: "The decisions made before any code is written have the largest effect on cost and outcome. These guides cover freelancer versus agency versus in-house, how to write a request for proposal that gets comparable quotes, what an app development contract should say about ownership and warranty, and how to plan maintenance so the product does not decay after launch.",
      ar: "القرارات التي تُتخذ قبل كتابة أي سطر برمجي هي الأكثر تأثيراً على التكلفة والنتيجة. تغطي هذه الأدلة المقارنة بين المستقل والشركة والفريق الداخلي، وكيف تكتب طلب عروض يأتيك بعروض قابلة للمقارنة، وما يجب أن ينص عليه عقد التطوير بشأن الملكية والضمان، وكيف تخطط للصيانة كي لا يتراجع المنتج بعد الإطلاق.",
    },
  },
] as const;

/** Articles per page on the blog index and category pages. */
export const POSTS_PER_PAGE = 12;

const BY_KEY = new Map(CATEGORIES.map((category) => [category.key as string, category]));
const BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]));

export function isCategoryKey(value: string): value is CategoryKey {
  return BY_KEY.has(value);
}

export function getCategoryByKey(key: string): Category | undefined {
  return BY_KEY.get(key);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return BY_SLUG.get(slug);
}

/** The category a post belongs to for breadcrumb, badge and pillar purposes. */
export function getPrimaryCategory(post: { categories: readonly CategoryKey[] }): Category | undefined {
  return post.categories[0] ? BY_KEY.get(post.categories[0]) : undefined;
}

export type Paginated<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
};

export function paginate<T>(items: T[], page: number, perPage = POSTS_PER_PAGE): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  // Clamped, so a caller can detect an out-of-range request by comparing pages.
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: current, totalPages, totalItems: items.length };
}

/** Accepts only canonical positive integers ("2", not "02", "2.0" or "0"). */
export function parsePageParam(value: string): number | undefined {
  if (!/^[1-9]\d*$/.test(value)) return undefined;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : undefined;
}
