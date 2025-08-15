"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={"light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          /* Brand states */
          "--success-bg": "#e8f5e9",
          "--success-border": "#4caf50",
          "--success-text": "#1f2937",
          "--info-bg": "#e8f1fb",
          "--info-border": "#0052A5",
          "--info-text": "#1f2937",
          "--warning-bg": "#fff8e1",
          "--warning-border": "#ffb020",
          "--warning-text": "#1f2937",
          "--error-bg": "#ffebee",
          "--error-border": "#e53935",
          "--error-text": "#1f2937",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
