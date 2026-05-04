export type ValueItem = { emoji: string; title: string; desc: string };
export type TeamMember = { name: string; role: string; emoji: string; count: string };

export const VALUES: Record<"ar" | "en", ValueItem[]> = {
  ar: [
    { emoji: "🚀", title: "الابتكار",  desc: "نستخدم أحدث التقنيات لنبني منتجات تتجاوز توقعات عملائنا." },
    { emoji: "💎", title: "الجودة",    desc: "كل سطر كود نكتبه يمر بمراجعة دقيقة لضمان أعلى معايير الأداء." },
    { emoji: "🤝", title: "الشراكة",  desc: "علاقتنا مع عملائنا لا تنتهي عند التسليم — نحن شركاء طويل الأمد." },
    { emoji: "⚡", title: "السرعة",    desc: "نلتزم بالمواعيد ونسلّم مشاريع عالية الجودة في الوقت المحدد." },
    { emoji: "🔒", title: "الأمان",    desc: "نبني بنية تحتية آمنة وموثوقة تحمي بيانات عملائك." },
    { emoji: "🌍", title: "الانتشار", desc: "نخدم عملاء في المنطقة العربية ونطمح للوصول العالمي." },
  ],
  en: [
    { emoji: "🚀", title: "Innovation",  desc: "We use cutting-edge tech to build products that exceed client expectations." },
    { emoji: "💎", title: "Quality",     desc: "Every line of code goes through careful review to ensure top performance standards." },
    { emoji: "🤝", title: "Partnership", desc: "Our relationship with clients doesn't end at delivery — we're long-term partners." },
    { emoji: "⚡", title: "Speed",       desc: "We commit to deadlines and deliver high-quality projects on time." },
    { emoji: "🔒", title: "Security",    desc: "We build secure, reliable infrastructure that protects your users' data." },
    { emoji: "🌍", title: "Reach",       desc: "We serve clients across the Arab region and aspire for global reach." },
  ],
};

export const TEAM: Record<"ar" | "en", TeamMember[]> = {
  ar: [
    { name: "فريق التطوير",           role: "مطورو ويب وموبايل",    emoji: "👨‍💻", count: "5+" },
    { name: "فريق التصميم",           role: "مصممو UI/UX",          emoji: "🎨", count: "3+" },
    { name: "فريق الذكاء الاصطناعي", role: "متخصصو AI وبيانات",    emoji: "🤖", count: "2+" },
    { name: "فريق المحتوى",           role: "منتجو محتوى رقمي",     emoji: "🎬", count: "3+" },
  ],
  en: [
    { name: "Dev Team",    role: "Web & Mobile Developers",  emoji: "👨‍💻", count: "5+" },
    { name: "Design Team", role: "UI/UX Designers",          emoji: "🎨", count: "3+" },
    { name: "AI Team",     role: "AI & Data Specialists",    emoji: "🤖", count: "2+" },
    { name: "Content Team",role: "Digital Content Creators", emoji: "🎬", count: "3+" },
  ],
};