                   export type Dictionary = {   navigation: {     home:      string;     portfolio: string;     academy:   string;     blog:      string;     contact:   string;     letsTalk:  string;   };    heroSection: {     badge:        string;     headline:     string;     highlight:    string;     subheadline:  string;     cta:          string;     ctaSecondary: string;     tagline:      string;   };    about: {     badge:        string;     title:        string;     subtitle:     string;     description:  string;     stats:        Array<{ value: string; label: string }>;     checks:       string[];     visionTitle:  string;     visionText:   string;     cards: {       innovation: { title: string; text: string };       quality:    { title: string; text: string };       partnership:{ title: string; text: string };     };   };    services: {     badge:     string;     title:     string;     subtitle:  string;     learnMore: string;     items: Array<{       icon:        string;       title:       string;       description: string;     }>;   };    portfolio: {     badge:       string;     title:       string;     subtitle:    string;     viewAll:     string;     viewProject: string;     projects: Array<{       title:    string;       category: string;       tag:      string;       emoji:    string;     }>;   };    testimonials: {     badge:    string;     title:    string;     subtitle: string;     items: Array<{       name:    string;       role:    string;       text:    string;       initial: string;     }>;   };         contact: {
    badge:       string;
    title:       string;
    description: string;
    available:   string;
    email:       string;
    whatsapp:    string;
    form: {
      title:       string;
      subtitle:    string;
      name:        string;
      namePlaceholder: string;
      email:       string;
      emailPlaceholder: string;
      phone:       string;
      phonePlaceholder: string;
      projectType: string;
      projectTypePlaceholder: string;
      projectTypeOptions: {
        web: string; mobile: string; ai: string; uiux: string; ecommerce: string; content: string; other: string;
      };
      budget:      string;
      budgetPlaceholder: string;
      budgetOptions: {
        low: string; medium: string; high: string; premium: string; enterprise: string;
      };
      description: string;
      descriptionPlaceholder: string;
      sendWhatsapp: string;
      sendEmail:   string;
      success:     string;
      errors: {
        nameRequired: string;
        emailRequired: string;
        emailInvalid: string;
        projectTypeRequired: string;
        budgetRequired: string;
        descriptionRequired: string;
      };
    };
  };    footer: {     tagline:      string;     description:  string;     rights:       string;     quickLinks:   string;     quickContact: string;     privacy:      string;     terms:        string;     links: Array<{ label: string; path: string }>;   }; };