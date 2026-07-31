/**
 * Content-Security-Policy construction.
 *
 * ## Why `script-src` still contains 'unsafe-inline'
 *
 * This was investigated and neither hardening route works with this app's
 * architecture. Both alternatives were measured against a real build:
 *
 * 1. **Nonce.** Next.js only stamps a nonce onto scripts it renders at request
 *    time. Every page here is prerendered (`generateStaticParams` across ~157
 *    routes), so the HTML — and its ~46 inline scripts — is written at build time
 *    when no nonce exists. Adding a nonce to the header would therefore invalidate
 *    every inline script and break hydration site-wide. Making it work requires
 *    forcing all pages to render dynamically, which trades away the static
 *    delivery that makes the site fast.
 *
 * 2. **Hash allowlist.** Next.js emits the React Flight payload as inline
 *    scripts whose content is page-specific. Five sampled pages produced 114
 *    distinct hashes; the full route set would need far more, and every content
 *    edit would change them. Not maintainable.
 *
 * So 'unsafe-inline' is a deliberate, documented trade-off rather than an
 * oversight. It is worth being clear about what that costs: CSP is not providing
 * meaningful XSS defence-in-depth for this app. The mitigations that carry that
 * weight instead are React's automatic escaping, the `urlTransform` guard on
 * rendered Markdown (components/content/MarkdownContent.tsx), the `<`
 * escaping in JSON-LD (lib/seo/schema.tsx), and server-side validation of all
 * user input (lib/contact-contract.ts).
 *
 * If CSP-based script hardening becomes a requirement, the realistic path is to
 * render pages dynamically and switch to a nonce.
 *
 * The non-script directives below are real restrictions and do carry weight:
 * `object-src 'none'`, `base-uri 'self'` (blocks base-tag hijacking),
 * `form-action 'self'` (blocks form exfiltration), and `frame-ancestors 'self'`.
 */

const ANALYTICS_HOSTS = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
  "https://vitals.vercel-analytics.com",
  "https://vitals.vercel-insights.com",
] as const;

export const CSP_HEADER_VALUE = [
  "default-src 'self'",
  // See the note above before attempting to remove 'unsafe-inline'.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com",
  "font-src 'self' data:",
  "media-src 'self'",
  `connect-src 'self' ${ANALYTICS_HOSTS.join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");
