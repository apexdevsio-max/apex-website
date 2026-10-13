/**
 * Defensive wrappers for browser APIs that are missing or throw on some phones.
 *
 * An uncaught throw inside a client effect unmounts the route and shows the
 * error boundary ("Something went wrong / Try Again"), so these never throw.
 *
 * - requestIdleCallback does not exist in Safari on any iOS/iPadOS version.
 * - localStorage is null or throws in some in-app browsers and WebViews
 *   (DOM storage disabled, storage blocked, quota of zero).
 * - MediaQueryList.addEventListener only exists from Safari 14; older engines
 *   have just addListener.
 */

export function onIdle(callback: () => void, timeout: number): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 1);
  return () => window.clearTimeout(id);
}

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the choice just won't persist */
  }
}

export function onMediaChange(media: MediaQueryList, listener: () => void): () => void {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }
  media.addListener(listener);
  return () => media.removeListener(listener);
}
