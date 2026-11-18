"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

import type { Locale } from "@/lib/i18n/locale";

/**
 * Share row for articles. WhatsApp first: it is where business links are most often passed
 * around in the region. Plain links, so they work without JavaScript; only "copy" needs it.
 */
export function ShareLinks({ url, title, lang }: { url: string; title: string; lang: Locale }) {
  const isAr = lang === "ar";
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const encodedUrl = encodeURIComponent(url);

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${text}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "X", href: `https://x.com/intent/post?text=${text}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(isAr ? "انسخ الرابط:" : "Copy the link:", url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold text-apex-text">{isAr ? "شارك المقال:" : "Share:"}</span>
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="apex-chip">
          {link.label}
        </a>
      ))}
      <button type="button" onClick={copy} className="apex-chip" aria-live="polite">
        {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
        {copied ? (isAr ? "تم النسخ" : "Copied") : isAr ? "نسخ الرابط" : "Copy link"}
      </button>
    </div>
  );
}
