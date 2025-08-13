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

  // Transiently store names in a secure cookie (encrypted storage can be added later)
  const payload = JSON.stringify({ first_name: parsed.data.first_name, last_name: parsed.data.last_name });
  // Keep PII in httpOnly cookie, short-lived
  (await cookies()).set('onboarding_names', payload, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 15 * 60 });

  revalidatePath('/onboarding/password');
  return { ok: true } as const;
}


