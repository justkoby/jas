import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./config";

/**
 * Supabase client for Server Components, Server Actions and
 * Route Handlers. Carries the visitor's session cookie and
 * respects Row Level Security.
 *
 * NOTE: reading cookies opts the calling route into dynamic
 * rendering. Use `createAnonClient()` for cacheable public
 * catalogue queries that need no session.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore when
          // middleware refreshes sessions.
        }
      },
    },
  });
}
