import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = process.cwd();
const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return { url: "data:text/javascript,export {}", shortCircuit: true };
  }
  if (specifier.startsWith("@/")) {
    const base = path.join(root, specifier.slice(2));
    for (const ext of EXTENSIONS) {
      const candidate = base + ext;
      if (existsSync(candidate) && statSync(candidate).isFile()) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }
  // Extensionless relative imports inside the app's TypeScript ("./metadata").
  if (specifier.startsWith(".") && !path.extname(specifier) && context.parentURL?.startsWith("file:")) {
    const base = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    for (const ext of EXTENSIONS.slice(1)) {
      if (existsSync(base + ext)) return nextResolve(pathToFileURL(base + ext).href, context);
    }
  }
  return nextResolve(specifier, context);
}

// JSON modules need an import attribute; the app imports dictionaries without one.
export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    return nextLoad(url, { ...context, importAttributes: { type: "json" } });
  }
  return nextLoad(url, context);
}
