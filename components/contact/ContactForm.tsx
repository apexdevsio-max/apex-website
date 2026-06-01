"use client";

import { useState, useRef, type FormEvent } from "react";
import { CheckCircle, Send, Mail } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
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
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState<"whatsapp" | "email" | null>(null);

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = getFormData();
    const errs = validate(data, formDict);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(true);
  }

  function handleWhatsApp() {
    const data = getFormData();
    const { projectTypeLabel, budgetLabel } = getLabels(data);
    setSending("whatsapp");
    const msg = buildWhatsAppMessage(data, projectTypeLabel, budgetLabel, isAr);
    const number = "963991313929".replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    setTimeout(() => setSending(null), 1000);
  }

  function handleEmail() {
    const data = getFormData();
    const { projectTypeLabel, budgetLabel } = getLabels(data);
    setSending("email");
    const subject = isAr ? `استفسار مشروع من ${data.name}` : `Project Inquiry from ${data.name}`;
    const body = buildMailBody(data, projectTypeLabel, budgetLabel);
    window.location.href = `mailto:apex.devs.io@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => setSending(null), 1000);
  }

  function handleReset() {
    setSubmitted(false);
    setErrors({});
    formRef.current?.reset();
  }

  if (submitted) {
    const data = getFormData();
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
            {formDict.success}
          </h3>
          <p
            className={`text-sm mb-6 ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)" }}
          >
            {isAr ? "اختر طريقة الإرسال:" : "Choose how to send:"}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={sending === "whatsapp"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                boxShadow: "0 6px 20px rgba(37,211,102,0.3)",
              }}
            >
              <Send size={16} />
              {formDict.sendWhatsapp}
            </button>
            <button
              type="button"
              onClick={handleEmail}
              disabled={sending === "email"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
                boxShadow: "0 6px 20px color-mix(in srgb, var(--color-primary) 35%, transparent)",
              }}
            >
              <Mail size={16} />
              {formDict.sendEmail}
            </button>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className={`text-xs underline opacity-60 hover:opacity-100 transition-opacity ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)" }}
          >
            {isAr ? "تعديل البيانات" : "Edit details"}
          </button>
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
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            boxShadow: "0 8px 28px color-mix(in srgb, var(--color-primary) 38%, transparent)",
          }}
        >
          {isAr ? "التالي" : "Next"}
          <span style={{ display: "inline-block", transform: isAr ? "rotate(180deg)" : "none" }}>→</span>
        </button>
      </form>
    </Reveal>
  );
}
