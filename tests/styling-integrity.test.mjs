import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function sourceFiles() {
  const found = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.tsx?$/.test(entry.name)) found.push(full);
    }
  }
  for (const dir of ["app", "components"]) await walk(path.join(root, dir));
  return found;
}

/**
 * Tailwind v4 takes its theme from an `@theme` block in CSS; a `tailwind.config.ts`
 * is ignored entirely. Every `*-apex-*` utility and `apex-*` component class used
 * in the markup must therefore resolve to something in globals.css, or it compiles
 * to nothing and the element silently renders unstyled.
 */
test("every apex class used in markup is defined in CSS", async () => {
  const css = await readFile(path.join(root, "app", "globals.css"), "utf8");
  const files = await sourceFiles();

  // Theme tokens generate the `<prop>-apex-<name>` utilities.
  const themeBlock = /@theme\s*\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(themeBlock, "globals.css must declare an @theme block for Tailwind v4");
  const themeTokens = new Set(
    [...themeBlock[1].matchAll(/--(?:color|font|animate|spacing|radius|shadow)-([a-z0-9-]+)\s*:/g)].map((m) => m[1])
  );

  const definedClasses = new Set([...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
  const keyframes = new Set([...css.matchAll(/@keyframes\s+([a-z0-9-]+)/g)].map((m) => m[1]));

  const missingClasses = new Set();
  const missingUtilities = new Set();
  const missingKeyframes = new Set();

  for (const file of files) {
    const source = await readFile(file, "utf8");

    // Per-page <style> blocks legitimately define their own classes.
    const localCss = [...source.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]);
    const locallyDefined = new Set(localCss);

    // The negative lookbehind skips the token half of a theme utility
    // (`text-apex-muted`), which is validated against @theme separately below.
    for (const [, cls] of source.matchAll(
      /(?<!-)\b(apex-[a-z0-9-]+)\b/g
    )) {
      // Event names and JS identifiers are not classes.
      if (cls === "apex-theme-change") continue;
      if (definedClasses.has(cls) || locallyDefined.has(cls) || keyframes.has(cls)) continue;
      missingClasses.add(`${cls} (${path.relative(root, file)})`);
    }

    for (const [, token] of source.matchAll(/\b(?:text|bg|border|shadow|from|to|via|ring|fill|stroke)-(apex-[a-z0-9-]+)\b/g)) {
      if (!themeTokens.has(token)) {
        missingUtilities.add(`${token} (${path.relative(root, file)})`);
      }
    }

    // Keyframes referenced from inline `animation:` styles.
    for (const [, name] of source.matchAll(/animation:\s*"?(apex-[a-z0-9-]+)/g)) {
      if (!keyframes.has(name)) missingKeyframes.add(`${name} (${path.relative(root, file)})`);
    }
  }

  assert.deepEqual([...missingClasses], [], "apex-* classes used but never defined in CSS");
  assert.deepEqual([...missingUtilities], [], "apex theme utilities used but absent from @theme");
  assert.deepEqual([...missingKeyframes], [], "@keyframes referenced but never defined");
});

test("tailwind.config.ts is absent so it cannot appear to configure Tailwind v4", async () => {
  const entries = await readdir(root);
  const stale = entries.filter((name) => /^tailwind\.config\.(ts|js|mjs|cjs)$/.test(name));
  assert.deepEqual(stale, [], "Tailwind v4 ignores this file; configure via @theme in globals.css");
});

test("form controls expose validation state to assistive technology", async () => {
  for (const control of ["Input", "Select", "Textarea"]) {
    const source = await readFile(path.join(root, "components", "ui", `${control}.tsx`), "utf8");
    assert.match(source, /aria-invalid=/, `${control} must set aria-invalid when in error`);
    assert.match(source, /aria-describedby=/, `${control} must link its error text`);
    assert.match(source, /role="alert"/, `${control} error text must announce itself`);
    // Labels are translated, so a label-derived id changes per locale.
    assert.doesNotMatch(
      source,
      /=\s*id\s*\?\?\s*label\./,
      `${control} must derive its id from name, not the translated label`
    );
  }
});

test("locale fallbacks all route through the shared default", async () => {
  const files = await sourceFiles();
  const offenders = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    // A hardcoded "ar" fallback contradicts the x-default=en hreflang.
    if (/isLocale\((\w+)\)\s*\?\s*\1\s*:\s*"ar"/.test(source)) {
      offenders.push(path.relative(root, file));
    }
  }
  assert.deepEqual(offenders, [], "use toLocale() so the fallback matches DEFAULT_LOCALE");
});
