# API Setup Complete ✓

## What's Been Created

### 1. Environment Configuration
- `.env.local.example` - Template for environment variables
- Copy to `.env.local` and add your Supabase credentials

### 2. Library Files (`src/lib/`)

#### `lib/http.js`
HTTP helper utilities:
- `json(data, status)` - JSON response helper
- `err(message, status, extra)` - Error response helper
- `allow(methods)` - Method guard (returns 405 if not allowed)

#### `lib/validate.js`
Zod validation schemas:
- `CreateEventPayload` - Validates event creation (name, date, time, location, participants)
- `UpdateEventPayload` - Validates event updates (all fields optional)
- Generic `CreatePayload` and `UpdatePayload` for other resources

#### `lib/rate-limit.js`
In-memory rate limiter:
- Simple key-based rate limiting
- Configurable window and max requests
- Returns `{ ok, remaining, reset }`

#### `lib/supabase/server.js`
Server-side Supabase client:
- Uses httpOnly cookies for auth
- For use in API routes only

#### `lib/supabase/client.js`
Browser-side Supabase client:
- For client-side reads only
- Protected by RLS

### 3. API Routes (`src/app/api/events/`)

#### `GET /api/events`
List events with pagination, search, and filters
- Query params: `q`, `from`, `to`, `page`, `pageSize`
- Returns: `{ items, total, page, pageSize }`
- Rate limit: 40 requests per 10 seconds

#### `POST /api/events`
Create new event
- Body: `{ name, date, time, location, participants? }`
- Returns: Created event (201)
- Rate limit: 10 requests per 10 seconds

#### `GET /api/events/[id]`
Get single event by ID
- Returns: Event object or 404

#### `PATCH /api/events/[id]`
Update event (partial updates allowed)
- Body: Any subset of event fields
- Returns: Updated event

#### `DELETE /api/events/[id]`
Delete event
- Returns: 204 No Content

## Database Setup Required

Create the `events` table in Supabase:

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Create events table
create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 200),
  date text not null,
  time text not null,
  location text not null check (char_length(location) <= 200),
  participants int check (participants >= 0),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- RLS Policies (owner-only access)
create policy events_select_own
  on public.events for select
  to authenticated using (owner_id = auth.uid());

create policy events_insert_self
  on public.events for insert
  to authenticated with check (owner_id = auth.uid());

create policy events_update_own
  on public.events for update
  to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy events_delete_own
  on public.events for delete
  to authenticated using (owner_id = auth.uid());
```

## Next Steps

1. **Add Supabase credentials** to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Run the SQL** above in your Supabase SQL Editor

3. **Test the API**:
   ```bash
   npm run dev
   ```

4. **Test endpoints** with curl or a REST client:
   ```bash
   # List events (requires auth)
   curl http://localhost:3000/api/events
   
   # Create event (requires auth)
   curl -X POST http://localhost:3000/api/events \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Event","date":"2025-01-15","time":"14:00","location":"HQ"}'
   ```

## Security Features

✓ httpOnly cookie-based sessions (no localStorage tokens)
✓ Rate limiting on all endpoints
✓ Server-side validation with Zod
✓ Row Level Security (RLS) enforced
✓ Owner-only access (users see/edit only their events)
✓ Server secrets never exposed (no NEXT_PUBLIC_ prefix)

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── events/
│   │       ├── route.js           # Collection endpoint
│   │       └── [id]/route.js      # Item endpoint
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── supabase/
│   │   ├── server.js              # Server client
│   │   └── client.js              # Browser client
│   ├── http.js                    # Response helpers
│   ├── validate.js                # Zod schemas
│   └── rate-limit.js              # Rate limiter
└── styles/
    ├── main.css                   # Global styles
    └── page.css                   # Page styles
```
