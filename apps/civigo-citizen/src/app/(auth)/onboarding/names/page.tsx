import { submitNames } from "./_actions";
import { requireStepAllowed } from "../_state";
import NamesForm from "./names.client";
import { ProgressHeader } from "../_components/ProgressHeader";

export default async function NamesStepPage() {
  await requireStepAllowed("names");
  return (
    <div className="space-y-6">
      <ProgressHeader current="names" />
      <NamesForm submitAction={submitNames} />
    </div>
  );
}


