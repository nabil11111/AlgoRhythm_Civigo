'use server';

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/src/utils/supabase/server";

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


