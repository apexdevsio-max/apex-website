/**
 * Public contact points and social profiles.
 *
 * The social URLs feed `sameAs` in the Organization/LocalBusiness JSON-LD
 * (lib/seo/schema.tsx), which is how search engines and AI answer engines tie this
 * site to a single real-world entity. Empty strings are filtered out before being
 * emitted, so blanks are safe — but they leave `sameAs` empty, which measurably
 * weakens those entity signals. Fill each in with the full profile URL
 * (e.g. "https://www.linkedin.com/company/…") as the accounts go live.
 *
 * Each value reads from an env var first so the public identity can be corrected
 * from the deployment dashboard without a code change or redeploy of the source.
 * A free-mail address (gmail.com) as a company's public contact is one of the
 * strongest "not an established business" signals a B2B buyer reads, so
 * NEXT_PUBLIC_CONTACT_EMAIL should be set to an address on the company domain as
 * soon as mail is configured for it. The literals below remain the fallback so
 * nothing breaks before those vars exist.
 */
export const socialLinks = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "apex.devs.io@gmail.com",
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+963991313929",
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
  twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
} as const;
