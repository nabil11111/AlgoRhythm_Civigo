import { submitEmail } from "./_actions";
import { requireStepAllowed } from "../_state";
import Image from "next/image";

export default async function EmailStepPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireStepAllowed("email");
  const params = await searchParams;
  const error = params?.error;
  let errorMessage: string | null = null;
  if (error === "email_in_use")
    errorMessage = "This email is already linked to an existing account.";
  if (error === "invalid_email")
    errorMessage = "Please enter a valid email address.";
  return (
    <div className="min-h-[100svh] w-full flex flex-col bg-white">
      {/* Top frame with progress, logo */}
      <div className="w-full border-b-[6px] border-b-[var(--color-primary)] rounded-b-2xl shadow-[0_8px_24px_rgba(0,82,165,0.18)] bg-white">
        <div className="flex items-center justify-between px-4 pt-4">
          <a
            href="/onboarding/phone/verify"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)]"
          >
            ←
          </a>
          <div className="h-1.5 w-[147px] rounded bg-[#787878]/20">
            <div
              className="h-1.5 rounded bg-[var(--color-secondary)]"
              style={{ width: "42%" }}
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
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2 mb-4"
          >
            {errorMessage}
          </div>
        )}
        <form action={submitEmail} className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#4f4f4f]">
              Enter Your Email
            </h2>
          </div>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full border-0 border-b-2 border-gray-300 bg-transparent text-center text-[18px] h-12 focus:outline-none focus:border-[var(--color-primary)]"
              aria-invalid={Boolean(errorMessage) || undefined}
              required
            />
          </div>
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--color-primary)] text-white py-3.5 text-[18px] font-medium"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2"
        aria-hidden
      />
    </div>
  );
}
