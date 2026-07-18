import { z } from "zod";

export const MAX_CONTACT_BODY_BYTES = 16_384;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(254),
  phone: z.string().trim().max(30).optional(),
  projectType: z.enum(["web", "mobile", "ai", "uiux", "ecommerce", "content", "other"]),
  budget: z.enum(["low", "medium", "high", "premium", "enterprise"]),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  website: z.string().max(0).optional(),
}).strict();

export type ContactData = z.infer<typeof contactSchema>;

export class RequestBodyError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readLimitedJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new RequestBodyError(415, "Content-Type must be application/json");
  }
  if (!request.body) throw new RequestBodyError(400, "Request body is required");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let source = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_CONTACT_BODY_BYTES) {
      await reader.cancel();
      throw new RequestBodyError(413, "Request body is too large");
    }
    source += decoder.decode(value, { stream: true });
  }
  source += decoder.decode();
  try {
    return JSON.parse(source) as unknown;
  } catch {
    throw new RequestBodyError(400, "Invalid JSON body");
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}
