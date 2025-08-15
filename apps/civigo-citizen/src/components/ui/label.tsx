"use client";

import * as React from "react";

export function Label({ className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={["block text-sm font-medium", className].join(" ")} {...props} />;
}


