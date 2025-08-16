"use client";

import { useEffect, useState } from "react";

export function ChatButton({ onOpen }: { onOpen: () => void }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    // Read flag via injected data attribute to avoid leaking env
    const flag = document.documentElement.getAttribute("data-agent-enabled");
    setEnabled(flag === "true");
  }, []);
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-24 right-5 w-11 h-11 rounded-full bg-[var(--color-primary)] text-white shadow-lg"
      aria-label="Ask Assistant"
    >
      AI
    </button>
  );
}

export default ChatButton;
