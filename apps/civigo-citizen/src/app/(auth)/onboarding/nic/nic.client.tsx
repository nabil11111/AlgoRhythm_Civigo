"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function NicForm({
  submitNicAction,
}: {
  submitNicAction: (
    prev: any,
    formData: FormData
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [nic, setNic] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("nic", nic);
      const res = await submitNicAction(null as any, fd);
      if (res?.ok) {
        toast.success("NIC accepted");
        router.push("/onboarding/phone");
        return;
      } else if (res?.error === "invalid_nic")
        toast.error("Invalid NIC format");
      else if (res?.error === "nic_taken")
        toast.error("NIC already registered");
      else toast.error("Could not save NIC");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" aria-busy={pending}>
      <div className="text-center space-y-2">
        <h2 className="text-[24px] font-bold text-[#4f4f4f] leading-[26.4px]">
          Enter Your NIC Number
        </h2>
      </div>

      {/* Visual NIC slots with hidden real input */}
      <div className="mx-auto w-full max-w-[360px]">
        <div
          className="relative mx-auto flex select-none justify-between gap-3 px-2"
          onClick={() => {
            const el = document.getElementById("nic-real") as HTMLInputElement | null;
            el?.focus();
          }}
        >
          {Array.from({ length: 12 }).map((_, idx) => {
            const char = nic.replace(/\s/g, "")[idx] ?? "";
            return (
              <div key={idx} className="flex w-7 flex-col items-center">
                <div className="text-[35px] leading-[42px] text-black/40 tabular-nums">
                  {char}
                </div>
                <div className="mt-0.5 h-[6px] w-full border-b border-black/40" />
              </div>
            );
          })}
          <input
            id="nic-real"
            aria-label="NIC"
            inputMode="numeric"
            type="tel"
            value={nic}
            onChange={(e) => setNic(e.target.value)}
            disabled={pending}
            className="absolute inset-0 h-full w-full opacity-0"
          />
        </div>
        <p id="nic-hint" className="mt-3 text-center text-xs text-gray-500">
          We’ll verify this with your GovID records
        </p>
      </div>

      <div className="flex items-center justify-center gap-10">
        <button
          type="button"
          disabled={pending}
          onClick={() => setNic((p) => p.replace(/[vVxX]$/, "") + "V")}
          className="h-12 w-12 rounded-md border-2 border-[var(--color-primary)] text-[#333] text-2xl"
        >
          V
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setNic((p) => p.replace(/[vVxX]$/, "") + "X")}
          className="h-12 w-12 rounded-md border-2 border-[var(--color-primary)] text-[#333] text-2xl"
        >
          X
        </button>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--color-primary)] text-white h-14 text-lg"
      >
        {pending ? "Saving..." : "Next"}
      </Button>
    </form>
  );
}
