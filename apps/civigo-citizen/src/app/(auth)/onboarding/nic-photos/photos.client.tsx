"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NicPhotosClient({
  getUploadUrlAction,
  uploadAction,
  saveAction,
}: {
  getUploadUrlAction: (prev: any, formData: FormData) => Promise<{ ok: boolean; url?: string; error?: string }>;
  uploadAction: (prev: any, formData: FormData) => Promise<{ ok: boolean; path?: string; error?: string }>;
  saveAction: (prev: any, formData: FormData) => Promise<any>;
}) {
  const [frontPath, setFrontPath] = React.useState("");
  const [backPath, setBackPath] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function getUrl(kind: 'front' | 'back') {
    const fd = new FormData();
    fd.set('kind', kind);
    const res = await getUploadUrlAction(null as any, fd);
    if (res?.ok && res.url) {
      if (kind === 'front') setFrontPath(res.url);
      else setBackPath(res.url);
      toast.success("Got upload target");
    } else {
      toast.error("Could not get upload URL");
    }
  }
  async function onUpload(kind: 'front' | 'back', file: File | null) {
    if (!file) return;
    const fd = new FormData();
    fd.set('kind', kind);
    fd.set('file', file);
    const res = await uploadAction(null as any, fd);
    if (res?.ok && res.path) {
      if (kind === 'front') setFrontPath(res.path);
      else setBackPath(res.path);
      toast.success('Uploaded');
    } else {
      toast.error('Upload failed');
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const fd = new FormData();
      fd.set('front_path', frontPath);
      fd.set('back_path', backPath);
      const res = await saveAction(null as any, fd);
      if (res?.ok) toast.success("Saved NIC photos");
      else toast.error("Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label>NIC front path</Label>
          <Input value={frontPath} onChange={(e) => setFrontPath(e.target.value)} />
        </div>
        <Button type="button" onClick={() => getUrl('front')}>Get URL</Button>
        <input type="file" accept="image/*" onChange={(e) => onUpload('front', e.target.files?.[0] || null)} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label>NIC back path</Label>
          <Input value={backPath} onChange={(e) => setBackPath(e.target.value)} />
        </div>
        <Button type="button" onClick={() => getUrl('back')}>Get URL</Button>
        <input type="file" accept="image/*" onChange={(e) => onUpload('back', e.target.files?.[0] || null)} />
      </div>
      <div>
        <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Continue'}</Button>
      </div>
    </form>
  );
}


