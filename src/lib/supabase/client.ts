"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";

/**
 * Supabase client for browser ("use client") components.
 * Runs with the anon key and respects Row Level Security.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
