'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/src/utils/supabase/server";

const namesSchema = z.object({ first_name: z.string().min(1), last_name: z.string().min(1) });

export async function submitNames(prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const parsed = namesSchema.safeParse({ first_name: formData.get('first_name'), last_name: formData.get('last_name') });
  if (!parsed.success) return { ok: false, error: 'invalid' } as const;

  // Store in identity_verifications as metadata extension fields if needed later; for now, keep minimal
  await supabase.from('identity_verifications').update({}).eq('user_temp_id', tempId);

  revalidatePath('/onboarding/password');
  return { ok: true } as const;
}


