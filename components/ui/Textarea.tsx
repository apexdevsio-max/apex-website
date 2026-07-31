"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  isAr: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, isAr, className = "", id, name, ...rest }, ref) => {
    // See Input.tsx: ids come from `name` so they stay stable across locales.
    const textareaId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${textareaId}-error`;

    return (
      <div className="flex flex-col gap-1.5" dir={isAr ? "rtl" : "ltr"}>
        <label
          htmlFor={textareaId}
          className={`text-xs font-semibold ${isAr ? "font-ar text-right" : "font-en"}`}
          style={{ color: "var(--color-primary-text)" }}
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`rounded-xl border px-4 min-h-[44px] py-3 text-sm transition-colors resize-y ${isAr ? "font-ar text-right" : "font-en"} ${className}`}
          style={{
            background: "var(--color-card)",
            borderColor: error ? "#ef4444" : "var(--color-border)",
            color: "var(--color-primary-text)",
          }}
          {...rest}
        />
        {error && (
          <span
            id={errorId}
            role="alert"
            className={`text-xs ${isAr ? "font-ar text-right" : "font-en"}`}
            style={{ color: "#ef4444" }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
