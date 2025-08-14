import { requireStepAllowed } from "../_state";
import { redirect } from "next/navigation";

export default async function NicPhotosStepPage() {
  await requireStepAllowed("nic-photos");
  redirect("/onboarding/nic-photos/front");
}


