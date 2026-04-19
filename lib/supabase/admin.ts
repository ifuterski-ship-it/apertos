import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasSupabaseAdminEnv = Boolean(supabaseUrl && supabaseServiceRoleKey);

export function createAdminClient() {
  if (!hasSupabaseAdminEnv) {
    throw new Error("Supabase admin client is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
