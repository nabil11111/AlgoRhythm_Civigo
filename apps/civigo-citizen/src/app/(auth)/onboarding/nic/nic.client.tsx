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
  const [selectedSuffix, setSelectedSuffix] = React.useState<"V" | "X" | null>(null);
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

  React.useEffect(() => {
    const last = nic.slice(-1);
    if (/^[vVxX]$/.test(last)) setSelectedSuffix(last.toUpperCase() as "V" | "X");
    else setSelectedSuffix(null);
  }, [nic]);

  return (
    <form onSubmit={onSubmit} className="space-y-8" aria-busy={pending}>
      <div className="text-center space-y-2">
        <h2 className="text-[24px] font-bold text-[#4f4f4f] leading-[26.4px]">
          Enter Your NIC Number
        </h2>
      </div>

      {/* Single bottom-bordered input to match design */}
      <div className="mx-auto w-full max-w-[360px]">
        <Label htmlFor="nic-real" className="sr-only">NIC</Label>
        <input
          id="nic-real"
          aria-label="NIC"
          inputMode="numeric"
          type="tel"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          disabled={pending}
          placeholder="199877703646 or 123456789V"
          className="block w-full border-0 border-b-2 border-gray-300 bg-transparent text-center text-[28px] tracking-[0.25em] h-14 focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-400"
        />
        <p id="nic-hint" className="mt-2 text-center text-xs text-gray-500">We’ll verify this with your GovID records</p>
      </div>

      <div className="flex items-center justify-center gap-10">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setNic((p) => p.replace(/[vVxX]$/, "") + "V");
            setSelectedSuffix("V");
          }}
          className={[
            "h-12 w-12 rounded-md border-2 text-2xl",
            selectedSuffix === "V"
              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
              : "border-[var(--color-primary)] text-[#333] bg-white",
          ].join(" ")}
        >
          V
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setNic((p) => p.replace(/[vVxX]$/, "") + "X");
            setSelectedSuffix("X");
          }}
          className={[
            "h-12 w-12 rounded-md border-2 text-2xl",
            selectedSuffix === "X"
              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
              : "border-[var(--color-primary)] text-[#333] bg-white",
          ].join(" ")}
        >
          X
        </button>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[var(--color-primary)] text-white py-3.5 text-[18px] font-medium"
      >
        {pending ? "Saving..." : "Next"}
      </Button>
    </form>
  );
}
