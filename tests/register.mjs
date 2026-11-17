// Lets tests import the app's real TypeScript modules: resolves the "@/" path
// alias and stubs "server-only", which only exists to fail outside React Server Components.
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
