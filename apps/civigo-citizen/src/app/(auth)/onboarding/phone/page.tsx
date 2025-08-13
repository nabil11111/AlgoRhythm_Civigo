import { sendOtp, verifyOtp } from "./_actions";

export default async function PhoneStepPage() {
  return (
    <div className="space-y-6">
      <form action={sendOtp} className="space-y-3">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">Mobile number</label>
          <input id="phone" name="phone" className="w-full border rounded px-3 py-2" placeholder="07XXXXXXXX" />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Send OTP</button>
      </form>
      <form action={verifyOtp} className="space-y-3">
        <div>
          <label htmlFor="code" className="block text-sm font-medium">Enter OTP</label>
          <input id="code" name="code" className="w-full border rounded px-3 py-2" placeholder="000000" />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Verify</button>
      </form>
    </div>
  );
}


