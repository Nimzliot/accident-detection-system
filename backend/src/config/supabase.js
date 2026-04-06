import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let supabase;

export const getSupabaseAdmin = () => {
  if (!supabase) {
    supabase = createClient(env.supabaseUrl, env.supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabase;
};
