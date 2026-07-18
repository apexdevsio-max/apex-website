import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Page Not Found — APEX",
  robots: { index: false, follow: false },
};

const detectLocale = `(function(){var ar=location.pathname.split('/')[1]==='ar';document.documentElement.lang=ar?'ar':'en';document.documentElement.dir=ar?'rtl':'ltr';document.documentElement.classList.add(ar?'not-found-ar':'not-found-en')})();`;

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <head><script dangerouslySetInnerHTML={{ __html: detectLocale }} /></head>
      <body>
        <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "var(--color-background)", color: "var(--color-primary-text)" }}>
          <section className="max-w-lg">
            <p className="mb-3 text-7xl font-bold" style={{ color: "var(--color-primary)" }}>404</p>
            <div className="not-found-en-content">
              <h1 className="mb-3 text-3xl font-bold">Page not found</h1>
              <p className="mb-8" style={{ color: "var(--color-secondary-text)" }}>The page may have been removed or its address may be incorrect.</p>
              <Link href="/en" className="inline-flex rounded-full px-6 py-3 font-bold text-white" style={{ background: "var(--color-primary)" }}>Go home</Link>
            </div>
            <div className="not-found-ar-content" lang="ar" dir="rtl">
              <h1 className="mb-3 text-3xl font-bold">الصفحة غير موجودة</h1>
              <p className="mb-8" style={{ color: "var(--color-secondary-text)" }}>ربما حُذفت الصفحة أو أن عنوانها غير صحيح.</p>
              <Link href="/ar" className="inline-flex rounded-full px-6 py-3 font-bold text-white" style={{ background: "var(--color-primary)" }}>العودة للرئيسية</Link>
            </div>
          </section>
        </main>
        <style>{`.not-found-ar-content{display:none}.not-found-ar .not-found-ar-content{display:block}.not-found-ar .not-found-en-content{display:none}`}</style>
      </body>
    </html>
  );
}
