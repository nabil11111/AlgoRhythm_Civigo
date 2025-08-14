"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function NamesForm({
  submitAction,
}: {
  submitAction: (
    prev: any,
    formData: FormData
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [first, setFirst] = React.useState("");
  const [last, setLast] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("first_name", first);
      fd.set("last_name", last);
      const res = await submitAction(null as any, fd);
      if (res?.ok) {
        toast.success("Saved");
        router.push("/onboarding/password");
        return;
      } else toast.error("Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-busy={pending}>
      <div>
        <Label htmlFor="first_name">First name</Label>
        <Input
          id="first_name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          disabled={pending}
        />
      </div>
      <div>
        <Label htmlFor="last_name">Last name</Label>
        <Input
          id="last_name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Continue"}
      </Button>
    </form>
  );
}
