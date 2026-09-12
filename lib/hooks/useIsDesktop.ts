"use client";

import { useSyncExternalStore } from "react";

/**
 * Matches the `md` breakpoint that gates the hero's decorative layers.
 *
 * Kept in sync with the Tailwind `md:` prefix used across the hero. The canvas
 * effects are desktop-only by design, and this is the single source of truth
 * for that decision so the JS guard and the CSS never disagree.
 */
export const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * False during SSR and on the first client render, so nothing desktop-only is
 * ever emitted into the server HTML.
 *
 * The hero's WebGL and particle canvases used to be hidden with `hidden md:block`
 * while their effects still ran: a phone downloaded the component, created a
 * ResizeObserver, registered matchMedia and visibility listeners, and mounted a
 * <video> and a <canvas> it would never show. Returning false here lets those
 * components bail before any of that happens.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
