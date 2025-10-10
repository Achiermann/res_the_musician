// src/app/api/gigs/route.js
export const runtime = 'nodejs';

import { json, err, allow } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { CreateGigPayload } from '@/lib/validate';

// GET /api/gigs
export async function GET(req) {
  const deny = allow(['GET'])(req);
  if (deny) return deny;

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit({ key: `gigs:GET:${ip}`, max: 40, windowMs: 10_000 });
  if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });

  try {
    const supabase = getSupabaseAdmin();

    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const from = url.searchParams.get('from') || '';
    const to = url.searchParams.get('to') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    let query = supabase
      .from('concerts')
      .select('id,act,date,venue,location,comments,status,created_at,start,end,url', { count: 'exact' })
      .order('id', { ascending: true })
      .order('date', { ascending: true })
      .order('act', { ascending: true });

    if (q)      query = query.or(`act.ilike.%${q}%,location.ilike.%${q}%`);
    if (from)   query = query.gte('date', from);
    if (to)     query = query.lte('date', to);
    if (status) query = query.eq('status', status);

    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      return json({
        error: 'DB error',
        code: error.code ?? null,
        message: error.message ?? null,
        details: error.details ?? null,
        hint: error.hint ?? null,
      }, 500);
    }

    return json({ items: data, total: count || 0, page, pageSize });
  } catch (e) {
    return json({ error: 'Unhandled', message: String(e?.message || e) }, 500);
  }
}

// POST /api/gigs
export async function POST(req) {
  const deny = allow(['POST'])(req);
  if (deny) return deny;

  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit({ key: `gigs:POST:${ip}`, max: 10, windowMs: 10_000 });
  if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });

  try {
    const supabase = getSupabaseAdmin();

    let body;
    try {
      body = await req.json();
    } catch {
      return err('Invalid JSON', 400);
    }

    const parsed = CreateGigPayload.safeParse(body);
    if (!parsed.success) {
      return err('Validation failed', 422, { issues: parsed.error.issues });
    }

    const { data, error } = await supabase
      .from('concerts')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      return json({
        error: 'DB error',
        code: error.code ?? null,
        message: error.message ?? null,
        details: error.details ?? null,
        hint: error.hint ?? null,
      }, 500);
    }

    return json(data, 201);
  } catch (e) {
    return err(String(e?.message || e), 500);
  }
}
