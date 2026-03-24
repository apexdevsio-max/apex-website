"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5";

const variants: Record<ButtonVariant, string> = {
  primary: "text-white bg-apex-primary shadow-[0_6px_20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]",
  ghost: "text-apex-primary border border-apex-border",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    />
  );
}
