/**
 * Supabase browser client (for client-side operations)
 * Limited to safe reads guarded by RLS
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side operations
 * Use only for RLS-protected reads
 */
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { db: { schema: "resresres" } }
  );
}
