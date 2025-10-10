import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  // Prefer server-only var; fall back to NEXT_PUBLIC for compatibility
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[getSupabaseAdmin] missing envs', {
      urlPresent: !!url,
      keyPresent: !!key,
      cwd: process.cwd(),
    });
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key, { db: { schema: 'resresres' } });
}
