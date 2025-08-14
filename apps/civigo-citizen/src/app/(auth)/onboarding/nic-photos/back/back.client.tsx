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
  const [flashOn, setFlashOn] = React.useState(false);
  const [torchSupported, setTorchSupported] = React.useState(false);
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
        // Detect torch support
        const stream = media as MediaStream;
        const track = stream.getVideoTracks()[0];
        // @ts-ignore
        const caps = track?.getCapabilities
          ? track.getCapabilities()
          : undefined;
        setTorchSupported(Boolean(caps && (caps as any).torch));
      }
    } catch (err) {
      setStreamReady(false);
      if (!window.isSecureContext)
        setCameraError(
          "Camera requires HTTPS or localhost. Use an HTTPS tunnel for mobile testing."
        );
      else
        setCameraError(
          "Unable to access camera. Please grant permission or use Upload."
        );
    }
  }

  async function restartCamera() {
    const video = videoRef.current;
    const stream = (video?.srcObject as MediaStream | undefined) || undefined;
    if (video && stream) {
      try {
        await video.play();
        setStreamReady(true);
        setCameraError(null);
        return;
      } catch {}
    }
    await startCamera();
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
          try { localStorage.setItem('onb_nic_back_path', res.path); } catch {}
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
        try { localStorage.setItem('onb_nic_back_path', res.path); } catch {}
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
            className="w-full h-[320px] object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-[320px] object-cover"
            muted
            playsInline
            autoPlay
          />
        )}
      </div>
      {cameraError && (
        <p className="text-center text-xs text-gray-600">{cameraError}</p>
      )}
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
      <div className="mt-4 flex items-center justify-center gap-5">
        {previewUrl && (
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              setUploadPath(null);
              restartCamera();
            }}
            aria-label="Retry"
            className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] w-12 h-12"
            disabled={pending}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 5V1l-5 5 5 5V7a5 5 0 11-5 5H4a8 8 0 108-8z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={async () => {
            try {
              const stream = videoRef.current?.srcObject as
                | MediaStream
                | undefined;
              const track =
                stream?.getVideoTracks && stream.getVideoTracks()[0];
              // @ts-ignore
              if (track?.applyConstraints && torchSupported) {
                // @ts-ignore
                await track.applyConstraints({
                  advanced: [{ torch: !flashOn }],
                });
                setFlashOn((v) => !v);
              } else {
                toast.message("Flash not supported on this device/browser");
              }
            } catch {
              toast.error("Could not toggle flash");
            }
          }}
          aria-label="Toggle flash"
          className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] w-12 h-12 disabled:opacity-50"
          disabled={!torchSupported}
          aria-pressed={flashOn}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7 2h10l-6 9h5l-8 11 2-9H7z" />
          </svg>
        </button>
        <label className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] w-12 h-12">
          <input
            type="file"
            accept="image/*"
            onChange={onFilePick}
            className="hidden"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 3l4 4h-3v6h-2V7H8l4-4zm-7 14h14v2H5v-2z" />
          </svg>
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
