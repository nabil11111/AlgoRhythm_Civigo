import { sendOtp, verifyOtp } from "./_actions";
import { ProgressHeader } from "../_components/ProgressHeader";
import PhoneForms from "./phone.client";

export default async function PhoneStepPage() {
  return (
    <div className="space-y-6">
      <ProgressHeader current="phone" />
      <PhoneForms sendOtpAction={sendOtp} verifyOtpAction={verifyOtp} />
    </div>
  );
}


