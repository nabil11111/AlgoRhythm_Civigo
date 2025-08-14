'use server';

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/utils/supabase/server";
// Note: If signed PUT URLs are not available, use server-side upload via storage.upload

const schema = z.object({ front_path: z.string().min(1), back_path: z.string().min(1) });

export async function saveNicPhotos(prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const parsed = schema.safeParse({ front_path: formData.get('front_path'), back_path: formData.get('back_path') });
  if (!parsed.success) return { ok: false, error: 'invalid' } as const;

  await supabase.from('identity_verifications').update({
    nic_front_path: parsed.data.front_path,
    nic_back_path: parsed.data.back_path,
  }).eq('user_temp_id', tempId);

  revalidatePath('/onboarding/face');
  return { ok: true } as const;
}

// Signed upload URL generator for client-side upload (called from a server action)
export async function getNicUploadUrl(prev: { ok: boolean; error?: string; url?: string } | null, formData: FormData) {
  const kind = String(formData.get('kind') || '');
  if (kind !== 'front' && kind !== 'back') return { ok: false, error: 'invalid_kind' } as const;
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const folder = kind === 'front' ? 'front' : 'back';
  const objectName = `${folder}/${tempId}-${Date.now()}.jpg`;
  return { ok: true, url: objectName } as const;
}

export async function uploadNicPhoto(prev: { ok: boolean; error?: string; path?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const kind = String(formData.get('kind') || '');
  const file = formData.get('file');
  if (kind !== 'front' && kind !== 'back') return { ok: false, error: 'invalid_kind' } as const;
  if (!(file instanceof File)) return { ok: false, error: 'invalid_file' } as const;

  const folder = kind === 'front' ? 'front' : 'back';
  const ext = (file.type && file.type.includes('png')) ? 'png' : 'jpg';
  const objectName = `${folder}/${tempId}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from('nic-media').upload(objectName, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (upErr) return { ok: false, error: 'upload_failed' } as const;
  return { ok: true, path: objectName } as const;
}

export async function getSignedNicPhotoUrl(prev: { ok: boolean; error?: string; url?: string } | null, formData: FormData) {
  const kind = String(formData.get('kind') || '');
  if (kind !== 'front' && kind !== 'back') return { ok: false, error: 'invalid_kind' } as const;
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  // Fetch stored path
  const { data: idv } = await supabase
    .from('identity_verifications')
    .select('nic_front_path, nic_back_path')
    .eq('user_temp_id', tempId)
    .maybeSingle();
  const path = kind === 'front' ? idv?.nic_front_path : idv?.nic_back_path;
  if (!path) return { ok: false, error: 'not_found' } as const;
  const { data: signed, error } = await supabase.storage.from('nic-media').createSignedUrl(path, 120);
  if (error || !signed?.signedUrl) return { ok: false, error: 'sign_failed' } as const;
  return { ok: true, url: signed.signedUrl } as const;
}


