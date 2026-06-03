"use client";

import { useState, useRef, type FormEvent } from "react";
import { CheckCircle, Send, Mail, Loader2, AlertCircle } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { socialLinks } from "@/data/social-links";
import { Reveal } from "@/components/ui/Reveal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  lang: Locale;
  dictionary: Dictionary;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  description: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const PROJECT_TYPE_KEYS = ["web", "mobile", "ai", "uiux", "ecommerce", "content", "other"] as const;
const BUDGET_KEYS = ["low", "medium", "high", "premium", "enterprise"] as const;

function validate(data: FormData, dict: Dictionary["contact"]["form"]): Errors {
  const e: Errors = {};
  if (!data.name.trim()) e.name = dict.errors.nameRequired;
  if (!data.email.trim()) e.email = dict.errors.emailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = dict.errors.emailInvalid;
  if (!data.projectType) e.projectType = dict.errors.projectTypeRequired;
  if (!data.budget) e.budget = dict.errors.budgetRequired;
  if (!data.description.trim()) e.description = dict.errors.descriptionRequired;
  return e;
}

function buildWhatsAppMessage(data: FormData, projectTypeLabel: string, budgetLabel: string, isAr: boolean): string {
  const nl = "%0A";
  const lines = isAr
    ? [
        `مرحباً APEX! 👋${nl}`,
        `أود الاستفسار عن مشروع.${nl}${nl}`,
        `الاسم: ${data.name}${nl}`,
        `البريد: ${data.email}${nl}`,
        data.phone ? `الهاتف: ${data.phone}${nl}` : "",
        `نوع المشروع: ${projectTypeLabel}${nl}`,
        `الميزانية: ${budgetLabel}${nl}${nl}`,
        `وصف المشروع:${nl}${data.description}`,
      ]
    : [
        `Hello APEX! 👋${nl}`,
        `I'd like to inquire about a project.${nl}${nl}`,
        `Name: ${data.name}${nl}`,
        `Email: ${data.email}${nl}`,
        data.phone ? `Phone: ${data.phone}${nl}` : "",
        `Project Type: ${projectTypeLabel}${nl}`,
        `Budget: ${budgetLabel}${nl}${nl}`,
        `Project Description:${nl}${data.description}`,
      ];
  return lines.filter(Boolean).join("");
}

function buildMailBody(data: FormData, projectTypeLabel: string, budgetLabel: string): string {
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : "",
    `Project Type: ${projectTypeLabel}`,
    `Budget: ${budgetLabel}`,
    ``,
    `Project Description:`,
    data.description,
  ];
  return lines.filter(Boolean).join("\n");
}

export function ContactForm({ lang, dictionary }: Props) {
  const isAr = lang === "ar";
  const formDict = dictionary.contact.form;
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState<"whatsapp" | "email" | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const [apiSuccess, setApiSuccess] = useState(false);

  const projectTypeOptions = PROJECT_TYPE_KEYS.map((k) => ({
    value: k,
    label: formDict.projectTypeOptions[k],
  }));

  const budgetOptions = BUDGET_KEYS.map((k) => ({
    value: k,
    label: formDict.budgetOptions[k],
  }));

  function getFormData(): FormData {
    if (!formRef.current) return { name: "", email: "", phone: "", projectType: "", budget: "", description: "" };
    const fd = new FormData(formRef.current);
    return {
      name: (fd.get("name") as string) ?? "",
      email: (fd.get("email") as string) ?? "",
      phone: (fd.get("phone") as string) ?? "",
      projectType: (fd.get("projectType") as string) ?? "",
      budget: (fd.get("budget") as string) ?? "",
      description: (fd.get("description") as string) ?? "",
    };
  }

  function getLabels(data: FormData) {
    const pt = projectTypeOptions.find((o) => o.value === data.projectType);
    const bg = budgetOptions.find((o) => o.value === data.budget);
    return {
      projectTypeLabel: pt?.label ?? data.projectType,
      budgetLabel: bg?.label ?? data.budget,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    setFieldErrors(null);
    const data = getFormData();
    const errs = validate(data, formDict);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setApiSuccess(true);
        formRef.current?.reset();
      } else if (res.status === 429) {
        setApiError(isAr ? "لقد تجاوزت الحد المسموح من المحاولات. الرجاء المحاولة لاحقاً." : "Too many requests. Please try again later.");
      } else if (res.status === 400 && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        const mapped: Errors = {};
        for (const [key, msgs] of Object.entries(result.fieldErrors as Record<string, string[]>)) {
          if (msgs && msgs.length > 0) mapped[key as keyof FormData] = msgs[0];
        }
        setErrors(mapped);
      } else {
        setApiError(result.error ?? (isAr ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again."));
      }
    } catch {
      setApiError(isAr ? "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى." : "Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleWhatsApp() {
    const data = getFormData();
    const { projectTypeLabel, budgetLabel } = getLabels(data);
    setSending("whatsapp");
    const msg = buildWhatsAppMessage(data, projectTypeLabel, budgetLabel, isAr);
    const number = socialLinks.whatsapp.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    setTimeout(() => setSending(null), 1000);
  }

  function handleEmail() {
    const data = getFormData();
    const { projectTypeLabel, budgetLabel } = getLabels(data);
    setSending("email");
    const subject = isAr ? `استفسار مشروع من ${data.name}` : `Project Inquiry from ${data.name}`;
    const body = buildMailBody(data, projectTypeLabel, budgetLabel);
    window.location.href = `mailto:${socialLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => setSending(null), 1000);
  }

  function handleReset() {
    setErrors({});
    setApiError(null);
    setFieldErrors(null);
    setApiSuccess(false);
    formRef.current?.reset();
  }

  if (apiSuccess) {
    return (
      <Reveal>
        <div
          className="rounded-2xl border p-8 text-center"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#22c55e" }} />
          <h3
            className={`text-lg font-bold mb-2 ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-primary-text)" }}
          >
            {isAr ? "تم الإرسال بنجاح! 🎉" : "Sent successfully! 🎉"}
          </h3>
          <p
            className={`text-sm mb-6 ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)" }}
          >
            {isAr
              ? "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن."
              : "Thank you for reaching out. We'll get back to you as soon as possible."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border-2"
              style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
            >
              {isAr ? "إرسال استفسار آخر" : "Send Another Message"}
            </button>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border p-6 sm:p-8"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h3
          className={`text-lg font-bold mb-1 ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-primary-text)" }}
        >
          {formDict.title}
        </h3>
        <p
          className={`text-sm mb-6 ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {formDict.subtitle}
        </p>

        {apiError && (
          <div
            className="flex items-center gap-3 p-4 mb-6 rounded-xl border text-sm"
            style={{
              background: "color-mix(in srgb, #ef4444 8%, transparent)",
              borderColor: "color-mix(in srgb, #ef4444 25%, transparent)",
              color: "#ef4444",
            }}
          >
            <AlertCircle size={18} className="shrink-0" />
            <span className={isAr ? "font-ar" : "font-en"}>{apiError}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input
            name="name"
            label={formDict.name}
            placeholder={formDict.namePlaceholder}
            error={errors.name}
            isAr={isAr}
          />
          <Input
            name="email"
            type="email"
            label={formDict.email}
            placeholder={formDict.emailPlaceholder}
            error={errors.email}
            isAr={isAr}
          />
        </div>

        <div className="mb-4">
          <Input
            name="phone"
            type="tel"
            label={formDict.phone}
            placeholder={formDict.phonePlaceholder}
            isAr={isAr}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Select
            name="projectType"
            label={formDict.projectType}
            placeholder={formDict.projectTypePlaceholder}
            options={projectTypeOptions}
            error={errors.projectType}
            isAr={isAr}
          />
          <Select
            name="budget"
            label={formDict.budget}
            placeholder={formDict.budgetPlaceholder}
            options={budgetOptions}
            error={errors.budget}
            isAr={isAr}
          />
        </div>

        <div className="mb-6">
          <Textarea
            name="description"
            label={formDict.description}
            placeholder={formDict.descriptionPlaceholder}
            error={errors.description}
            isAr={isAr}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:-translate-y-0"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            boxShadow: "0 8px 28px color-mix(in srgb, var(--color-primary) 38%, transparent)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isAr ? "جاري الإرسال..." : "Sending..."}
            </>
          ) : (
            <>
              {isAr ? "إرسال" : "Send"}
            </>
          )}
        </button>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
          <p
            className={`text-xs mb-3 text-center ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)" }}
          >
            {isAr ? "أو تواصل معنا مباشرة عبر:" : "Or reach us directly via:"}
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={sending === "whatsapp"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                boxShadow: "0 4px 12px rgba(37,211,102,0.25)",
              }}
            >
              <Send size={14} />
              {formDict.sendWhatsapp}
            </button>
            <button
              type="button"
              onClick={handleEmail}
              disabled={sending === "email"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
                boxShadow: "0 4px 12px color-mix(in srgb, var(--color-primary) 35%, transparent)",
              }}
            >
              <Mail size={14} />
              {formDict.sendEmail}
            </button>
          </div>
        </div>
      </form>
    </Reveal>
  );
}
