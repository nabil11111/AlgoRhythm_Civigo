"use client";

import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={["w-full border rounded px-3 py-2 text-sm", className].join(" ")}
        {...props}
      />
    );
  }
);


