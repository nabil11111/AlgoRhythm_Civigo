'use server';

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/src/utils/supabase/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";

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

  const objectName = `user/${tempId}/nic-${kind}-${Date.now()}.jpg`;
  // Create signed URL for PUT via storage api - using service-role client
  // Supabase JS SDK does not support signed PUT URLs directly; we rely on upload via service role or client with session.
  // Here, we just return the target object path; client should upload via server action using service-role streaming (future work).
  return { ok: true, url: objectName } as const;
}


