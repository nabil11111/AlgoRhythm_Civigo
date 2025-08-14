import { sendOtp, verifyOtp } from "./_actions";
import PhoneForms from "./phone.client";
import Image from "next/image";

export default async function PhoneStepPage() {
  return (
    <div className="min-h-[100svh] w-full flex flex-col bg-white">
      {/* Top frame with progress, logo */}
      <div className="w-full border-b-[6px] border-b-[var(--color-primary)] rounded-b-2xl shadow-[0_8px_24px_rgba(0,82,165,0.18)] bg-white">
        <div className="flex items-center justify-between px-4 pt-4">
          <a
            href="/onboarding/nic"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)]"
          >
            ←
          </a>
          <div className="h-1.5 w-[147px] rounded bg-[#787878]/20">
            <div
              className="h-1.5 rounded bg-[var(--color-secondary)]"
              style={{ width: "28%" }}
            />
          </div>
          <div className="inline-flex h-10 items-center justify-center rounded border-2 border-[var(--color-primary)] px-3 text-sm text-[#333]">
            En
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm px-4 text-center mt-6 mb-4">
          <Image
            src="/logo.png"
            alt="Civigo"
            width={200}
            height={200}
            priority
            className="mx-auto h-auto w-[200px]"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[360px] px-4 mt-10 pb-40">
        <PhoneForms sendOtpAction={sendOtp} verifyOtpAction={verifyOtp} />
      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2"
        aria-hidden
      />
    </div>
  );
}
