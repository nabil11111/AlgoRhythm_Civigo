import { submitNic } from "./_actions";

export default async function NicStepPage() {
  return (
    <form action={submitNic} className="space-y-3">
      <div>
        <label htmlFor="nic" className="block text-sm font-medium">NIC</label>
        <input id="nic" name="nic" className="w-full border rounded px-3 py-2" placeholder="e.g., 123456789V or 199012341234" />
      </div>
      <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Continue</button>
    </form>
  );
}


