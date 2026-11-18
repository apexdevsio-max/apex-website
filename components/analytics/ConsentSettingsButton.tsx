"use client";

import { writeStorage } from "@/lib/browser";
import { CONSENT_RESET_EVENT } from "./AnalyticsConsent";

/** Lets a visitor change their analytics choice after the banner is gone. */
export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        writeStorage("analytics-consent", "");
        window.dispatchEvent(new Event(CONSENT_RESET_EVENT));
      }}
      className="text-sm hover:text-apex-primary transition-colors py-2 min-h-[44px] flex items-center"
    >
      {label}
    </button>
  );
}
