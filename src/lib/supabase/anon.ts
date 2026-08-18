import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "./config";

/**
 * Stateless, session-less Supabase client for public catalogue
 * reads on the server. Using it keeps storefront pages eligible
 * for static/ISR caching because no cookies are touched.
 *
 * Only suitable for data that anon users are allowed to read
 * (RLS still applies): active products, categories, delivery
 * methods.
 */
export function createAnonClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
