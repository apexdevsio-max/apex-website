import assert from "node:assert/strict";
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
