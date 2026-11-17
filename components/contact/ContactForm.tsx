"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle, Loader2, Mail, MessageCircle } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import {
  BUDGETS,
  PROJECT_TYPES,
  contactSchema,
  fieldErrorCodes,
  type ContactErrorCode,
  type ContactField,
  type FieldErrorCode,
} from "@/lib/contact-contract";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type FormDict = Dictionary["contact"]["form"];
type Values = Record<ContactField | "website", string>;
type Errors = Partial<Record<ContactField, string>>;

// Focus lands on the first invalid field in on-screen order.
const FIELD_ORDER: ContactField[] = ["name", "email", "phone", "projectType", "budget", "description"];

/** One message per field and error code, all from the dictionary. */
function messageFor(field: ContactField, code: FieldErrorCode, e: FormDict["errors"]): string {
  if (code === "too_long") return e.tooLong;
  switch (field) {
    case "name":
      return code === "too_short" ? e.nameTooShort : e.nameRequired;
    case "email":
      return code === "required" ? e.emailRequired : e.emailInvalid;
    case "phone":
      return e.phoneInvalid;
    case "projectType":
    case "budget":
      return e.projectTypeRequired;
    case "description":
      return code === "too_short" ? e.descriptionTooShort : e.descriptionRequired;
  }
}

function toMessages(codes: Partial<Record<ContactField, FieldErrorCode>>, e: FormDict["errors"]): Errors {
  const out: Errors = {};
  for (const field of FIELD_ORDER) {
    const code = codes[field];
    if (code) out[field] = messageFor(field, code, e);
  }
  return out;
}

const REQUEST_ERRORS: Record<ContactErrorCode, keyof FormDict["errors"]> = {
  invalid: "sendFailed",
  rate_limited: "rateLimited",
  too_large: "tooLong",
  bad_request: "sendFailed",
  unavailable: "unavailable",
  send_failed: "sendFailed",
};

export function ContactForm({ lang, form }: { lang: Locale; form: FormDict }) {
  const isAr = lang === "ar";
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  const projectTypeOptions = PROJECT_TYPES.map((value) => ({ value, label: form.projectTypeOptions[value] }));
  const budgetOptions = BUDGETS.filter((value) => value !== "unsure").map((value) => ({
    value,
    label: form.budgetOptions[value],
  }));

  function readValues(): Values {
    const fd = new FormData(formRef.current ?? undefined);
    const get = (key: string) => String(fd.get(key) ?? "");
    return {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      projectType: get("projectType"),
      budget: get("budget"),
      description: get("description"),
      website: get("website"),
    };
  }

  /** The same zod schema the server runs, so client and server never disagree. */
  function validate(values: Values): Errors {
    const payload = { ...values, budget: values.budget || undefined, phone: values.phone || undefined };
    const result = contactSchema.safeParse(payload);
    return result.success ? {} : toMessages(fieldErrorCodes(result.error), form.errors);
  }

  function focusFirstInvalid(errs: Errors) {
    const first = FIELD_ORDER.find((field) => errs[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  /** Clears a field's error as soon as the visitor edits it. */
  function clearError(field: string) {
    if (!(field in errors)) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field as ContactField];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setRequestError(null);
    const values = readValues();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstInvalid(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, budget: values.budget || undefined, phone: values.phone || undefined }),
      });
      // A proxy or platform error page is not JSON; treat it as a failed send
      // rather than as an unreachable server.
      const result = (await res.json().catch(() => ({}))) as {
        code?: ContactErrorCode;
        fieldErrors?: Partial<Record<ContactField, FieldErrorCode>>;
      };
      if (res.ok) {
        setSent(true);
        formRef.current?.reset();
        return;
      }
      const fieldMessages = result.fieldErrors ? toMessages(result.fieldErrors, form.errors) : {};
      if (Object.keys(fieldMessages).length > 0) {
        setErrors(fieldMessages);
        focusFirstInvalid(fieldMessages);
      } else {
        setRequestError(form.errors[REQUEST_ERRORS[result.code ?? "send_failed"] ?? "sendFailed"]);
      }
    } catch {
      setRequestError(form.errors.network);
    } finally {
      setLoading(false);
    }
  }

  /** WhatsApp and email hand-offs carry only the fields the visitor filled in. */
  function summary(values: Values): string {
    const rows: Array<[string, string]> = [
      [form.name, values.name],
      [form.email, values.email],
      [form.phone, values.phone],
      [form.projectType, values.projectType ? form.projectTypeOptions[values.projectType as keyof FormDict["projectTypeOptions"]] : ""],
      [form.budget, values.budget ? form.budgetOptions[values.budget as keyof FormDict["budgetOptions"]] : ""],
      [form.description, values.description],
    ];
    return rows
      .filter(([, value]) => value.trim())
      .map(([label, value]) => `${label}: ${value.trim()}`)
      .join("\n");
  }

  const whatsappNumber = socialLinks.whatsapp.replace(/[^0-9]/g, "");

  function openWhatsApp() {
    const text = summary(readValues());
    const url = `https://wa.me/${whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openEmail() {
    const values = readValues();
    const subject = isAr ? "استفسار عن مشروع" : "Project inquiry";
    const body = summary(values);
    window.location.href = `mailto:${socialLinks.email}?subject=${encodeURIComponent(subject)}${
      body ? `&body=${encodeURIComponent(body)}` : ""
    }`;
  }

  if (sent) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-apex-border bg-apex-card p-8 text-center outline-none"
      >
        <CheckCircle size={48} className="mx-auto mb-4 text-apex-success" aria-hidden="true" />
        <h2 className="text-xl font-bold mb-2 text-apex-text">{form.successTitle}</h2>
        <p className="text-base mb-6 text-apex-muted">{form.successBody}</p>
        <button type="button" onClick={() => { setSent(false); setErrors({}); }} className="apex-btn-outline">
          {form.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      id="contact-form"
      ref={formRef}
      onSubmit={handleSubmit}
      onInput={(event) => clearError((event.target as HTMLInputElement).name)}
      noValidate
      className="rounded-2xl border border-apex-border bg-apex-card p-6 sm:p-8"
      aria-labelledby="contact-form-title"
    >
      {/* Honeypot, outside the layout and the accessibility tree. */}
      <div hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <h2 id="contact-form-title" className="text-xl font-bold mb-1 text-apex-text">
        {form.title}
      </h2>
      <p className="text-base mb-6 text-apex-muted">{form.subtitle}</p>

      {requestError && (
        <div role="alert" className="mb-6 rounded-xl border border-apex-danger p-4 text-base text-apex-danger">
          {requestError}
        </div>
      )}

      <div className="grid gap-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Input name="name" label={form.name} placeholder={form.namePlaceholder} error={errors.name} required autoComplete="name" />
          <Input
            name="email"
            type="email"
            inputMode="email"
            dir="ltr"
            label={form.email}
            placeholder={form.emailPlaceholder}
            error={errors.email}
            required
            autoComplete="email"
          />
        </div>
        <Input
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          label={form.phone}
          optionalLabel={form.optional}
          placeholder={form.phonePlaceholder}
          error={errors.phone}
          autoComplete="tel"
        />
        <div className="grid sm:grid-cols-2 gap-5">
          <Select
            name="projectType"
            label={form.projectType}
            placeholder={form.projectTypePlaceholder}
            options={projectTypeOptions}
            error={errors.projectType}
            required
          />
          <Select
            name="budget"
            label={form.budget}
            optionalLabel={form.optional}
            placeholder={form.budgetPlaceholder}
            options={budgetOptions}
            error={errors.budget}
          />
        </div>
        <Textarea
          name="description"
          label={form.description}
          placeholder={form.descriptionPlaceholder}
          error={errors.description}
          required
        />
      </div>

      <button type="submit" disabled={loading} className="apex-btn-primary mt-6 w-full min-h-[48px] disabled:opacity-60">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            {form.sending}
          </>
        ) : (
          form.submit
        )}
      </button>

      <div className="mt-6 pt-6 border-t border-apex-border">
        <p className="text-sm mb-3 text-center text-apex-muted">{form.orDirect}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={openWhatsApp} className="apex-btn-whatsapp">
            <MessageCircle size={16} aria-hidden="true" />
            {form.sendWhatsapp}
          </button>
          <button type="button" onClick={openEmail} className="apex-btn-outline">
            <Mail size={16} aria-hidden="true" />
            {form.sendEmail}
          </button>
        </div>
      </div>
    </form>
  );
}
