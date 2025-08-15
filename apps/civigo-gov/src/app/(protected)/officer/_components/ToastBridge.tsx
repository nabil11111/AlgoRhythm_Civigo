"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function ToastBridge({
  message,
  type,
}: {
  message?: string;
  type?: "success" | "error";
}) {
  useEffect(() => {
    if (!message) return;
    if (type === "success") toast.success(message);
    else toast.error(message);
  }, [message, type]);
  return null;
}
