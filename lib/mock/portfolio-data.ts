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
  "tajweed-kids-ai": {
    emoji: "📿",
    gradient: "linear-gradient(135deg,#0a1f0a,#1a3d1a)",
    accentColor: "#66BB6A",
    tags: ["AI Video", "Educational", "Children's Content", "Motion Graphics"],
    category: "AI Content",
    ar: {
      title: "فيديوهات تعليم التجويد للأطفال بالذكاء الاصطناعي",
      summary: "فيديوهات تعليمية مدعومة بالذكاء الاصطناعي تشرح أحكام التجويد للأطفال بأسلوب مبسط وجذاب.",
      description:
        "• إنتاج فيديوهات تعليمية بالذكاء الاصطناعي لشرح أحكام التجويد للأطفال بأسلوب مبسط وجذاب.\n\n• تصميم محتوى تفاعلي يساعد الأطفال على تعلم التجويد من خلال شخصيات ومشاهد بصرية ممتعة.\n\n• فيديوهات AI تعليمية تجمع بين الشرح السلس والرسوم المتحركة لتسهيل فهم أحكام التلاوة.\n\n• تقديم قواعد التجويد للأطفال بطريقة مرئية حديثة تعزز التركيز وتجعل التعلم أكثر متعة.\n\n• محتوى تعليمي إبداعي يشرح مخارج الحروف وأحكام التجويد باستخدام تقنيات الذكاء الاصطناعي.",
    },
    en: {
      title: "AI Tajweed Videos for Children",
      summary: "AI-powered educational videos teaching Tajweed rules to children through engaging visuals and friendly characters.",
      description:
        "• Producing AI-powered educational videos explaining Tajweed rules for children in a simplified and engaging style.\n\n• Designing interactive content that helps children learn Tajweed through fun characters and visual scenes.\n\n• AI educational videos combining smooth explanation with animation to make recitation rules easy to understand.\n\n• Presenting Tajweed rules to children in a modern visual way that enhances focus and makes learning more enjoyable.\n\n• Creative educational content explaining letter articulation points and Tajweed rules using AI techniques.",
    },
  },
  "arnoub-adventure-ai": {
    emoji: "🐰",
    gradient: "linear-gradient(135deg,#1a0033,#3d1a5e)",
    accentColor: "#CE93D8",
    tags: ["2D Animation", "AI Video", "Children's Content", "Storytelling"],
    category: "AI Content",
    ar: {
      title: "مغامرة أرنوب الورقية — فيديو كرتوني 2D",
      summary: "قصة أطفال محولة إلى فيديو كرتوني ثنائي الأبعاد بتقنيات الذكاء الاصطناعي، مع شخصيات مرسومة بأسلوب جذاب وممتع.",
      description:
        "• تحويل قصة 'مغامرة أرنوب الورقية' إلى فيديو 2D باستخدام تقنيات الذكاء الاصطناعي بأسلوب ممتع ومناسب للأطفال.\n\n• إنتاج فيديو كرتوني ثنائي الأبعاد يجسد أحداث القصة بتحريكات سلسة ومشاهد مليئة بالمغامرة والتشويق.\n\n• تصميم محتوى قصصي بالذكاء الاصطناعي مع شخصيات مرسومة بأسلوب جذاب يعزز تجربة المشاهدة للأطفال.\n\n• تحويل القصة إلى عمل بصري تفاعلي يجمع بين السرد الإبداعي والرسوم المتحركة الحديثة.\n\n• فيديو 2D للأطفال يعتمد على تقنيات AI لإحياء الشخصيات والمشاهد بأسلوب حيوي ومليء بالخيال.",
    },
    en: {
      title: "Arnoub's Paper Adventure — 2D AI Animation",
      summary: "A 2D animated children's story brought to life with AI, featuring Arnoub in a fun paper adventure.",
      description:
        "• Converting the story 'Arnoub's Paper Adventure' into a 2D video using AI techniques in a fun style suitable for children.\n\n• Producing a 2D cartoon video that brings the story's events to life with smooth animations and scenes full of adventure and excitement.\n\n• Designing AI-powered story content with attractively drawn characters that enhance the viewing experience for children.\n\n• Transforming the story into a visual work that combines creative narration with modern animation.\n\n• A 2D video for children relying on AI techniques to bring characters and scenes to life in a vibrant and imaginative style.",
    },
  },
  "fatiha-family-ai": {
    emoji: "📖",
    gradient: "linear-gradient(135deg,#1a0f00,#3d2b1a)",
    accentColor: "#FFB74D",
    tags: ["AI Video", "Motion Graphics", "Educational", "Family"],
    category: "AI Content",
    ar: {
      title: "فيلم عائلي بالذكاء الاصطناعي — سورة الفاتحة",
      summary: "فيلم عائلي مدعوم بالذكاء الاصطناعي يجسد معاني سورة الفاتحة بأسلوب بصري دافئ وسينمائي.",
      description:
        "• إنتاج محتوى بالذكاء الاصطناعي يجسد أجواء عائلية دافئة يشرح فيها الوالدان للأبناء معاني سورة الفاتحة بأسلوب بصري مؤثر.\n\n• فيديو توعوي عائلي باستخدام تقنيات AI يركز على جمال سورة الفاتحة وقيمها الروحية بطريقة مبسطة للأطفال.\n\n• تصميم مشاهد سينمائية هادئة تُظهر تفاعل الأسرة أثناء الحديث عن عظمة سورة الفاتحة وأثرها في الحياة اليومية.\n\n• محتوى بصري إبداعي يعكس الترابط الأسري ويقدم مفاهيم دينية بأسلوب حديث مناسب للمحتوى التعليمي والتوعوي.\n\n• فيديو عائلي بالذكاء الاصطناعي يجمع بين السرد الهادئ والمشاهد الدافئة لتقديم سورة الفاتحة بطريقة ملهمة وجذابة.",
    },
    en: {
      title: "AI Family Film — Surah Al-Fatiha",
      summary: "An AI-powered family film that brings Surah Al-Fatiha to life through warm storytelling and cinematic visuals.",
      description:
        "• AI-powered content creation depicting warm family scenes where parents explain the meanings of Surah Al-Fatiha to their children in an emotionally engaging visual style.\n\n• A family-oriented educational video using AI techniques, focusing on the beauty of Surah Al-Fatiha and its spiritual values in a simplified way for children.\n\n• Design of calm cinematic scenes showing family interaction while discussing the greatness of Surah Al-Fatiha and its impact on daily life.\n\n• Creative visual content reflecting family bonds and presenting religious concepts in a modern style suitable for educational and awareness content.\n\n• A family AI video combining gentle narration with warm scenes to present Surah Al-Fatiha in an inspiring and engaging way.",
    },
  },
  "wifaq-qatar-ai": {
    emoji: "🤝",
    gradient: "linear-gradient(135deg,#0a1628,#1a2a4a)",
    accentColor: "#4DD0E1",
    tags: ["AI Video", "Motion Graphics", "Humanitarian"],
    category: "AI Content",
    ar: {
      title: "إنتاج محتوى بالذكاء الاصطناعي لمؤسسة وفاق القطرية",
      summary: "محتوى فيديو مدعوم بالذكاء الاصطناعي يُعرف بمؤسسة وفاق القطرية ورسالتها الإنسانية في دعم الأسر.",
      description:
        "• إنتاج محتوى بالذكاء الاصطناعي للتعريف بمؤسسة وفاق القطرية بأسلوب بصري حديث يعكس رسالتها الإنسانية ودورها في دعم الأسر.\n\n• تصميم فيديوهات تعريفية باستخدام تقنيات الذكاء الاصطناعي لتقديم خدمات المؤسسة بطريقة مؤثرة وواضحة.\n\n• محتوى إبداعي يجمع بين السرد البصري والهوية المؤسسية لإبراز جهود مؤسسة وفاق في التوعية والدعم الأسري.\n\n• تطوير مواد مرئية حديثة بالذكاء الاصطناعي تساعد على إيصال رسالة المؤسسة بأسلوب احترافي وجذاب.\n\n• فيديوهات تعريفية مبتكرة تركز على القيم المجتمعية والدور الإنساني لمؤسسة وفاق القطرية لدعم الأسر.",
    },
    en: {
      title: "AI Content for Wifaq Qatar Foundation",
      summary: "AI-powered video content highlighting Wifaq Qatar Foundation's humanitarian mission and family support initiatives.",
      description:
        "• AI-powered content production for Wifaq Qatar Foundation with a modern visual style reflecting its humanitarian mission and role in supporting families.\n\n• Informational videos designed using AI techniques to present the foundation's services in an impactful and clear way.\n\n• Creative content combining visual storytelling with corporate identity to highlight Wifaq Foundation's efforts in family awareness and support.\n\n• Modern AI-driven visual materials that help convey the foundation's message in a professional and engaging style.\n\n• Innovative explanatory videos focused on community values and the humanitarian role of Wifaq Qatar Foundation in supporting families.",
    },
  },
  "tafawwoq-educational-app": {
    emoji: "⭐",
    gradient: "linear-gradient(135deg,#0a1628,#1a2a4a)",
    accentColor: "#4FC3F7",
    tags: ["Flutter", "Clean Architecture", "BLoC", "Educational", "Cross-Platform"],
    category: "App",
    ar: {
      title: "تفوقي — تطبيق تعليمي للمراهقين",
      summary: "تطبيق تعليمي متكامل للمراهقين مبني باستخدام Flutter وClean Architecture.",
      description:
        "• تطوير تطبيق 'تفوقي' التعليمي للمراهقين باستخدام Flutter وClean Architecture لتقديم تجربة تعليمية حديثة ومتكاملة باللغة العربية.\n\n• تطبيق تعليمي متكامل يوفّر دروس فيديو، اختبارات تفاعلية، ونظام اشتراكات مع دعم كامل للغة العربية وواجهة RTL.\n\n• بناء منصة تعليمية تعتمد على Flutter وBLoC مع تكامل API آمن، تخزين محلي، وتجربة استخدام محسّنة للوضعين الفاتح والداكن.\n\n• تطوير نظام اختبارات ذكي يتضمن مؤقت زمني، تصحيحًا آليًا، تقييمًا للأداء، وإمكانية مراجعة الأسئلة المحفوظة لاحقًا.\n\n• تحسين البنية البرمجية للتطبيق عبر إعادة هيكلة التبعيات، إصلاح عشرات المشكلات التقنية، وتحسين الأداء وتجربة المستخدم بشكل شامل.",
    },
    en: {
      title: "Tafawwoq — Educational App for Teenagers",
      summary: "A comprehensive educational application for teenagers built with Flutter and Clean Architecture.",
      description:
        "• Developing the 'Tafawwoq' educational app for teenagers using Flutter and Clean Architecture to deliver a modern, integrated learning experience in Arabic.\n\n• A fully integrated educational app providing video lessons, interactive quizzes, and subscription management with full Arabic language and RTL interface support.\n\n• Building an educational platform powered by Flutter and BLoC with secure API integration, local storage, and an optimized user experience for both light and dark modes.\n\n• Developing a smart quiz system featuring a timer, auto-grading, performance evaluation, and the ability to review saved questions later.\n\n• Improving the app's code architecture through dependency restructuring, fixing dozens of technical issues, and enhancing overall performance and user experience.",
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
