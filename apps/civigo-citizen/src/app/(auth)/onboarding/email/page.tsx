import { submitEmail } from "./_actions";
import { requireStepAllowed } from "../_state";
import { ProgressHeader } from "../_components/ProgressHeader";

export default async function EmailStepPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  await requireStepAllowed("email");
  const error = searchParams?.error;
  let errorMessage: string | null = null;
  if (error === "email_in_use")
    errorMessage = "This email is already linked to an existing account.";
  if (error === "invalid_email")
    errorMessage = "Please enter a valid email address.";
  return (
    <div className="space-y-6">
      <ProgressHeader current="email" />
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2"
        >
          {errorMessage}
        </div>
      )}
      <form action={submitEmail} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            aria-invalid={Boolean(errorMessage) || undefined}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
