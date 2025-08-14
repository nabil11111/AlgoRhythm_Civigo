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
    <form onSubmit={onSubmit} className="space-y-8 pb-28" aria-busy={pending}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4f4f4f]">Enter Your Names</h2>
      </div>
      <div>
        <Label htmlFor="first_name" className="sr-only">First name</Label>
        <Input
          id="first_name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          disabled={pending}
          placeholder="First name"
          className="w-full border-0 border-b-2 border-gray-300 bg-transparent text-center text-[18px] h-12 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div>
        <Label htmlFor="last_name" className="sr-only">Last name</Label>
        <Input
          id="last_name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          disabled={pending}
          placeholder="Last name"
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
