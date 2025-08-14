"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      style={{
        "--normal-bg": "var(--background)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--color-border)",
      } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast:
            "bg-[var(--background)] text-[var(--foreground)] border border-[var(--color-border)] shadow-md",
          title: "font-medium",
          actionButton: "bg-[var(--color-primary)] text-white",
          cancelButton: "bg-gray-100 text-gray-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };


