import { Bot, Clapperboard, Globe, Smartphone, Wrench, type LucideIcon, type LucideProps } from "lucide-react";

/** One icon per service, looked up by slug. Index-based lookup put the wrong icon on every card. */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  "web-development": Globe,
  "mobile-apps": Smartphone,
  "ai-solutions": Bot,
  "content-creation": Clapperboard,
};

export function ServiceIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = SERVICE_ICONS[slug] ?? Wrench;
  return <Icon aria-hidden="true" {...props} />;
}
