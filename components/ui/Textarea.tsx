import { forwardRef, type TextareaHTMLAttributes } from "react";

import { Field, controlClass } from "./Field";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  label: string;
  error?: string;
  optionalLabel?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, optionalLabel, className = "", id, name, required, ...rest }, ref) => {
    const textareaId = id ?? name;
    return (
      <Field id={textareaId} label={label} required={required} optionalLabel={optionalLabel} error={error}>
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={5}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`${controlClass} resize-y ${className}`}
          {...rest}
        />
      </Field>
    );
  }
);
Textarea.displayName = "Textarea";
