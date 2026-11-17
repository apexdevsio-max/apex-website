import type { ReactNode } from "react";

/** Label, required marker and error text shared by every form control. */
export function Field({
  id,
  label,
  required,
  optionalLabel,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optionalLabel?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-apex-text">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-apex-danger ms-1">*</span>
        ) : optionalLabel ? (
          <span className="ms-1 font-normal text-apex-muted">({optionalLabel})</span>
        ) : null}
      </label>
      {children}
      {error && (
        <span id={`${id}-error`} className="text-sm text-apex-danger">
          {error}
        </span>
      )}
    </div>
  );
}

/** 16px text: anything smaller makes iOS Safari zoom the page on focus. */
export const controlClass =
  "w-full rounded-xl border bg-apex-bg px-4 min-h-[48px] py-3 text-base text-apex-text transition-colors focus:border-apex-primary aria-[invalid=true]:border-apex-danger border-apex-control";
