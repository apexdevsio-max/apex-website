import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const contentRoot = path.join(root, "content");

async function localizedFiles(directory) {
  return (await readdir(path.join(contentRoot, directory))).filter((name) => /\.(ar|en)\.mdx$/.test(name));
}

test("all top-level content has matching Arabic and English variants", async () => {
  for (const directory of ["blog", "projects", "services", "courses"]) {
    const files = await localizedFiles(directory);
    const names = new Set(files);
    for (const file of files) {
      const counterpart = file.endsWith(".ar.mdx")
        ? file.replace(".ar.mdx", ".en.mdx")
        : file.replace(".en.mdx", ".ar.mdx");
      assert.ok(names.has(counterpart), `${directory}/${file} is missing ${counterpart}`);
    }
  }
});

test("blog frontmatter contains a valid publication date and safe markdown links", async () => {
  for (const file of await localizedFiles("blog")) {
    const source = await readFile(path.join(contentRoot, "blog", file), "utf8");
    const frontmatter = /^---\s*\n([\s\S]*?)\n---/.exec(source);
    assert.ok(frontmatter, `${file} has no frontmatter`);
    const data = JSON.parse(frontmatter[1]);
    assert.ok(data.date || data.datePublished, `${file} has no publication date`);
    assert.ok(!Number.isNaN(Date.parse(data.date ?? data.datePublished)), `${file} has an invalid publication date`);
    assert.doesNotMatch(source, /\]\(\s*(?:javascript|data):/i, `${file} contains an unsafe link protocol`);
  }
});

/**
 * Internal links in content must carry a locale prefix.
 *
 * A bare `/contact` matches KNOWN_ROUTES in proxy.ts and is 308-redirected to
 * `/en/contact` — so an Arabic reader who clicked a call-to-action inside an
 * Arabic article landed on the English page, at the exact moment they were
 * converting. Because the redirect is permanent, crawlers cache it and treat the
 * English URL as the destination, which also drains authority from the Arabic
 * pages. Six such links shipped in the Gulf cost article before this test existed.
 */
test("internal content links are locale-prefixed", async () => {
  for (const directory of ["blog", "projects", "services", "courses"]) {
    for (const file of await localizedFiles(directory)) {
      const source = await readFile(path.join(contentRoot, directory, file), "utf8");
      const locale = file.endsWith(".ar.mdx") ? "ar" : "en";

      for (const [, href] of source.matchAll(/\]\((\/[^)]*)\)/g)) {
        // Static assets are locale-independent and served straight from /public.
        if (href.startsWith("/images/") || href.startsWith("/videos/")) continue;

        assert.match(
          href,
          /^\/(ar|en)\//,
          `${directory}/${file} links to "${href}" without a locale prefix — it will 308-redirect to the default locale`
        );
        assert.ok(
          href.startsWith(`/${locale}/`),
          `${directory}/${file} is a ${locale} document but links to "${href}" in the other locale`
        );
      }
    }
  }
});

test("public discovery files expose canonical URLs", async () => {
  const llms = await readFile(path.join(root, "public", "llms.txt"), "utf8");
  assert.match(llms, /https:\/\/apex\.sy\/en\/services/);
  assert.match(llms, /https:\/\/apex\.sy\/ar\/services/);
});

test("framework and SEO regressions stay fixed", async () => {
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.equal(packageJson.dependencies.next, "16.2.10");
  assert.equal(packageJson.overrides.postcss, "8.5.10");

  const schema = await readFile(path.join(root, "lib", "seo", "schema.tsx"), "utf8");
  assert.doesNotMatch(schema, /dateCreated:\s*new Date/);

  for (const relative of [
    "app/[lang]/blog/[slug]/page.tsx",
    "app/[lang]/services/[service]/page.tsx",
    "app/[lang]/portfolio/[slug]/page.tsx",
    "app/[lang]/academy/[course]/page.tsx",
    "app/[lang]/academy/[course]/[lesson]/page.tsx",
  ]) {
    const source = await readFile(path.join(root, relative), "utf8");
    assert.doesNotMatch(source, /title:\s*`[^`]* - APEX`/, `${relative} duplicates the title template`);
  }
});
