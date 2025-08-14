"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function PasswordForm({
  submitAction,
}: {
  submitAction: (
    prev: any,
    formData: FormData
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("password", password);
      fd.set("confirm", confirm);
      const res = await submitAction(null as any, fd);
      if (res?.ok) {
        toast.success("Saved");
        router.push("/onboarding/nic-photos");
        return;
      } else if (res?.error === "invalid") toast.error("Invalid password");
      else toast.error("Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-28" aria-busy={pending}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4f4f4f]">Create Password</h2>
      </div>
      <div>
        <Label htmlFor="password" className="sr-only">Create password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          placeholder="New password"
          className="w-full border-0 border-b-2 border-gray-300 bg-transparent text-center text-[18px] h-12 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div>
        <Label htmlFor="confirm" className="sr-only">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={pending}
          placeholder="Confirm password"
          className="w-full border-0 border-b-2 border-gray-300 bg-transparent text-center text-[18px] h-12 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
        <Button type="submit" variant="primary" disabled={pending} className="w-full rounded-md py-3.5 text-[18px] font-medium">
          {pending ? "Saving..." : "Continue"}
        </Button>
      </div>
    </form>
  );
}
