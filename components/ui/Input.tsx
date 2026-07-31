"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  isAr: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, isAr, className = "", id, name, ...rest }, ref) => {
    // Derived from `name`, not `label`: labels are translated, so a label-derived id
    // changes per locale and can collide between fields sharing a translation.
    const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5" dir={isAr ? "rtl" : "ltr"}>
        <label
          htmlFor={inputId}
          className={`text-xs font-semibold ${isAr ? "font-ar text-right" : "font-en"}`}
          style={{ color: "var(--color-primary-text)" }}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`rounded-xl border px-4 min-h-[44px] py-3 text-sm transition-colors ${isAr ? "font-ar text-right" : "font-en"} ${className}`}
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

Input.displayName = "Input";
