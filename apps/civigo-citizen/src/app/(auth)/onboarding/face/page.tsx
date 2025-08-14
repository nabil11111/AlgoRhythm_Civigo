import { saveFaceCapture, uploadFaceCapture } from "./_actions";
import { requireStepAllowed } from "../_state";
import { ProgressHeader } from "../_components/ProgressHeader";
import FaceUpload from "./face.client";

export default async function FaceStepPage() {
  await requireStepAllowed("face");
  return (
    <div>
      <ProgressHeader current="face" />
      <form action={saveFaceCapture} className="space-y-3">
        <div>
          <label htmlFor="face_path" className="block text-sm font-medium">
            Face capture
          </label>
          <FaceUpload uploadAction={uploadFaceCapture} />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
