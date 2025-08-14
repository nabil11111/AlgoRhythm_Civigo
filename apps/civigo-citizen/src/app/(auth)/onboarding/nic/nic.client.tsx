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
    <form onSubmit={onSubmit} className="space-y-3" aria-busy={pending}>
      <div>
        <Label htmlFor="nic">NIC</Label>
        <Input
          id="nic"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          placeholder="123456789V or 199012341234"
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Continue"}
      </Button>
    </form>
  );
}
