/**
 * Smoke test against a production build served by `next start`.
 *
 * The unit tests read source files, which is why every bug below reached
 * production with all of them green: social cards returning 500, content outside
 * <main>, a legacy redirect answering 200. This checks the built site instead.
 *
 *   npm run build && npm run smoke
 */
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const PORT = Number(process.env.SMOKE_PORT ?? 3499);
const ORIGIN = `http://localhost:${PORT}`;
const SITE = "https://apex.sy";
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

// 1. Static checks on every prerendered page.
const appDir = path.join(root, ".next", "server", "app");
const pages = (await htmlFiles(appDir)).filter((file) => /[\\/](en|ar)([\\/.])/.test(file));
check(pages.length > 100, `expected 100+ prerendered pages, found ${pages.length}`);

const ogUrls = new Set();
for (const file of pages) {
  const html = await readFile(file, "utf8");
  const rel = path.relative(appDir, file);
  const main = /<main\b[\s\S]*?<\/main>/.exec(html)?.[0] ?? "";
  check(main.length > 0, `${rel}: no <main>`);
  check(/<h1[\s>]/.test(main), `${rel}: no <h1> inside <main>`);
  check(!/<template id="B:/.test(main), `${rel}: <main> holds a streaming placeholder, content is outside it`);
  check((html.match(/<main\b/g) ?? []).length === 1, `${rel}: more than one <main>`);
  for (const match of html.matchAll(/<meta property="og:image" content="([^"]+)"/g)) ogUrls.add(match[1]);
}

// 2. Runtime checks against `next start`.
const server = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
});
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(ORIGIN, { redirect: "manual" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error("next start did not come up");
}

try {
  await waitForServer();

  for (const url of ogUrls) {
    const local = url.replace(SITE, ORIGIN);
    if (!local.startsWith(ORIGIN)) continue;
    const res = await fetch(local);
    const type = res.headers.get("content-type") ?? "";
    check(res.ok && /^image\//.test(type), `og:image ${url} -> ${res.status} ${type}`);
  }
  check(ogUrls.size > 100, `expected 100+ distinct og:image URLs, found ${ogUrls.size}`);

  const expectStatus = async (pathname, status, location) => {
    const res = await fetch(`${ORIGIN}${pathname}`, { redirect: "manual" });
    check(res.status === status, `${pathname} -> ${res.status}, expected ${status}`);
    if (location) {
      const got = res.headers.get("location") ?? "";
      check(got.endsWith(location), `${pathname} redirects to ${got}, expected ${location}`);
    }
  };

  await expectStatus("/en/portfolio/category/web-apps", 308, "/en/portfolio");
  await expectStatus("/en/blog/no-such-post", 404);
  await expectStatus("/en/blog/no-such-post/opengraph-image", 404);
  await expectStatus("/en/services/anything-at-all/opengraph-image", 404);
  await expectStatus("/en/blog/page/0", 404);
  await expectStatus("/not-a-page", 404);
  await expectStatus("/en/academy", 308, "/en/blog");
  await expectStatus("/en/blog/category/practical-guides", 308, "/en/blog/category/choosing-a-vendor");
  await expectStatus("/en/blog/app-development-company-riyadh", 308, "/en/blog/gulf-app-development-guide");
} finally {
  server.kill();
}

if (failures.length > 0) {
  console.error(`\nSmoke test failed (${failures.length}):\n` + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log(`Smoke test passed: ${pages.length} pages, ${ogUrls.size} social cards.`);
