'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/utils/supabase/server";

export async function finalizeOnboarding(prev: { ok: boolean; error?: string } | null) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  // Load IDV row and phone verified
  const { data: idv } = await supabase
    .from('identity_verifications')
    .select('nic, status, nic_front_path, nic_back_path, face_capture_path')
    .eq('user_temp_id', tempId)
    .maybeSingle();
  if (!idv) return { ok: false, error: 'no_idv' } as const;
  if (idv.status !== 'pending' && idv.status !== 'approved') return { ok: false, error: 'not_ready' } as const;
  if (!idv.nic_front_path || !idv.nic_back_path || !idv.face_capture_path) return { ok: false, error: 'media_missing' } as const;
  const namesCookie = (await cookies()).get('onboarding_names')?.value;
  const password = (await cookies()).get('onboarding_password')?.value;
  if (!namesCookie || !password) return { ok: false, error: 'incomplete' } as const;
  const { first_name, last_name } = JSON.parse(namesCookie);

  // Generate gov_id
  const { data: gen } = await supabase.rpc('generate_gov_id', { p_nic: idv.nic });
  const govId = (gen as unknown as string) ?? null;
  if (!govId) return { ok: false, error: 'invalid_nic' } as const;

  // Create auth user (placeholder email policy: nic@placeholder.local)
  const email = `${govId}@placeholder.local`;
  const { error: authErr, data: signUpData } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'citizen' },
  } as any);
  if (authErr) return { ok: false, error: 'auth_create_failed' } as const;

  // Update profile with gov_id, nic, full_name
  const profileId = signUpData.user?.id;
  if (!profileId) return { ok: false, error: 'profile_missing' } as const;
  await supabase.from('profiles').update({
    nic: idv.nic,
    gov_id: govId,
    full_name: `${first_name} ${last_name}`,
    role: 'citizen',
  }).eq('id', profileId);

  // Create NIC document entry linked by owner_gov_id
  // Persist a summary entry into citizen-documents/nic (metadata-only record)
  await supabase.from('documents').insert({
    owner_user_id: profileId,
    owner_gov_id: govId,
    title: 'Identity: NIC',
    storage_path: `nic/${govId}-${Date.now()}.json`,
    mime_type: 'application/json',
    size_bytes: null,
  });

  // Clear temp cookie
  cookieStore.set('onboarding_temp_id', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
  cookieStore.set('onboarding_names', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
  cookieStore.set('onboarding_password', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });

  revalidatePath('/(auth)/sign-in');
  return { ok: true } as const;
}


