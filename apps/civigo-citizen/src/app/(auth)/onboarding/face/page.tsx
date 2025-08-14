import { saveFaceCapture, uploadFaceCapture } from "./_actions";
import { requireStepAllowed } from "../_state";
import Image from "next/image";
import FaceUpload from "./face.client";

export default async function FaceStepPage() {
  await requireStepAllowed("face");
  return (
    <div className="min-h-[100svh] w-full flex flex-col bg-white">
      <div className="w-full border-b-[6px] border-b-[var(--color-primary)] rounded-b-2xl shadow-[0_8px_24px_rgba(0,82,165,0.18)] bg-white">
        <div className="flex items-center justify-between px-4 pt-4">
          <a href="/onboarding/nic-photos/back" aria-label="Back" className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)]">←</a>
          <div className="h-1.5 w-[147px] rounded bg-[#787878]/20">
            <div className="h-1.5 rounded bg-[var(--color-secondary)]" style={{ width: "92%" }} />
          </div>
          <div className="inline-flex h-10 items-center justify-center rounded border-2 border-[var(--color-primary)] px-3 text-sm text-[#333]">En</div>
        </div>
        <div className="mx-auto w-full max-w-sm px-4 text-center mt-6 mb-4">
          <Image src="/logo.png" alt="Civigo" width={200} height={200} priority className="mx-auto h-auto w-[200px]" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[428px] px-4 mt-10 pb-40">
        <form action={saveFaceCapture} className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#4f4f4f]">Facial Scan</h2>
          </div>
          <div className="rounded-full border-2 border-[var(--color-primary)] overflow-hidden w-[320px] h-[320px] mx-auto">
            <FaceUpload uploadAction={uploadFaceCapture} />
          </div>
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
            <button type="submit" className="w-full rounded-md bg-[var(--color-primary)] text-white py-3.5 text-[18px] font-medium">Next</button>
          </div>
        </form>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2" aria-hidden />
    </div>
  );
}
