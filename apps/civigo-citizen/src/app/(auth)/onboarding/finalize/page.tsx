import { finalizeOnboarding } from "./_actions";
import { requireStepAllowed } from "../_state";

export default async function FinalizeStepPage() {
  await requireStepAllowed("finalize");
  return (
    <form action={finalizeOnboarding} className="space-y-3">
      <p className="text-sm text-muted-foreground">Finalize onboarding to issue your Gov ID and proceed to sign-in.</p>
      <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Finalize</button>
    </form>
  );
}


