import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  projectType: z.string().min(1, "Project type is required"),
  budget: z.string().min(1, "Budget is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ContactData = z.infer<typeof contactSchema>;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
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
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#333;white-space:nowrap;vertical-align:top">${f.label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555">${f.value}</td></tr>`
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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
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

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Email service not configured. Please try WhatsApp or email directly." },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "APEX Contact <onboarding@resend.dev>",
      to: ["apex.devs.io@gmail.com"],
      subject: `New Inquiry from ${data.name}`,
      html: buildEmailHtml(data),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send email. Please try WhatsApp or email directly." },
      { status: 500 }
    );
  }
}
