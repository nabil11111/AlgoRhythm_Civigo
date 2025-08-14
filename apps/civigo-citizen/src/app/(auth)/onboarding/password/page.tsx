import { submitPassword } from "./_actions";
import { requireStepAllowed } from "../_state";
import PasswordForm from "./password.client";
import { ProgressHeader } from "../_components/ProgressHeader";

export default async function PasswordStepPage() {
  await requireStepAllowed("password");
  return (
    <div className="space-y-6">
      <ProgressHeader current="password" />
      <PasswordForm submitAction={submitPassword} />
    </div>
  );
}


