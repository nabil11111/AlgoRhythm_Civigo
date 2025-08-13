'use server';

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/src/utils/supabase/server";

const schema = z.object({ face_path: z.string().min(1) });

export async function saveFaceCapture(prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const parsed = schema.safeParse({ face_path: formData.get('face_path') });
  if (!parsed.success) return { ok: false, error: 'invalid' } as const;

  await supabase.from('identity_verifications').update({
    face_capture_path: parsed.data.face_path,
    status: 'pending',
  }).eq('user_temp_id', tempId);

  revalidatePath('/onboarding/finalize');
  return { ok: true } as const;
}


