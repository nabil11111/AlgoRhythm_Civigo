'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/utils/supabase/server";
import crypto from "node:crypto";

const oldNic = z.string().regex(/^[0-9]{9}[VXvx]$/);
const newNic = z.string().regex(/^[0-9]{12}$/);
export const nicSchema = z.object({ nic: z.union([oldNic, newNic]) });

export async function submitNic(prevState: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  let tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) {
    tempId = crypto.randomUUID();
    cookieStore.set('onboarding_temp_id', tempId, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const parse = nicSchema.safeParse({ nic: formData.get('nic') });
  if (!parse.success) return { ok: false, error: 'invalid_nic' } as const;
  const nic = parse.data.nic;

  // Ensure NIC uniqueness against profiles
  const { data: prof } = await supabase.from('profiles').select('id').eq('nic', nic).maybeSingle();
  if (prof?.id) return { ok: false, error: 'nic_taken' } as const;

  // Upsert temp identity_verifications row
  await supabase.from('identity_verifications').upsert({ user_temp_id: tempId, nic }, { onConflict: 'user_temp_id' });

  revalidatePath('/onboarding/phone');
  return { ok: true } as const;
}


