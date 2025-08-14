"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PhoneForms({
  sendOtpAction,
  verifyOtpAction,
}: {
  sendOtpAction: (prev: any, formData: FormData) => Promise<any>;
  verifyOtpAction: (prev: any, formData: FormData) => Promise<any>;
}) {
  const [pendingSend, setPendingSend] = React.useState(false);
  const [pendingVerify, setPendingVerify] = React.useState(false);

  async function onSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPendingSend(true);
    try {
      const res = await sendOtpAction(null as any, formData);
      if (res?.ok) toast.success("OTP sent");
      else if (res?.error === 'rate_limited_minute') toast.error("Please wait a minute before retrying.");
      else if (res?.error === 'rate_limited_hour') toast.error("Too many attempts. Try again later.");
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
      if (res?.ok) toast.success("Phone verified. Proceeding...");
      else if (res?.error === 'expired') toast.error("OTP expired. Please resend.");
      else if (res?.error === 'mismatch') toast.error("Incorrect code.");
      else toast.error("Verification failed");
    } finally {
      setPendingVerify(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSend} className="space-y-3" aria-busy={pendingSend}>
        <div>
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" name="phone" placeholder="07XXXXXXXX" disabled={pendingSend} />
        </div>
        <Button type="submit" disabled={pendingSend}>{pendingSend ? "Sending..." : "Send OTP"}</Button>
      </form>
      <form onSubmit={onVerify} className="space-y-3" aria-busy={pendingVerify}>
        <div>
          <Label htmlFor="code">Enter OTP</Label>
          <Input id="code" name="code" placeholder="000000" disabled={pendingVerify} />
        </div>
        <Button type="submit" disabled={pendingVerify}>{pendingVerify ? "Verifying..." : "Verify"}</Button>
      </form>
    </div>
  );
}


