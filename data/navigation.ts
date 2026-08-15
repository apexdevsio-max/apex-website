export const navigationItems = [
  { key: "home", path: "/" },
  { key: "portfolio", path: "portfolio" },
  // Academy is hidden from navigation for now. The routes under
  // app/[lang]/academy still build and remain reachable by direct URL —
  // re-enable by uncommenting this line.
  // { key: "academy", path: "academy" },
  { key: "blog", path: "blog" },
] as const;


