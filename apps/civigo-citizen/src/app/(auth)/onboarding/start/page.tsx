import Image from "next/image";
import Link from "next/link";

export default function OnboardingStartPage() {
  return (
    <div className="min-h-[100svh] w-full flex flex-col bg-white text-[#171717]">
      {/* Top frame */}
      <div className="flex-1 w-full border-b-[6px] border-b-[var(--color-primary)] rounded-b-2xl shadow-[0_8px_24px_rgba(0,82,165,0.18)] bg-white">
        {/* Top nav: back + language */}
        <div className="flex items-center justify-between px-4 pt-4">
          <Link
            href="/onboarding/welcome"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)]"
          >
            ←
          </Link>
          <button
            type="button"
            aria-label="Language"
            className="inline-flex h-10 items-center justify-center rounded border-2 border-[var(--color-primary)] px-3 text-sm text-[#333]"
          >
            En
          </button>
        </div>

        {/* Logo + copy */}
        <div className="mx-auto w-full max-w-sm px-4 text-center mt-6">
          <Image
            src="/logo.png"
            alt="Civigo"
            width={200}
            height={200}
            priority
            className="mx-auto h-auto w-[200px]"
          />

          <div className="mt-8 space-y-2">
            <h1 className="text-[32px] font-bold text-[var(--color-primary)] leading-[39px]">
              Get Started
            </h1>
            <p className="text-base text-[#4f4f4f] leading-[19px]">Sign in to continue</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mx-auto w-full max-w-[280px] px-4 pb-8 mt-6 space-y-4">
        <Link
          href="/onboarding/login-signup"
          className="block w-full rounded-md bg-[var(--color-primary)] text-white py-3.5 text-center text-[18px] font-medium"
        >
          Login
        </Link>
        <Link
          href="/sign-up"
          className="block w-full rounded-md border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] py-3.5 text-center text-[18px] font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}


