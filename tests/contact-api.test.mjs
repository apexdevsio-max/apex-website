import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { contactSchema, escapeHtml, readLimitedJson, RequestBodyError } from "../lib/contact-contract.ts";

const validPayload = {
  name: "Test User",
  email: "test@example.com",
  phone: "",
  projectType: "web",
  budget: "medium",
  description: "A sufficiently detailed project description.",
  website: "",
};

test("contact schema accepts the contract and rejects unknown enumerations", () => {
  assert.equal(contactSchema.safeParse(validPayload).success, true);
  assert.equal(contactSchema.safeParse({ ...validPayload, projectType: "malicious" }).success, false);
  assert.equal(contactSchema.safeParse({ ...validPayload, extra: true }).success, false);
});

test("email HTML escaping neutralizes markup", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert(1)">&'`), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;");
});

test("limited JSON reader validates content type and parses valid JSON", async () => {
  const request = new Request("https://apex.sy/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validPayload),
  });
  assert.deepEqual(await readLimitedJson(request), validPayload);

  await assert.rejects(
    () => readLimitedJson(new Request("https://apex.sy/api/contact", { method: "POST", body: "{}" })),
    (error) => error instanceof RequestBodyError && error.status === 415,
  );
});

test("limited JSON reader rejects oversized streamed bodies without Content-Length", async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`{"description":"${"x".repeat(20_000)}"}`));
      controller.close();
    },
  });
  const request = new Request("https://apex.sy/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: stream,
    duplex: "half",
  });
  await assert.rejects(
    () => readLimitedJson(request),
    (error) => error instanceof RequestBodyError && error.status === 413,
  );
});

test("fields interpolated into mail headers reject CR/LF", () => {
  // `name` lands in the Subject header, so a newline there could inject
  // additional headers into the outgoing mail.
  for (const injection of ["Bad\r\nBcc: attacker@evil.test", "Bad\nBcc: x@y.z", "Bad\rX: y"]) {
    assert.equal(
      contactSchema.safeParse({ ...validPayload, name: injection }).success,
      false,
      `name must reject ${JSON.stringify(injection)}`,
    );
  }
  assert.equal(
    contactSchema.safeParse({ ...validPayload, phone: "+1\r\nBcc: x@y.z" }).success,
    false,
  );
  // A legitimate multi-line description is still fine: it is only ever placed in
  // the escaped HTML body, never in a header.
  assert.equal(
    contactSchema.safeParse({ ...validPayload, description: "Line one.\nLine two, with detail." }).success,
    true,
  );
});

test("rate limiting keys off a header the client cannot forge", async () => {
  const source = await readFile(path.join(process.cwd(), "app", "api", "contact", "route.ts"), "utf8");
  assert.match(
    source,
    /x-vercel-forwarded-for/,
    "prefer the edge-set header; x-forwarded-for alone is client-controllable",
  );
  const trustedIndex = source.indexOf("x-vercel-forwarded-for");
  const fallbackIndex = source.indexOf("x-forwarded-for", trustedIndex + 1);
  assert.ok(trustedIndex < fallbackIndex, "the forgeable header must only be a fallback");
});
