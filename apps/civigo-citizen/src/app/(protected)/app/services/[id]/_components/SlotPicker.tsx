"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { BookSlotState } from "../_actions";
import { bookSlotAction } from "../_actions";
import { citizenBooking } from "@/lib/strings/citizen-booking";

type Slot = { id: string; slot_at: string; capacity: number };

export function SlotPicker({
  slots,
  serviceId,
}: {
  slots: Slot[];
  serviceId: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, action] = useOptimistic<BookSlotState, FormData>({ ok: undefined }, async (prev, formData) => {
    return await bookSlotAction(prev, formData);
  });

  useEffect(() => {
    if (state.error) {
      const e = state.error;
      if (e === "slot_full") toast.error(citizenBooking.errors.slotFull);
      else if (e === "slot_inactive") toast.error(citizenBooking.errors.slotInactive);
      else if (e === "slot_past") toast.error(citizenBooking.errors.slotPast);
      else toast.error(citizenBooking.errors.unknown);
    }
  }, [state.error]);

  const grouped = useMemo(() => {
    const byDay = new Map<string, Slot[]>();
    for (const s of slots) {
      const day = new Date(s.slot_at).toISOString().slice(0, 10);
      const arr = byDay.get(day) ?? [];
      arr.push(s);
      byDay.set(day, arr);
    }
    return Array.from(byDay.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [slots]);

  function changeRange(preset: "today" | "7" | "14") {
    const now = new Date();
    const from = now.toISOString().slice(0, 10);
    const days = preset === "today" ? 1 : preset === "7" ? 7 : 14;
    const toDate = new Date(now.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
    const to = toDate.toISOString().slice(0, 10);
    const sp = new URLSearchParams(search.toString());
    sp.set("from", from);
    sp.set("to", to);
    startTransition(() => router.replace(`?${sp.toString()}`));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="border rounded px-2 py-1" onClick={() => changeRange("today")} aria-busy={isPending}>Today</button>
        <button className="border rounded px-2 py-1" onClick={() => changeRange("7")} aria-busy={isPending}>Next 7 days</button>
        <button className="border rounded px-2 py-1" onClick={() => changeRange("14")} aria-busy={isPending}>Next 14 days</button>
      </div>

      <form action={action} aria-live="polite">
        <input type="hidden" name="slot_id" value={selected ?? ""} />
        <div className="space-y-4">
          {grouped.length === 0 && (
            <div className="text-sm text-gray-500" role="status" aria-live="polite">No slots available for this range.</div>
          )}
          {grouped.map(([day, list]) => (
            <div key={day}>
              <div className="text-sm font-medium mb-2">{day}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {list.length === 0 && (
                  <div className="text-xs text-gray-500">No slots</div>
                )}
                {list.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={selected === s.id}
                    className={`border rounded px-2 py-2 text-sm ${selected === s.id ? "bg-black text-white" : ""}`}
                    onClick={() => setSelected(s.id)}
                  >
                    {new Date(s.slot_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button className="bg-black text-white rounded px-3 py-2 disabled:opacity-50" disabled={!selected} aria-busy={isPending}>
            {citizenBooking.confirmCta}
          </button>
        </div>
      </form>
    </div>
  );
}


