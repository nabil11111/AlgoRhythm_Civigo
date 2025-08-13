'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const passwordSchema = z.object({ password: z.string().min(8), confirm: z.string().min(8) })
  .refine((d) => d.password === d.confirm, { message: 'mismatch' });

export async function submitPassword(prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const cookieStore = await cookies();
  const tempId = cookieStore.get('onboarding_temp_id')?.value;
  if (!tempId) return { ok: false, error: 'no_session' } as const;

  const parsed = passwordSchema.safeParse({ password: formData.get('password'), confirm: formData.get('confirm') });
  if (!parsed.success) return { ok: false, error: 'invalid' } as const;

  // Store nothing sensitive in DB here; defer user creation to finalize step
  // We may rely on session-bound state only; nothing to persist.

  revalidatePath('/onboarding/nic-photos');
  return { ok: true } as const;
}


