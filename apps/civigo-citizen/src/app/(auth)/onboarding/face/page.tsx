import { saveFaceCapture } from "./_actions";
import { ProgressHeader } from "../_components/ProgressHeader";

export default async function FaceStepPage() {
  return (
    <div>
      <ProgressHeader current="face" />
      <form action={saveFaceCapture} className="space-y-3">
        <div>
          <label htmlFor="face_path" className="block text-sm font-medium">Face capture path</label>
          <input id="face_path" name="face_path" className="w-full border rounded px-3 py-2" placeholder="user/{temp}/face.jpg" />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Continue</button>
      </form>
    </div>
  );
}


