import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

export function createRecoveryClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createSupabaseClient<Database>(url, anonKey, {
    auth: {
      detectSessionInUrl: true,
      flowType: "implicit",
      persistSession: true,
    },
  });
}
