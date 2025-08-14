import { submitPassword } from "./_actions";
import { requireStepAllowed } from "../_state";

export default async function PasswordStepPage() {
  await requireStepAllowed("password");
  return (
    <form action={submitPassword} className="space-y-3">
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Create password</label>
        <input id="password" name="password" type="password" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium">Confirm password</label>
        <input id="confirm" name="confirm" type="password" className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Continue</button>
    </form>
  );
}


