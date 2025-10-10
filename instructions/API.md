ONLY follow the following instructions if explicitly told:

The following is your instructions to create the API environment. 
If a folder or file doesn`t exist, create it.

## Env (must haves)
@.env.local
"
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
server-only secrets (no NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=
"

Use httpOnly cookie-based sessions (via SSR helpers). Never expose server secrets with NEXT_PUBLIC_. Rotate keys after leaks or teammate offboarding.

## Project structure (minimal, reusable)
"
@/app/api/resource/route.js # collection endpoint (GET, POST)
@/app/api/resource/[id]/route.js # item endpoint (GET, PATCH, DELETE)
@/lib/supabase/server.js # server client (reads httpOnly cookies)
@/lib/supabase/client.js # browser client
@/lib/http.js # helpers: json(), err(), allow()
@/lib/validate.js # zod schemas (JS)
@/lib/rate-limit.js # simple in-memory limiter
@/README-API.md # this file (optional)
"

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

Server code uses httpOnly cookies and runs validations/authorization. Browser code is limited to safe reads guarded by RLS (least privilege).
##HTTP helpers (responses, errors, method-guard)

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

## Validation (generic schemas; adjust per resource)
@/lib/validate.js
"
import { z } from 'zod';
export const CreatePayload = z.object({
field_a: z.string().min(1),
field_b: z.string().optional(),
// add your minimal contract; keep it tight
});
export const UpdatePayload = CreatePayload.partial();
"

Validate at the server boundary. Reject unknown/extra fields or coerce intentionally.

## Rate limiting (simple, replace with durable store later)
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

## API: collection route (generic, RLS-first)
@/app/api/resource/route.js
"
import { getSupabaseServer } from '@/lib/supabase/server';
import { json, err, allow } from '@/lib/http';
import { CreatePayload } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';
export async function GET(req) {
const deny = allow(['GET'])(req); if (deny) return deny;
const ip = req.headers.get('x-forwarded-for') || 'local';
const rl = rateLimit({ key: resource:GET:${ip}, max: 40, windowMs: 10_000 });
if (!rl.ok) return err('Too many requests', 429, { reset: rl.reset });
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
// Minimal query; RLS controls visibility
const url = new URL(req.url);
const q = url.searchParams.get('q') || '';
let query = supabase
.from('table_name') // replace with your table
.select('id,field_a,created_at') // select minimal columns
.order('created_at', { ascending: false })
.limit(50);
if (q) query = query.ilike('field_a', %${q}%);
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
let body;
try { body = await req.json(); } catch { return err('Invalid JSON'); }
const parsed = CreatePayload.safeParse(body);
if (!parsed.success) return err('Validation failed', 422, { issues: parsed.error.issues });
// Ensure ownership server-side; RLS will double-check
const payload = { ...parsed.data, owner_id: user.id };
const { data, error } = await supabase
.from('table_name') // replace with your table
.insert(payload)
.select()
.single();
if (error) return err('DB error', 500);
return json(data, 201);
}
"

## API: item route (generic, RLS-first)
@/app/api/resource/[id]/route.js
"
import { getSupabaseServer } from '@/lib/supabase/server';
import { json, err, allow } from '@/lib/http';
import { UpdatePayload } from '@/lib/validate';
export async function GET(_req, { params }) {
const supabase = getSupabaseServer();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return err('Unauthorized', 401);
const { data, error } = await supabase
.from('table_name')
.select('*')
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
.from('table_name')
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
const { error } = await supabase.from('table_name').delete().eq('id', params.id);
if (error) return err('Forbidden or not found', 403);
return new Response(null, { status: 204 });
}
"

## Database must-haves (generic RLS + constraints)
"
-- enable once
create extension if not exists "pgcrypto";
-- example table (rename 'table_name' and fields)
create table public.table_name (
id uuid primary key default gen_random_uuid(),
owner_id uuid not null references auth.users(id) on delete cascade,
field_a text not null check (char_length(field_a) <= 200),
field_b text,
created_at timestamptz not null default now()
);

-- RLS on
alter table public.table_name enable row level security;
-- visibility: owner only (adapt as needed)
create policy table_select_own
on public.table_name for select
to authenticated using (owner_id = auth.uid());
create policy table_insert_self
on public.table_name for insert
to authenticated with check (owner_id = auth.uid());
create policy table_update_own
on public.table_name for update
to authenticated using (owner_id = auth.uid())
with check (owner_id = auth.uid());
create policy table_delete_own
on public.table_name for delete
to authenticated using (owner_id = auth.uid());
"

Enable RLS on any table accessible from the client. Keep columns minimal and constrained.

## Secure dataflow (default path)
"
UI collects input and performs basic client-side checks.
Client sends HTTPS request to /api/resource with JSON (no tokens in localStorage).
Route Handler:
reads httpOnly session cookies via getSupabaseServer()
rate-limits the request
validates body with zod
applies authorization/business rules
performs DB call (RLS enforces row access)
Postgres:
runs RLS, constraints, foreign keys, triggers
writes row, updates indexes
Server returns minimal JSON; UI updates state (optimistic optional).
"
Prefer server-mediated mutations. Allow client reads only when RLS fully protects the data and selected columns are minimal.

## Security musts (concise)
"
Use HTTPS and httpOnly, secure cookies.
Keep secrets server-side; no NEXT_PUBLIC_ on sensitive keys.
Enable RLS and write least-privilege policies.
Validate every input at the server boundary (zod).
Limit columns; avoid select('*') on client.
Consider rate limiting for public endpoints.
For files, use private buckets with storage policies; sign URLs server-side.
"
Don’t disable RLS to “make it work”. Don’t log tokens or sensitive payloads. Don’t store JWTs in localStorage (XSS risk).

## Testing & verification
"
Try anonymous requests: expect 401/403.
Try authenticated user A: can access only their rows.
Try user B: cannot access A’s rows.
Remove a policy: reads/writes should fail (deny-by-default).
Review pg_policies: SELECT * FROM pg_policies WHERE schemaname IN ('public');
"

## Deployment notes
"
Production env vars live in your host dashboard (e.g., Vercel Project Settings).
Do not commit .env.local; ensure it’s in .gitignore.
Rotate keys on leaks or role changes; redeploy after rotation.
Use separate projects/environments (dev/stage/prod) with distinct keys.
"