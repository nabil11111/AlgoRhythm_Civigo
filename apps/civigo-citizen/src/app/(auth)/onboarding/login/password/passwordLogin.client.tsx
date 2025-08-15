"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/utils/supabase/client";

export default function PasswordLoginForm() {
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const cookie = document.cookie
        .split(";")
        .map((s) => s.trim())
        .find((c) => c.startsWith("login_email="));
      const email = cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
      if (!email) {
        toast.error("Session expired. Please re-enter NIC.");
        router.replace("/onboarding/nic");
        return;
      }
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error("Incorrect password");
        return;
      }
      // Clear the transient cookie after successful login
      document.cookie = "login_email=; Max-Age=0; path=/";
      router.replace("/");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-28" aria-busy={pending}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4f4f4f]">Enter Password</h2>
      </div>
      <div>
        <Label htmlFor="password" className="sr-only">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          placeholder="Your password"
          className="w-full border-0 border-b-2 border-gray-300 bg-transparent text-center text-[18px] h-12 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={pending}
          className="w-full rounded-md py-3.5 text-[18px] font-medium"
        >
          {pending ? "Signing in..." : "Continue"}
        </Button>
      </div>
    </form>
  );
}
