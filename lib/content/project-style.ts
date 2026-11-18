import type { ProjectCategory } from "@/lib/content/content-loader";
import type { Locale } from "@/lib/i18n/locale";

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, Record<Locale, string>> = {
  app: { en: "Mobile app", ar: "تطبيق جوال" },
  "ai-content": { en: "AI-generated content", ar: "محتوى بالذكاء الاصطناعي" },
  video: { en: "Video & motion", ar: "فيديو وموشن" },
};
