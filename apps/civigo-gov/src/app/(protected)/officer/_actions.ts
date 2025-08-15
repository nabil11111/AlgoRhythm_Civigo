"use server";

import { redirect } from "next/navigation";
import { getServerClient } from "@/utils/supabase/server";

export async function signOut() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}