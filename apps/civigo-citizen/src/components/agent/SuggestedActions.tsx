"use client";

import type { AgentAction } from "@/lib/agent/types";

export default function SuggestedActions({
  actions,
  onAction,
}: {
  actions: AgentAction[];
  onAction: (a: AgentAction) => void;
}) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((a, i) => (
        <button
          key={i}
          className="text-xs border px-2 py-1 rounded"
          onClick={() => onAction(a)}
        >
          {a.type}
        </button>
      ))}
    </div>
  );
}
