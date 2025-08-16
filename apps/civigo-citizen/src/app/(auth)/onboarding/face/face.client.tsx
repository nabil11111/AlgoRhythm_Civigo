"use client";

import * as React from "react";
import { toast } from "sonner";

export default function FaceClient({
  uploadAction,
  saveAction,
}: {
  uploadAction: (
    prev: any,
    formData: FormData
  ) => Promise<{ ok: boolean; path?: string; error?: string }>;
  saveAction: (formData: FormData) => Promise<any>;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [streamReady, setStreamReady] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadPath, setUploadPath] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unavailable");
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      const video = videoRef.current;
      if (video) {
        video.srcObject = media;
        await video.play();
        setStreamReady(true);
        setError(null);
      }
    } catch (err) {
      setStreamReady(false);
      if (!window.isSecureContext)
        setError("Camera requires HTTPS or localhost.");
      else setError("Unable to access front camera. Please grant permission.");
    }
  }

  React.useEffect(() => {
    if (window.isSecureContext) startCamera();
    else setError("Camera requires HTTPS or localhost.");
    return () => {
      const v = videoRef.current as HTMLVideoElement | null;
      const s = v?.srcObject as MediaStream | undefined;
      s?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setPending(true);
      try {
        const file = new File([blob], "face.jpg", {
          type: blob.type || "image/jpeg",
        });
        const fd = new FormData();
        fd.set("file", file);
        const res = await uploadAction(null as any, fd);
        if (res?.ok && res.path) {
          setUploadPath(res.path);
          setPreviewUrl(URL.createObjectURL(file));
          toast.success("Captured");
        } else toast.error("Capture upload failed");
      } finally {
        setPending(false);
      }
    }, "image/jpeg");
  }

  async function onNext() {
    if (!uploadPath) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("face_path", uploadPath);
      const result = await saveAction(fd);
      if (result && !result.ok) {
        // Provide more specific error messages based on error type
        let errorMessage = "Failed to save face capture. Please try again.";
        if (result.error === "no_session") {
          errorMessage =
            "Session expired. Please restart the onboarding process.";
        } else if (result.error === "db_update_failed") {
          errorMessage = "Database error. Please try again.";
        } else if (result.error === "no_idv") {
          errorMessage =
            "Verification record not found. Please restart onboarding.";
        } else if (result.error === "media_missing") {
          errorMessage =
            "Required photos are missing. Please complete all photo steps.";
        } else if (result.error === "incomplete") {
          errorMessage =
            "Onboarding information incomplete. Please complete all steps.";
        }
        toast.error(errorMessage);
        setPending(false);
        return;
      }
      // Success - the redirect should happen from the server action
      // But if we reach here, it means redirect didn't work, so we handle it client-side
      window.location.href = "/onboarding/login/password";
    } catch (error) {
      console.error("Face capture save error:", error);
      toast.error("An error occurred. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-full border-2 border-[var(--color-primary)] overflow-hidden w-[320px] h-[320px] mx-auto">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Face preview"
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform -scale-x-100"
            muted
            playsInline
            autoPlay
          />
        )}
      </div>
      {error && <p className="text-center text-xs text-gray-600">{error}</p>}

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={streamReady ? capture : startCamera}
          disabled={!streamReady || pending}
          aria-label={streamReady ? "Capture" : "Enable Camera"}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white w-16 h-16 disabled:opacity-50"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9 3l2 2h2l2-2h2a3 3 0 013 3v12a3 3 0 01-3 3H5a3 3 0 01-3-3V6a3 3 0 013-3h4zm3 15a5 5 0 100-10 5 5 0 000 10zm0-2.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!uploadPath || pending}
          className="w-full rounded-md bg-[var(--color-primary)] text-white py-3.5 text-[18px] font-medium"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
