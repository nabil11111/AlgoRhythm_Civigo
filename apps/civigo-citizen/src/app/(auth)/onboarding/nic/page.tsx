import { submitNic } from "./_actions";
import NicForm from "./nic.client";
import { ProgressHeader } from "../_components/ProgressHeader";

export default async function NicStepPage() {
  return (
    <div className="space-y-6">
      <ProgressHeader current="nic" />
      <NicForm submitNicAction={submitNic} />
    </div>
  );
}


