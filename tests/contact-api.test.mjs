import assert from "node:assert/strict";
import test from "node:test";

import { contactSchema, escapeHtml, fieldErrorCodes, readLimitedJson, RequestBodyError } from "../lib/contact-contract.ts";

const valid = {
  name: "Test User",
  email: "test@example.com",
  projectType: "web",
  description: "A sufficiently detailed project description.",
};

function codes(payload) {
  const result = contactSchema.safeParse(payload);
  return result.success ? {} : fieldErrorCodes(result.error);
}

test("the contract accepts a minimal valid enquiry, with phone and budget optional", () => {
  assert.equal(contactSchema.safeParse(valid).success, true);
  assert.equal(contactSchema.safeParse({ ...valid, phone: "+966 50 000 0000", budget: "unsure" }).success, true);
});

test("validation errors are codes the form can translate, not English prose", () => {
  assert.deepEqual(codes({ ...valid, name: "" }), { name: "required" });
  assert.deepEqual(codes({ ...valid, name: "A" }), { name: "too_short" });
  assert.deepEqual(codes({ ...valid, email: "" }), { email: "required" });
  assert.deepEqual(codes({ ...valid, email: "not-an-email" }), { email: "invalid_email" });
  assert.deepEqual(codes({ ...valid, projectType: undefined }), { projectType: "invalid_choice" });
  assert.deepEqual(codes({ ...valid, description: "short" }), { description: "too_short" });
});

test("unknown fields and enumerations are rejected", () => {
  assert.equal(contactSchema.safeParse({ ...valid, projectType: "malicious" }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, extra: true }).success, false);
});

test("a filled honeypot is not a validation error, so the route can drop it silently", () => {
  const result = contactSchema.safeParse({ ...valid, website: "https://spam.example" });
  assert.equal(result.success, true);
  assert.equal(result.data.website, "https://spam.example");
});

test("fields interpolated into mail headers reject CR/LF", () => {
  for (const injection of ["Bad\r\nBcc: attacker@evil.test", "Bad\nBcc: x@y.z", "Bad\rX: y"]) {
    assert.equal(contactSchema.safeParse({ ...valid, name: injection }).success, false);
  }
  assert.equal(contactSchema.safeParse({ ...valid, phone: "+1\r\nBcc: x@y.z" }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, description: "Line one.\nLine two." }).success, true);
});

test("email HTML escaping neutralises markup", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert(1)">&'`), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;");
});

test("the JSON reader requires exactly application/json", async () => {
  const make = (type) =>
    new Request("https://apex.sy/api/contact", { method: "POST", headers: { "content-type": type }, body: JSON.stringify(valid) });
  assert.deepEqual(await readLimitedJson(make("application/json; charset=utf-8")), valid);
  // Sent cross-site without a CORS preflight, so it must not count as JSON.
  await assert.rejects(() => readLimitedJson(make("text/plain;application/json")), (e) => e instanceof RequestBodyError && e.status === 415);
});

test("the JSON reader rejects oversized streamed bodies without Content-Length", async () => {
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
  await assert.rejects(() => readLimitedJson(request), (e) => e instanceof RequestBodyError && e.status === 413);
});
