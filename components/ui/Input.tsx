"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  isAr: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, isAr, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
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
          className={`rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${isAr ? "font-ar text-right" : "font-en"} ${className}`}
          style={{
            background: "var(--color-card)",
            borderColor: error ? "#ef4444" : "var(--color-border)",
            color: "var(--color-primary-text)",
          }}
          {...rest}
        />
        {error && (
          <span className={`text-xs ${isAr ? "font-ar text-right" : "font-en"}`} style={{ color: "#ef4444" }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
