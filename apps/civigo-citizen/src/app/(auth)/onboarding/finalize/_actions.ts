'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/src/utils/supabase/server";

export async function finalizeOnboarding(prev: { ok: boolean; error?: string } | null) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  // Load IDV row
  const { data: idv } = await supabase
    .from('identity_verifications')
    .select('nic, status')
    .eq('user_temp_id', tempId)
    .maybeSingle();
  if (!idv) return { ok: false, error: 'no_idv' } as const;
  if (idv.status !== 'pending' && idv.status !== 'approved') return { ok: false, error: 'not_ready' } as const;

  // Generate gov_id
  const { data: gen } = await supabase.rpc('generate_gov_id', { p_nic: idv.nic });
  const govId = (gen as unknown as string) ?? null;
  if (!govId) return { ok: false, error: 'invalid_nic' } as const;

  // Defer auth user creation: For now, stub path — actual user creation will be wired via auth admin service
  // Persist profile row with gov_id will occur via auth trigger after user is created; here we only ensure uniqueness exists

  // Clear temp cookie
  cookieStore.set('onboarding_temp_id', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });

  revalidatePath('/(auth)/sign-in');
  return { ok: true } as const;
}


