"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/utils/supabase/client";
import { z } from "zod";
import { useRouter } from "next/navigation";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = SignInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Please enter a valid email and password");
      return;
    }
    startTransition(async () => {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        toast.error("Sign-in failed. Please check your credentials.");
        return;
      }
      // Fetch profile role
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        if (profile?.role !== "citizen") {
          toast.error("This portal is for citizens");
          return;
        }
      }
      router.replace("/app");
    });
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={isPending}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm mt-4">
        New here? <a href="/sign-up" className="underline">Create an account</a>
      </p>
    </div>
  );
}


