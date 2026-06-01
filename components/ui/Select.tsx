"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  isAr: boolean;
  options: { value: string; label: string }[];
  placeholder: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, isAr, options, placeholder, className = "", id, ...rest }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5" dir={isAr ? "rtl" : "ltr"}>
        <label
          htmlFor={selectId}
          className={`text-xs font-semibold ${isAr ? "font-ar text-right" : "font-en"}`}
          style={{ color: "var(--color-primary-text)" }}
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${isAr ? "font-ar text-right" : "font-en"} ${className}`}
          style={{
            background: "var(--color-card)",
            borderColor: error ? "#ef4444" : "var(--color-border)",
            color: "var(--color-primary-text)",
          }}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className={`text-xs ${isAr ? "font-ar text-right" : "font-en"}`} style={{ color: "#ef4444" }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
