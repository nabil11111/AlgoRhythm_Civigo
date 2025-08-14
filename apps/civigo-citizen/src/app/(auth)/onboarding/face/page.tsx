import { saveFaceCapture, uploadFaceCapture } from "./_actions";
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
        <div>
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0] || null;
            if (!file) return;
            const fd = new FormData();
            fd.set('file', file);
            const res = await uploadFaceCapture(null as any, fd);
            if (res?.ok && res.path) {
              const input = document.getElementById('face_path') as HTMLInputElement | null;
              if (input) input.value = res.path;
            }
          }} />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Continue</button>
      </form>
    </div>
  );
}


