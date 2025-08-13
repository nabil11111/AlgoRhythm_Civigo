"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/utils/supabase/client";
import { z } from "zod";
import { useRouter } from "next/navigation";

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = SignUpSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Please enter a valid email and password");
      return;
    }
    startTransition(async () => {
      const supabase = getBrowserClient();
      const { error } = await supabase.auth.signUp(parsed.data);
      if (error) {
        toast.error("Sign-up failed. Try a different email.");
        return;
      }
      toast.success("Account created. You can sign in now.");
      router.replace("/sign-in");
    });
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
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
          {isPending ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="text-sm mt-4">
        Already have an account? <a href="/sign-in" className="underline">Sign in</a>
      </p>
    </div>
  );
}


