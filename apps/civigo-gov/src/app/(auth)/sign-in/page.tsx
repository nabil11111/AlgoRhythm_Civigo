"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getBrowserClient();
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const userId = signInData.user?.id;
      if (!userId) throw new Error("Missing user after sign-in");
      // Ensure session is established before querying RLS-protected tables
      let sessionReady = false;
      for (let i = 0; i < 5; i++) {
        const { data: sess } = await supabase.auth.getSession();
        if (sess.session) {
          sessionReady = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!sessionReady) {
        throw new Error("Session not ready; please try again");
      }
      // Fetch role to route appropriately
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      const role = profile?.role as string | undefined;
      if (role === "admin") {
        router.replace("/admin");
        return;
      }
      if (role === "officer") {
        router.replace("/officer");
        return;
      } else {
        const message =
          "You are not authorized for this portal. Please contact support.";
        toast.error(message);
        setError(message);
        return;
      }
    } catch (err) {
      const message =
        (err as { message?: string })?.message ?? "Sign-in failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-gray-600">
          Sign in with your email and password configured in Supabase Studio.
        </p>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="border rounded p-2"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="border rounded p-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="border rounded px-4 py-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
