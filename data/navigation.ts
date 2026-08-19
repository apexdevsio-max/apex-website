export const navigationItems = [
  { key: "home", path: "/" },
  { key: "portfolio", path: "portfolio" },
  // Services carries the commercial intent pages. It sits in the header rather
  // than the footer alone so internal link equity reaches /services/* — those
  // pages were previously reachable only from the footer.
  { key: "services", path: "services" },
  // Academy is hidden from navigation for now. The routes under
  // app/[lang]/academy still build and remain reachable by direct URL —
  // re-enable by uncommenting this line.
  // { key: "academy", path: "academy" },
  { key: "blog", path: "blog" },
] as const;


