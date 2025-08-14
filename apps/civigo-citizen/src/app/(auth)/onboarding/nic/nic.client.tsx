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
    <form onSubmit={onSubmit} className="space-y-6" aria-busy={pending}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[#4f4f4f]">Enter Your NIC Number</h2>
      </div>
      <div>
        <Label htmlFor="nic" className="sr-only">NIC</Label>
        <Input
          id="nic"
          inputMode="numeric"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          placeholder="199877703646 or 123456789V"
          disabled={pending}
          aria-describedby="nic-hint"
          className="tracking-[0.35em] text-[28px] h-14 text-center placeholder:text-gray-400"
        />
        <p id="nic-hint" className="mt-2 text-center text-xs text-gray-500">We’ll verify this with your GovID records</p>
      </div>
      <div className="flex items-center justify-center gap-10">
        <button type="button" disabled={pending} className="h-12 w-12 rounded-md border-2 border-[var(--color-primary)] text-[#333] text-2xl">V</button>
        <button type="button" disabled={pending} className="h-12 w-12 rounded-md border-2 border-[var(--color-primary)] text-[#333] text-2xl">X</button>
      </div>
      <Button type="submit" disabled={pending} className="w-full bg-[var(--color-primary)] text-white h-14 text-lg">
        {pending ? "Saving..." : "Next"}
      </Button>
    </form>
  );
}
