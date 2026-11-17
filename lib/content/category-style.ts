import { Bot, Calculator, Handshake, Languages, ShieldCheck, ShoppingBag, Smartphone, type LucideIcon } from "lucide-react";

import type { CategoryKey } from "@/lib/content/taxonomy";

/**
 * Each blog cluster's icon and hue. Cards and covers derive their tint from the
 * hue with color-mix, so one value works in both themes.
 */
export const CATEGORY_STYLE: Record<CategoryKey, { icon: LucideIcon; hue: string }> = {
  costs: { icon: Calculator, hue: "#0b8a6b" },
  compliance: { icon: ShieldCheck, hue: "#6b46c1" },
  arabic: { icon: Languages, hue: "#b45309" },
  ai: { icon: Bot, hue: "#0b6aa8" },
  mobile: { icon: Smartphone, hue: "#0e7490" },
  "web-ecommerce": { icon: ShoppingBag, hue: "#be185d" },
  vendor: { icon: Handshake, hue: "#4d7c0f" },
};
