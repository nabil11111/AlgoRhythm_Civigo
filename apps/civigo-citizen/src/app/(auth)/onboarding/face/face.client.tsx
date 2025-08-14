"use client";

import * as React from "react";
import { toast } from "sonner";

export default function FaceClient({
  uploadAction,
  saveAction,
}: {
  uploadAction: (prev: any, formData: FormData) => Promise<{ ok: boolean; path?: string; error?: string }>;
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
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      const video = videoRef.current;
      if (video) {
        video.srcObject = media;
        await video.play();
        setStreamReady(true);
        setError(null);
      }
    } catch (err) {
      setStreamReady(false);
      if (!window.isSecureContext) setError("Camera requires HTTPS or localhost.");
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
        const file = new File([blob], "face.jpg", { type: blob.type || "image/jpeg" });
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
    const fd = new FormData();
    fd.set("face_path", uploadPath);
    await saveAction(fd);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-full border-2 border-[var(--color-primary)] overflow-hidden w-[320px] h-[320px] mx-auto">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Face preview" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
          Next
        </button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";

export default function FaceUpload({
  uploadAction,
}: {
  uploadAction: (
    prev: any,
    formData: FormData
  ) => Promise<{ ok: boolean; path?: string; error?: string }>;
}) {
  const [path, setPath] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadAction(null as any, fd);
      if (res?.ok && res.path) {
        setPath(res.path);
        toast.success("Face image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="face_path" value={path} />
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        disabled={pending}
      />
      {path && (
        <p className="text-xs text-muted-foreground">Ready to continue</p>
      )}
    </div>
  );
}
