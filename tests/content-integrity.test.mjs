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

test("public discovery files expose canonical URLs", async () => {
  const llms = await readFile(path.join(root, "public", "llms.txt"), "utf8");
  assert.match(llms, /https:\/\/apex\.sy\/en\/services/);
  assert.match(llms, /https:\/\/apex\.sy\/ar\/services/);
});
