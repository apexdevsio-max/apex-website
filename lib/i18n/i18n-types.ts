// ═══════════════════════════════════════════════════════════
//  HOW TO FIX — lib/i18n/i18n-types.ts
//
//  Find the contact block inside your Dictionary type and
//  replace it with the version below.
//  Also add the other new sections if they're missing.
// ═══════════════════════════════════════════════════════════

// ── FIND this (old) ────────────────────────────────────────
/*
contact: {
  title:       string;
  description: string;
  email:       string;
  whatsapp:    string;
};
*/

// ── REPLACE with this (new) ────────────────────────────────
/*
contact: {
  badge:       string;   // ← add
  title:       string;
  description: string;
  available:   string;   // ← add
  email:       string;
  whatsapp:    string;
};
*/

// ═══════════════════════════════════════════════════════════
//  FULL Dictionary type — paste this entire block if you
//  prefer to replace the whole type at once.
// ═══════════════════════════════════════════════════════════

export type Dictionary = {
  navigation: {
    home:      string;
    portfolio: string;
    academy:   string;
    blog:      string;
    contact:   string;
    letsTalk:  string;
  };

  heroSection: {
    badge:        string;
    headline:     string;
    highlight:    string;
    subheadline:  string;
    cta:          string;
    ctaSecondary: string;
    tagline:      string;
  };

  about: {
    badge:        string;
    title:        string;
    subtitle:     string;
    description:  string;
    stats:        Array<{ value: string; label: string }>;
    checks:       string[];
    visionTitle:  string;
    visionText:   string;
    cards: {
      innovation: { title: string; text: string };
      quality:    { title: string; text: string };
      partnership:{ title: string; text: string };
    };
  };

  services: {
    badge:     string;
    title:     string;
    subtitle:  string;
    learnMore: string;
    items: Array<{
      icon:        string;
      title:       string;
      description: string;
    }>;
  };

  portfolio: {
    badge:       string;
    title:       string;
    subtitle:    string;
    viewAll:     string;
    viewProject: string;
    projects: Array<{
      title:    string;
      category: string;
      tag:      string;
      emoji:    string;
    }>;
  };

  testimonials: {
    badge:    string;
    title:    string;
    subtitle: string;
    items: Array<{
      name:    string;
      role:    string;
      text:    string;
      initial: string;
    }>;
  };

  // ── THE FIX IS HERE ──────────────────────────────────────
  contact: {
    badge:       string;   // ← was missing
    title:       string;
    description: string;
    available:   string;   // ← was missing
    email:       string;
    whatsapp:    string;
  };

  footer: {
    tagline:      string;
    description:  string;
    rights:       string;
    quickLinks:   string;
    quickContact: string;
    privacy:      string;
    terms:        string;
    links: Array<{ label: string; path: string }>;
  };
};