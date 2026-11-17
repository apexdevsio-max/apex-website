import { forwardRef, type InputHTMLAttributes } from "react";

import { Field, controlClass } from "./Field";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
  optionalLabel?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, optionalLabel, className = "", id, name, required, ...rest }, ref) => {
    const inputId = id ?? name;
    return (
      <Field id={inputId} label={label} required={required} optionalLabel={optionalLabel} error={error}>
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`${controlClass} ${className}`}
          {...rest}
        />
      </Field>
    );
  }
);
Input.displayName = "Input";
