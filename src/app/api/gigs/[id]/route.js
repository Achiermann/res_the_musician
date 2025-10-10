// src/app/api/gigs/[id]/route.js
export const runtime = 'nodejs';

import { json, err, allow } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { UpdateGigPayload } from '@/lib/validate';

// GET /api/gigs/[id]
export async function GET(_req, { params }) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('concerts')
    .select('id,act,date,venue,location,comments,status,created_at, start,end,url')
    .eq('id', params.id)
    .single();

  if (error) {
    return json(
      { error: 'DB error', code: error.code ?? null, message: error.message ?? null, details: error.details ?? null },
      error.code === 'PGRST116' ? 404 : 500
    );
  }

  return json(data);
}

// PATCH /api/gigs/[id]
export async function PATCH(req, { params }) {
  const deny = allow(['PATCH'])(req);
  if (deny) return deny;

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit({ key: `gigs:PATCH:${ip}`, max: 20, windowMs: 10_000 });
  if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });

  let body;
  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON', 400);
  }

  const parsed = UpdateGigPayload.safeParse(body);
  if (!parsed.success) {
    return err('Validation failed', 422, { issues: parsed.error.issues });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('concerts')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return json(
      { error: 'DB error', code: error.code ?? null, message: error.message ?? null, details: error.details ?? null },
      500
    );
  }

  return json(data);
}

// DELETE /api/gigs/[id]
export async function DELETE(req, { params }) {
  const deny = allow(['DELETE'])(req);
  if (deny) return deny;

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit({ key: `gigs:DELETE:${ip}`, max: 20, windowMs: 10_000 });
  if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('concerts')
    .delete()
    .eq('id', params.id);

  if (error) {
    return json(
      { error: 'DB error', code: error.code ?? null, message: error.message ?? null, details: error.details ?? null },
      500
    );
  }

  return new Response(null, { status: 204 });
}
