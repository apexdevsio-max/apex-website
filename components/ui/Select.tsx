import { forwardRef, type SelectHTMLAttributes } from "react";

import { Field, controlClass } from "./Field";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
  label: string;
  error?: string;
  optionalLabel?: string;
  options: { value: string; label: string }[];
  placeholder: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, optionalLabel, options, placeholder, className = "", id, name, required, ...rest }, ref) => {
    const selectId = id ?? name;
    return (
      <Field id={selectId} label={label} required={required} optionalLabel={optionalLabel} error={error}>
        <select
          ref={ref}
          id={selectId}
          name={name}
          defaultValue=""
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`${controlClass} ${className}`}
          {...rest}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
    );
  }
);
Select.displayName = "Select";
