import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHash } from "node:crypto";
import { contactSchema, escapeHtml, readLimitedJson, RequestBodyError, MAX_CONTACT_BODY_BYTES, type ContactData } from "@/lib/contact-contract";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_TIMEOUT_MS = 2_000;

// Prefer the header the edge rewrites and clients cannot forge. `x-forwarded-for`
// is only a fallback: behind a proxy that does not sanitize it, a caller can set it
// freely, so it must never be the primary rate-limit key.
function getClientIp(request: NextRequest): string {
  const trusted = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (trusted) return trusted;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
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

// The in-memory fallback is per-instance and resets on every cold start, so on
// serverless the 3-per-hour limit is trivially bypassed by spreading submissions
// across instances. That is acceptable as a temporary state but must not be
// silent: without this warning an unconfigured deployment looks identical to a
// correctly configured one. Logged once per process rather than per request so a
// burst of traffic cannot flood the logs.
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
    const result = await response.json() as Array<{ result?: number }>;
    return Number(result[0]?.result ?? RATE_LIMIT_MAX + 1) <= RATE_LIMIT_MAX;
  } catch (error) {
    console.warn("Durable rate limit unavailable; using local fallback", error);
    return checkMemoryRateLimit(ip);
  }
}

function buildEmailHtml(data: ContactData): string {
  const fields = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone || "—" },
    { label: "Project Type", value: data.projectType },
    { label: "Budget", value: data.budget },
    { label: "Description", value: data.description },
  ];
  const rows = fields
    .map(
      (f) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333;white-space:nowrap;vertical-align:top">${f.label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555">${escapeHtml(f.value)}</td></tr>`
    )
    .join("");
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#121212,#1a1a2e);padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">New Contact Form Submission</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fafafa">
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">
        Sent via apex.sy contact form
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_CONTACT_BODY_BYTES) {
    return NextResponse.json({ success: false, error: "Request body is too large" }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await readLimitedJson(request);
  } catch (error) {
    const failure = error instanceof RequestBodyError ? error : new RequestBodyError(400, "Invalid request body");
    return NextResponse.json(
      { success: false, error: failure.message },
      { status: failure.status }
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { success: false, error: "Validation failed", fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const recipients = (process.env.CONTACT_TO_EMAIL ?? "").split(",").map((email) => email.trim()).filter(Boolean);

  if (!apiKey || !from || recipients.length === 0) {
    return NextResponse.json(
      { success: false, error: "Email service not configured. Please try WhatsApp or email directly." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: recipients,
      subject: `New Inquiry from ${data.name}`,
      html: buildEmailHtml(data),
    });
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send email. Please try WhatsApp or email directly." },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send email. Please try WhatsApp or email directly." },
      { status: 500 }
    );
  }
}
