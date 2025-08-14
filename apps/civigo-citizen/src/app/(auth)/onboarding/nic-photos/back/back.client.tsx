"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BackClient({
  uploadAction,
}: {
  uploadAction: (
    prev: any,
    formData: FormData
  ) => Promise<{ ok: boolean; path?: string; error?: string }>;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [streamReady, setStreamReady] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [uploadPath, setUploadPath] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const router = useRouter();

  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unavailable");
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      const video = videoRef.current;
      if (video) {
        video.srcObject = media;
        await video.play();
        setStreamReady(true);
        setCameraError(null);
      }
    } catch (err) {
      setStreamReady(false);
      if (!window.isSecureContext)
        setCameraError(
          "Camera requires HTTPS or localhost. Use an HTTPS tunnel for mobile testing."
        );
      else setCameraError("Unable to access camera. Please grant permission or use Upload.");
    }
  }

  React.useEffect(() => {
    if (window.isSecureContext) startCamera();
    else
      setCameraError(
        "Camera requires HTTPS or localhost. Use an HTTPS tunnel for mobile testing."
      );
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
        const file = new File([blob], "back.jpg", {
          type: blob.type || "image/jpeg",
        });
        const fd = new FormData();
        fd.set("kind", "back");
        fd.set("file", file);
        const res = await uploadAction(null as any, fd);
        if (res?.ok && res.path) {
          setUploadPath(res.path);
          setPreviewUrl(URL.createObjectURL(file));
          toast.success("Captured");
        } else {
          toast.error("Capture upload failed");
        }
      } finally {
        setPending(false);
      }
    }, "image/jpeg");
  }

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("kind", "back");
      fd.set("file", file);
      const res = await uploadAction(null as any, fd);
      if (res?.ok && res.path) {
        setUploadPath(res.path);
        setPreviewUrl(URL.createObjectURL(file));
        toast.success("Uploaded");
      } else toast.error("Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-center text-xl font-semibold text-[#4f4f4f]">
        NIC Back Photo
      </h2>
      <div className="rounded-xl border-2 border-[var(--color-primary)] overflow-hidden">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Back preview"
            className="w-full h-[220px] object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-[220px] object-cover"
            muted
            playsInline
            autoPlay
          />
        )}
      </div>
      {cameraError && (
        <p className="text-center text-xs text-gray-600">{cameraError}</p>
      )}
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="primary"
          onClick={streamReady ? capture : startCamera}
          disabled={!streamReady || pending}
        >
          {streamReady ? "Capture" : "Enable Camera"}
        </Button>
        <label className="inline-flex items-center rounded-md border-2 border-[var(--color-primary)] px-3 py-2 text-[var(--color-primary)]">
          Upload
          <input
            type="file"
            accept="image/*"
            onChange={onFilePick}
            className="hidden"
          />
        </label>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
        <a
          href="/onboarding/face"
          className="block w-full rounded-md bg-[var(--color-primary)] text-white py-3.5 text-center text-[18px] font-medium"
        >
          Next
        </a>
      </div>
    </div>
  );
}
