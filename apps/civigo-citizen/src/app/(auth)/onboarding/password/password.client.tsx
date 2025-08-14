"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordForm({
  submitAction,
}: {
  submitAction: (prev: any, formData: FormData) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("password", password);
      fd.set("confirm", confirm);
      const res = await submitAction(null as any, fd);
      if (res?.ok) toast.success("Saved");
      else if (res?.error === 'invalid') toast.error("Invalid password");
      else toast.error("Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-busy={pending}>
      <div>
        <Label htmlFor="password">Create password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={pending} />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={pending} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Continue"}</Button>
    </form>
  );
}


