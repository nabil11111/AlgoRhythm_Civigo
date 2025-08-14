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
