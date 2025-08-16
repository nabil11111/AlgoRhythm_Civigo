"use client";

import { useState } from "react";
import type { AgentAction, AgentResponse } from "@/lib/agent/types";

export default function ChatDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string; actions?: AgentAction[] }>
  >([]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<{
    serviceId?: string;
    branchId?: string;
    dateFromISO?: string;
    dateToISO?: string;
  }>({});
  const [busy, setBusy] = useState(false);

  async function send() {
    const msg = input.trim();
    if (!msg || busy) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: msg, context }),
      });
      const data: AgentResponse = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.answer, actions: data.actions },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onAction(a: AgentAction) {
    if (a.type === "selectBranch")
      setContext((c) => ({ ...c, branchId: a.params.branchId }));
    if (a.type === "selectDateRange")
      setContext((c) => ({
        ...c,
        dateFromISO: a.params.fromISO,
        dateToISO: a.params.toISO,
      }));
    if (a.type === "showSlots")
      setContext((c) => ({
        ...c,
        serviceId: a.params.serviceId,
        branchId: a.params.branchId,
        dateFromISO: a.params.fromISO,
        dateToISO: a.params.toISO,
      }));
    if (a.type === "openService")
      window.location.href = `/app/services/${a.params.serviceId}`;
    if (a.type === "openAppointments")
      window.location.href = `/app/appointments`;
    if (a.type === "book") {
      // Follow-up question to confirm booking could be added; for now just send a message asking to book
      setInput(`Please book this slot: ${a.params.slotId}`);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Assistant</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-sm underline"
          >
            Close
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[70vh]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <div
                className={`inline-block px-3 py-2 rounded ${
                  m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                {m.text}
              </div>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {m.actions.map((a, idx) => (
                    <button
                      key={idx}
                      className="text-xs border px-2 py-1 rounded"
                      onClick={() => onAction(a)}
                    >
                      {a.type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-2 py-2"
            placeholder="Ask about bookings..."
          />
          <button
            onClick={send}
            disabled={busy}
            className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
