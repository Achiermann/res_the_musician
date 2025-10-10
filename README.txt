## Overview

This README explains how to CUSTOMIZE THE API (endpoints, validation, data flow) and how to SET UP THE DATABASE (schema, RLS policies, storage) for a reusable, secure Next.js (App Router) + Supabase setup. It’s generic—no app-specific tables—so you can drop in your own resource names and fields.

## Prerequisites
Node 18+
Next.js (App Router)
Supabase project (you’ll need URL + keys)
Git with .gitignore configured for env files

## Environment setup

@.env.local
"
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
server-only secret (no NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=
"
Never commit env files. Ensure .env.local is in .gitignore. Rotate keys if leaked or on teammate offboarding.

## Project structure (baseline, customizable)
"
@/app/api/resource/route.js # collection endpoint (GET, POST)
@/app/api/resource/[id]/route.js # item endpoint (GET, PATCH, DELETE)
@/lib/supabase/server.js # server client (reads httpOnly cookies)
@/lib/supabase/client.js # browser client (RLS-guarded)
@/lib/http.js # helpers: json(), err(), allow()
@/lib/validate.js # zod schemas for payloads
@/lib/rate-limit.js # simple in-memory rate limiting
@/README.txt # this file
"
Customize by duplicating resource to your domain (e.g., posts, orders). Keep helpers generic.

## Supabase clients (server + browser)
@/lib/supabase/server.js
"
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
export function getSupabaseServer() {
return createServerClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
{ cookies }
);
}
"
@/lib/supabase/client.js
"
import { createBrowserClient } from '@supabase/ssr';
export function getSupabaseBrowser() {
return createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
}
"
Server client handles httpOnly cookie sessions safely. Browser client should only perform RLS-safe reads/writes with minimal fields.

##HTTP helpers

@/lib/http.js
"
export function json(data, init = 200) {
return new Response(JSON.stringify(data), {
status: typeof init === 'number' ? init : (init.status ?? 200),
headers: { 'content-type': 'application/json', ...(init.headers || {}) },
});
}
export function err(message, status = 400, extra = {}) {
return json({ error: message, ...extra }, status);
}
export function allow(methods = []) {
return (req) => {
if (!methods.includes(req.method)) {
return new Response(null, { status: 405, headers: { 'Allow': methods.join(', ') } });
}
return null;
};
}
"

## Validation (customize payload contracts)

@/lib/validate.js
"
import { z } from 'zod';
export const CreatePayload = z.object({
// rename these to your domain fields
title: z.string().min(1).max(200),
description: z.string().max(1000).optional(),
});
export const UpdatePayload = CreatePayload.partial();
"
Adapt fields, constraints, and types to your resource. Reject extra fields if needed using zod options.

## Rate limiting (customize policy)
@/lib/rate-limit.js
"
const hits = new Map();
export function rateLimit({ key, windowMs = 10_000, max = 20 }) {
const now = Date.now();
const t = hits.get(key) || { count: 0, reset: now + windowMs };
if (now > t.reset) { t.count = 0; t.reset = now + windowMs; }
t.count += 1;
hits.set(key, t);
return { ok: t.count <= max, remaining: Math.max(0, max - t.count), reset: t.reset };
}
"
For production, swap this with a durable store (Redis, Upstash, Turnstile, etc.).

##API: collection route (customizable template)

@/app/api/resource/route.js
"
import { getSupabaseServer } from '@/lib/supabase/server';
import { json, err, allow } from '@/lib/http';
import { CreatePayload } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
const TABLE = 'your_table_name'; // customize
export async function GET(req) {
const deny = allow(['GET'])(req); if (deny) return deny;
const ip = req.headers.get('x-forwarded-for') || 'local';
const rl = rateLimit({ key: resource:GET:${ip}, max: 40, windowMs: 10_000 });
if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
const url = new URL(req.url);
const q = url.searchParams.get('q') || '';
let query = supabase
.from(TABLE)
.select('id,title,created_at') // customize columns (minimal)
.order('created_at', { ascending: false })
.limit(50);
if (q) query = query.ilike('title', %${q}%);
const { data, error } = await query;
if (error) return err('DB error', 500);
return json({ items: data });
}
export async function POST(req) {
const deny = allow(['POST'])(req); if (deny) return deny;
const ip = req.headers.get('x-forwarded-for') || 'local';
const rl = rateLimit({ key: resource:POST:${ip}, max: 10, windowMs: 10_000 });
if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
let body; try { body = await req.json(); } catch { return err('Invalid JSON'); }
const parsed = CreatePayload.safeParse(body);
if (!parsed.success) return err('Validation failed', 422, { issues: parsed.error.issues });
const payload = { ...parsed.data, owner_id: user.id }; // keep ownership server-side
const { data, error } = await supabase
.from(TABLE)
.insert(payload)
.select()
.single();
if (error) return err('DB error', 500);
return json(data, 201);
}
"
Customize: rename TABLE, columns in select, filter behavior, and payload mapping.

##API: item route (customizable template)

@/app/api/resource/[id]/route.js
"
import { getSupabaseServer } from '@/lib/supabase/server';
import { json, err, allow } from '@/lib/http';
import { UpdatePayload } from '@/lib/validate';
const TABLE = 'your_table_name'; // customize
export async function GET(_req, { params }) {
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
const { data, error } = await supabase
.from(TABLE)
.select('*') // optionally minimize columns
.eq('id', params.id)
.single();
if (error) return err('Not found', 404);
return json(data);
}
export async function PATCH(req, { params }) {
const deny = allow(['PATCH'])(req); if (deny) return deny;
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
let body; try { body = await req.json(); } catch { return err('Invalid JSON'); }
const parsed = UpdatePayload.safeParse(body);
if (!parsed.success) return err('Validation failed', 422, { issues: parsed.error.issues });
const { data, error } = await supabase
.from(TABLE)
.update(parsed.data)
.eq('id', params.id)
.select()
.single();
if (error) return err('Forbidden or not found', 403);
return json(data);
}
export async function DELETE(_req, { params }) {
const deny = allow(['DELETE'])(req); if (deny) return deny;
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
const { error } = await supabase.from(TABLE).delete().eq('id', params.id);
if (error) return err('Forbidden or not found', 403);
return new Response(null, { status: 204 });
}
"
Authorization is enforced by RLS; server checks are additional defense-in-depth.

##Database setup (tables, constraints, RLS)

@Supabase SQL (run in SQL editor)
"
-- 1) enable once per project
create extension if not exists "pgcrypto";
-- 2) create your primary table (rename to your needs)
create table public.your_table_name (
id uuid primary key default gen_random_uuid(),
owner_id uuid not null references auth.users(id) on delete cascade,
title text not null check (char_length(title) <= 200),
description text,
created_at timestamptz not null default now()
);
-- 3) enable RLS
alter table public.your_table_name enable row level security;
-- 4) least-privilege policies
create policy your_table_select_own
on public.your_table_name for select
to authenticated using (owner_id = auth.uid());
create policy your_table_insert_self
on public.your_table_name for insert
to authenticated with check (owner_id = auth.uid());
create policy your_table_update_own
on public.your_table_name for update
to authenticated using (owner_id = auth.uid())
with check (owner_id = auth.uid());
create policy your_table_delete_own
on public.your_table_name for delete
to authenticated using (owner_id = auth.uid());
"
Adjust table name, fields, and constraints. Keep RLS enabled; add more policies (e.g., shared read) as needed.
##Storage setup (optional files)
@Supabase Storage Policies (example: private per-user)
"
-- bucket must exist: 'private_files'
create policy files_read_own
on storage.objects for select to authenticated
using (bucket_id = 'private_files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy files_write_own
on storage.objects for insert to authenticated
with check (bucket_id = 'private_files' and (storage.foldername(name))[1] = auth.uid()::text);
"
Prefer private buckets. Sign URLs server-side for temporary access. Use path prefixing with the user’s id.
##Customizing the API (fields, filters, pagination)
Rename resource + TABLE to your model.
Columns: request only what the UI needs (avoid *).
Filters: add optional ?q, ?from, ?to, ?cursor in GET; validate and sanitize server-side.
Pagination: add .range(offset, offset+limit-1) and return { items, nextCursor }.
Sorting: whitelist sortable fields; disallow arbitrary column names from clients.
Ownership: set owner_id on the server (never trust client-sent owner ids).
Business rules: enforce in server route (pre-check), and in RLS (hard check).
##Dataflow (secure default)
"
UI validates form minimally.
Client sends HTTPS request to /api/resource (no tokens in localStorage).
Route reads httpOnly cookies → getSupabaseServer().
Rate limit, validate with zod, enforce business rules.
Supabase forwards JWT; Postgres evaluates RLS.
Constraints, FKs, triggers run; row is written.
Server returns minimal JSON; UI updates.
"
Prefer server-mediated mutations. Allow direct client reads only with tight RLS and minimal columns.

##Testing & verification

"
Anonymous request → expect 401.
Authenticated user A → can only see/update their rows.
Authenticated user B → cannot access A’s rows.
Temporarily remove a policy → verify deny-by-default.
Inspect policies:
SELECT * FROM pg_policies WHERE schemaname IN ('public');
"
Test failure paths (422 validation, 403 RLS) as much as success cases.

##Security checklist (musts)

"
Use HTTPS and httpOnly, secure cookies.
Keep secrets server-side; never NEXT_PUBLIC_ on sensitive keys.
Enable RLS on every exposed table; least-privilege policies.
Validate all inputs at the server boundary (zod).
Minimal column selection; avoid oversharing data.
Rate limit public endpoints.
Private storage buckets; sign URLs server-side.
Avoid logging tokens and PII; scrub logs.
"
Do not disable RLS to “make it work”. Do not store JWTs in localStorage (XSS).

##Deployment notes
"
Set env vars in your host dashboard (no .env upload).
Separate environments: dev/stage/prod with distinct keys.
Rotate keys on leaks or team changes; redeploy after.
Prefer server components/server actions for admin surfaces.
"

Keep admin operations on the server; send only the minimum needed data to the client.