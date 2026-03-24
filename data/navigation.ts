export const navigationItems = [
  { key: "home", path: "/" },
  { key: "portfolio", path: "portfolio" },
  { key: "academy", path: "academy" },
  { key: "blog", path: "blog" },
] as const;

export type NavigationKey = (typeof navigationItems)[number]["key"];
