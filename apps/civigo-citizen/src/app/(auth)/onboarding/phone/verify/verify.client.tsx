"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function VerifyClient({
  verifyOtpAction,
}: {
  verifyOtpAction: (prev: any, formData: FormData) => Promise<any>;
}) {
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("code", code);
    setPending(true);
    try {
      const res = await verifyOtpAction(null as any, fd);
      if (res?.ok) {
        toast.success("Phone verified. Proceeding...");
        router.push("/onboarding/email");
      } else if (res?.error === "expired")
        toast.error("OTP expired. Please resend.");
      else if (res?.error === "mismatch") toast.error("Incorrect code.");
      else toast.error("Verification failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onVerify} className="space-y-8" aria-busy={pending}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#4f4f4f]">Enter The Code</h2>
      </div>

      <div className="flex items-center justify-center">
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          maxLength={6}
          placeholder="000000"
          className="w-full max-w-[260px] border-0 border-b-2 border-gray-300 bg-transparent text-center text-[28px] tracking-[0.5em] h-14 focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
        <Button
          variant="primary"
          type="submit"
          disabled={pending || code.length !== 6}
          className="w-full rounded-md py-3.5 text-[18px] font-medium"
        >
          {pending ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </form>
  );
}
