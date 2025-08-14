import { submitNames } from "./_actions";
import { requireStepAllowed } from "../_state";

export default async function NamesStepPage() {
  await requireStepAllowed("names");
  return (
    <form action={submitNames} className="space-y-3">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium">First name</label>
        <input id="first_name" name="first_name" className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium">Last name</label>
        <input id="last_name" name="last_name" className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Continue</button>
    </form>
  );
}


