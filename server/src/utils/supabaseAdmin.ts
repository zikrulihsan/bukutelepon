import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

// Lazy proxy — only throws when actually used
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    try {
      const client = getSupabaseAdmin();
      const value = (client as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") {
        return value.bind(client);
      }
      return value;
    } catch (err) {
      if (prop === "auth") {
        logger.warn("Supabase not configured — auth operations will fail");
        throw err;
      }
      throw err;
    }
  },
});
