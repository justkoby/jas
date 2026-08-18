/**
 * Central Supabase environment configuration.
 *
 * `isSupabaseConfigured()` lets the app degrade gracefully to
 * local mock data when no Supabase project is wired up yet —
 * the storefront keeps working in either state.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith("http") &&
      !supabaseUrl.includes("your-project-ref")
  );
}

/** Builds the public CDN URL for a storage object. */
export function publicStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
