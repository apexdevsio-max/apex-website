import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHash } from "node:crypto";

import {
  contactSchema,
  escapeHtml,
  fieldErrorCodes,
  readLimitedJson,
  RequestBodyError,
  MAX_CONTACT_BODY_BYTES,
  type ContactData,
  type ContactErrorCode,
} from "@/lib/contact-contract";
import { siteUrl } from "@/lib/seo/metadata";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_TIMEOUT_MS = 2_000;
const SEND_TIMEOUT_MS = 10_000;

function fail(code: ContactErrorCode, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, code, ...extra }, { status });
}

// Prefer the header the edge rewrites and clients cannot forge. `x-forwarded-for`
// is only a fallback: behind a proxy that does not sanitize it, a caller can set it
// freely, so it must never be the primary rate-limit key.
function getClientIp(request: NextRequest): string {
  const trusted = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (trusted) return trusted;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

/** Same-site browsers send Origin on POST; anything else is not our form. */
function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients; the other checks still apply.
  if (origin === new URL(siteUrl).origin) return true;
  // Preview deployments and local development post to their own host.
  return origin === request.nextUrl.origin;
}

function checkMemoryRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 1_000) {
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// The in-memory fallback is per-instance and resets on every cold start. That is
// acceptable as a temporary state but must not be silent, so it is logged once
// per process.
let warnedAboutMissingRateLimitStore = false;

async function checkRateLimit(ip: string): Promise<boolean> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) {
    if (!warnedAboutMissingRateLimitStore) {
      warnedAboutMissingRateLimitStore = true;
      console.warn(
        "[apex] UPSTASH_REDIS_REST_URL/TOKEN are unset; contact rate limiting is " +
          "per-instance only and resets on cold start. Set both to make it durable."
      );
    }
    return checkMemoryRateLimit(ip);
  }

  const key = `contact:${createHash("sha256").update(ip).digest("hex")}`;
  try {
    const response = await fetch(`${redisUrl}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, RATE_LIMIT_WINDOW_MS / 1000, "NX"]]),
      cache: "no-store",
      signal: AbortSignal.timeout(RATE_LIMIT_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Rate limit store returned ${response.status}`);
    const result = (await response.json()) as Array<{ result?: number; error?: string }>;
    if (result.some((entry) => entry.error)) throw new Error("Rate limit store reported an error");
    return Number(result[0]?.result ?? RATE_LIMIT_MAX + 1) <= RATE_LIMIT_MAX;
  } catch (error) {
    console.warn("Durable rate limit unavailable; using local fallback", error);
    return checkMemoryRateLimit(ip);
  }
}

function emailFields(data: ContactData) {
  return [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone || "—" },
    { label: "Project Type", value: data.projectType },
    { label: "Budget", value: data.budget ?? "unsure" },
    { label: "Description", value: data.description },
  ];
}

function buildEmailHtml(data: ContactData): string {
  const rows = emailFields(data)
    .map(
      (f) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333;white-space:nowrap;vertical-align:top">${f.label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;white-space:pre-wrap">${escapeHtml(f.value)}</td></tr>`
    )
    .join("");
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="font-size:20px;margin:0 0 12px">New contact form submission</h1>
      <table style="width:100%;border-collapse:collapse;background:#fafafa"><tbody>${rows}</tbody></table>
      <p style="color:#999;font-size:12px;margin-top:16px">Sent via the apex.sy contact form. Reply to this email to answer the sender.</p>
    </div>
  `;
}

function buildEmailText(data: ContactData): string {
  return emailFields(data)
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_CONTACT_BODY_BYTES) return fail("too_large", 413);
  if (!isAllowedOrigin(request)) return fail("bad_request", 403);

  let body: unknown;
  try {
    body = await readLimitedJson(request);
  } catch (error) {
    const failure = error instanceof RequestBodyError ? error : new RequestBodyError(400, "Invalid request body");
    return fail(failure.status === 413 ? "too_large" : "bad_request", failure.status);
  }

  // Validation runs before the rate limit so a visitor correcting a typo is not
  // locked out: only submissions that would actually send count against the limit.
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return fail("invalid", 400, { fieldErrors: fieldErrorCodes(parsed.error) });
  }

  const data = parsed.data;

  // A filled honeypot gets the same answer as a real submission, so a bot learns
  // nothing about which field tripped it.
  if (data.website) return NextResponse.json({ success: true });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const recipients = (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!apiKey || !from || recipients.length === 0) {
    console.error("[apex] Contact form is not configured: RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL are required.");
    return fail("unavailable", 503);
  }

  if (!(await checkRateLimit(getClientIp(request)))) return fail("rate_limited", 429);

  try {
    const resend = new Resend(apiKey);
    const { error } = await Promise.race([
      resend.emails.send({
        from,
        to: recipients,
        replyTo: data.email,
        subject: `New inquiry from ${data.name}`,
        html: buildEmailHtml(data),
        text: buildEmailText(data),
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Resend timed out")), SEND_TIMEOUT_MS)),
    ]);
    if (error) {
      console.error("Resend error:", error);
      return fail("send_failed", 502);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return fail("send_failed", 502);
  }
}
