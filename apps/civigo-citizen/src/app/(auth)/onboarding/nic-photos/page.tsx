import { saveNicPhotos } from "./_actions";

export default async function NicPhotosStepPage() {
  return (
    <form action={saveNicPhotos} className="space-y-3">
      <div>
        <label htmlFor="front_path" className="block text-sm font-medium">NIC front path</label>
        <input id="front_path" name="front_path" className="w-full border rounded px-3 py-2" placeholder="user/{temp}/nic-front.jpg" />
      </div>
      <div>
        <label htmlFor="back_path" className="block text-sm font-medium">NIC back path</label>
        <input id="back_path" name="back_path" className="w-full border rounded px-3 py-2" placeholder="user/{temp}/nic-back.jpg" />
      </div>
      <p className="text-xs text-muted-foreground">Upload will use signed URLs (to be wired). Enter stored object paths for now.</p>
      <button type="submit" className="inline-flex items-center justify-center rounded bg-black px-3 py-2 text-white">Continue</button>
    </form>
  );
}


