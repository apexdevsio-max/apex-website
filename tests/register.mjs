// Lets tests import the app's real TypeScript modules: resolves the "@/" path
// alias and stubs "server-only", which only exists to fail outside React Server Components.
import { registerHooks } from "node:module";

import { load, resolve } from "./alias-hooks.mjs";

registerHooks({ resolve, load });
