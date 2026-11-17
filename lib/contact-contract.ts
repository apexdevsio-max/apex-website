import { z } from "zod";

export const MAX_CONTACT_BODY_BYTES = 16_384;

export const PROJECT_TYPES = ["web", "mobile", "ai", "uiux", "ecommerce", "content", "other"] as const;
export const BUDGETS = ["unsure", "low", "medium", "high", "premium", "enterprise"] as const;

/**
 * Validation messages are codes, not prose. The form maps each code to its own
 * dictionary string, so an Arabic visitor never sees an English server message.
 */
export const FIELD_ERROR_CODES = [
  "required",
  "too_short",
  "too_long",
  "invalid_email",
  "invalid_phone",
  "invalid_choice",
] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** Request-level outcomes the API reports in `code`. */
export type ContactErrorCode =
  | "invalid"
  | "rate_limited"
  | "too_large"
  | "bad_request"
  | "unavailable"
  | "send_failed";

export const NAME_MIN = 2;
export const DESCRIPTION_MIN = 10;

// `name` is interpolated into the email Subject header, so CR/LF must never survive
// validation; otherwise a submission could inject additional mail headers.
const NO_NEWLINES = /^[^\r\n]*$/;

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "required")
      .min(NAME_MIN, "too_short")
      .max(100, "too_long")
      .regex(NO_NEWLINES, "required"),
    email: z
      .string()
      .trim()
      .min(1, "required")
      .pipe(z.email("invalid_email"))
      .refine((value) => value.length <= 254 && NO_NEWLINES.test(value), "invalid_email"),
    phone: z.string().trim().max(30, "too_long").regex(NO_NEWLINES, "invalid_phone").optional(),
    projectType: z.enum(PROJECT_TYPES, { error: "invalid_choice" }),
    budget: z.enum(BUDGETS, { error: "invalid_choice" }).optional(),
    description: z
      .string()
      .trim()
      .min(1, "required")
      .min(DESCRIPTION_MIN, "too_short")
      .max(5000, "too_long"),
    // Honeypot. Any value is accepted here so a filled field never surfaces as a
    // validation error; the route drops such submissions silently instead.
    website: z.string().max(500).optional(),
  })
  .strict();

export type ContactData = z.infer<typeof contactSchema>;
export type ContactField = Exclude<keyof ContactData, "website">;

/** First error code per field, in a shape the form can render directly. */
export function fieldErrorCodes(error: z.ZodError): Partial<Record<ContactField, FieldErrorCode>> {
  const out: Partial<Record<ContactField, FieldErrorCode>> = {};
  for (const [field, messages] of Object.entries(z.flattenError(error).fieldErrors)) {
    const code = (messages as string[] | undefined)?.[0];
    if (field !== "website" && code && (FIELD_ERROR_CODES as readonly string[]).includes(code)) {
      out[field as ContactField] = code as FieldErrorCode;
    }
  }
  return out;
}

export class RequestBodyError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readLimitedJson(request: Request): Promise<unknown> {
  // Exact media type: `.includes()` also accepted `text/plain;application/json`,
  // which browsers send cross-site without a CORS preflight.
  const mediaType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
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
