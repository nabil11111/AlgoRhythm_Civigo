'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/utils/supabase/server";
import crypto from "node:crypto";

const phoneSchema = z.object({ phone: z.string().min(8).max(20) });

export async function sendOtp(prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  let tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) {
    tempId = crypto.randomUUID();
    cookieStore.set('onboarding_temp_id', tempId, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  }
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const parsed = phoneSchema.safeParse({ phone: formData.get('phone') });
  if (!parsed.success) return { ok: false, error: 'invalid_phone' } as const;
  const phone = parsed.data.phone;

  // Mock OTP: generate code and store hash with short expiry
  const code = '000000'; // mock
  const otpHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Basic rate limit: 1/min and 5/hour
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: c1 } = await supabase
    .from('phone_verification_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_temp_id', tempId)
    .eq('phone', phone)
    .gte('created_at', oneMinuteAgo);
  if ((c1 ?? 0) > 0) return { ok: false, error: 'rate_limited_minute' } as const;
  const { count: c2 } = await supabase
    .from('phone_verification_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_temp_id', tempId)
    .eq('phone', phone)
    .gte('created_at', oneHourAgo);
  if ((c2 ?? 0) >= 5) return { ok: false, error: 'rate_limited_hour' } as const;

  await supabase.from('phone_verification_events').insert({ user_temp_id: tempId, phone });

  // Replace any prior row for this temp user, then insert fresh
  await supabase.from('phone_verifications').delete().eq('user_temp_id', tempId);
  const { error: insErr } = await supabase.from('phone_verifications').insert({
    user_temp_id: tempId,
    phone,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });
  if (insErr) return { ok: false, error: 'store_failed' } as const;

  revalidatePath('/onboarding/phone');
  return { ok: true } as const;
}

const otpSchema = z.object({ code: z.string().length(6) });

export async function verifyOtp(prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;
  const supabase = getServiceRoleClient();
  if (!supabase) return { ok: false, error: 'server_misconfigured' } as const;

  const parsed = otpSchema.safeParse({ code: formData.get('code') });
  if (!parsed.success) return { ok: false, error: 'invalid_code' } as const;
  const code = parsed.data.code;
  const otpHash = crypto.createHash('sha256').update(code).digest('hex');

  const { data: pv } = await supabase
    .from('phone_verifications')
    .select('otp_hash, expires_at')
    .eq('user_temp_id', tempId)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!pv) return { ok: false, error: 'not_sent' } as const;

  if (new Date(pv.expires_at).getTime() < Date.now()) return { ok: false, error: 'expired' } as const;
  if (pv.otp_hash !== otpHash) return { ok: false, error: 'mismatch' } as const;

  await supabase.from('phone_verifications').update({ verified_at: new Date().toISOString() }).eq('user_temp_id', tempId);
  await supabase.from('identity_verifications').update({ status: 'phone_verified' }).eq('user_temp_id', tempId);

  revalidatePath('/onboarding/names');
  return { ok: true } as const;
}


