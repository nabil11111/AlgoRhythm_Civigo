"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function PhoneForms({
  sendOtpAction,
  verifyOtpAction,
}: {
  sendOtpAction: (prev: any, formData: FormData) => Promise<any>;
  verifyOtpAction: (prev: any, formData: FormData) => Promise<any>;
}) {
  const [pendingSend, setPendingSend] = React.useState(false);
  const [pendingVerify, setPendingVerify] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const router = useRouter();

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Ensure +94 prefix and exactly 9 digits appended
    const digits = phone.replace(/\D/g, "").slice(-9);
    formData.set("phone", `+94${digits}`);
    setPendingSend(true);
    try {
      const res = await sendOtpAction(null as any, formData);
      if (res?.ok) toast.success("OTP sent");
      else if (res?.error === "rate_limited_minute")
        toast.error("Please wait a minute before retrying.");
      else if (res?.error === "rate_limited_hour")
        toast.error("Too many attempts. Try again later.");
      else if (res?.error === "phone_in_use")
        toast.error(
          "This phone number is already linked to an existing account."
        );
      else toast.error("Could not send OTP");
    } finally {
      setPendingSend(false);
    }
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingVerify(true);
    try {
      const res = await verifyOtpAction(null as any, formData);
      if (res?.ok) {
        toast.success("Phone verified. Proceeding...");
        router.push("/onboarding/email");
        return;
      } else if (res?.error === "expired")
        toast.error("OTP expired. Please resend.");
      else if (res?.error === "mismatch") toast.error("Incorrect code.");
      else toast.error("Verification failed");
    } finally {
      setPendingVerify(false);
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSend} className="space-y-6" aria-busy={pendingSend}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#4f4f4f]">Enter Your Mobile Number</h2>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="text-2xl font-semibold text-[#4f4f4f]">+94</div>
          <input
            id="phone"
            name="phone"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={pendingSend}
            className="w-full max-w-[260px] border-0 border-b-2 border-gray-300 bg-transparent text-center text-[28px] tracking-[0.25em] h-14 focus:outline-none focus:border-[var(--color-primary)]"
            aria-label="Phone"
          />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
          <Button variant="primary" type="submit" disabled={pendingSend} className="w-full rounded-md py-3.5 text-[18px] font-medium">
            {pendingSend ? "Sending..." : "Verify"}
          </Button>
        </div>
      </form>

      <form onSubmit={onVerify} className="space-y-3" aria-busy={pendingVerify}>
        <div>
          <Label htmlFor="code">Enter OTP</Label>
          <Input id="code" name="code" placeholder="000000" disabled={pendingVerify} />
        </div>
        <Button type="submit" disabled={pendingVerify}>
          {pendingVerify ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
