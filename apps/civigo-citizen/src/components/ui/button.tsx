"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "primary";
};

export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-black text-white",
    primary: "bg-[var(--color-primary)] text-white",
    secondary: "bg-gray-100 text-gray-900",
    ghost: "bg-transparent text-gray-900",
  } as const;
  return <button className={[base, variants[variant], className].join(" ")} {...props} />;
}


