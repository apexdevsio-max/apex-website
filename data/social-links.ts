/**
 * Public contact points and social profiles.
 *
 * The social URLs feed `sameAs` in the Organization/LocalBusiness JSON-LD
 * (lib/seo/schema.tsx), which is how search engines and AI answer engines tie this
 * site to a single real-world entity. Empty strings are filtered out before being
 * emitted, so blanks are safe — but they leave `sameAs` empty, which measurably
 * weakens those entity signals. Fill each in with the full profile URL
 * (e.g. "https://www.linkedin.com/company/…") as the accounts go live.
 */
export const socialLinks = {
  email: "apex.devs.io@gmail.com",
  whatsapp: "+963991313929",
  instagram: "",
  linkedin: "",
  twitter: "",
} as const;
