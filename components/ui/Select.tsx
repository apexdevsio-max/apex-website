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
  ({ label, error, isAr, options, placeholder, className = "", id, name, ...rest }, ref) => {
    // See Input.tsx: ids come from `name` so they stay stable across locales.
    const selectId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");
    const errorId = `${selectId}-error`;

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
          name={name}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`rounded-xl border px-4 min-h-[44px] py-3 text-sm transition-colors ${isAr ? "font-ar text-right" : "font-en"} ${className}`}
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

Select.displayName = "Select";
