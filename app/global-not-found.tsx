import type { Metadata } from "next";

import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { ibmPlexSansArabic, ibmPlexSerif } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found — APEX",
  robots: { index: false, follow: false },
};

// Picks the language from the path and applies the stored theme before paint,
// so a dark-mode visitor does not get a white page.
const boot = `(function(){var ar=location.pathname.split('/')[1]==='ar';var d=document.documentElement;d.lang=ar?'ar':'en';d.dir=ar?'rtl':'ltr';d.classList.add(ar?'nf-ar':'nf-en');try{var s=localStorage.getItem('theme');if(s?s==='dark':matchMedia('(prefers-color-scheme:dark)').matches)d.classList.add('dark')}catch(e){}})();`;

/** Shown for any URL that matches no route. Both languages render; CSS shows the right one. */
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className={`${ibmPlexSansArabic.variable} ${ibmPlexSerif.variable} bg-apex-bg text-apex-text`}>
        <main id="content">
          <div className="nf-block-en font-en">
            <NotFoundContent lang="en" />
          </div>
          <div className="nf-block-ar font-ar">
            <NotFoundContent lang="ar" />
          </div>
        </main>
        <style>{`.nf-block-ar{display:none}.nf-ar .nf-block-ar{display:block}.nf-ar .nf-block-en{display:none}`}</style>
      </body>
    </html>
  );
}
