# Hooked on Photonics — webapp

Next.js 14 + Postgres + Prisma. Anonymous, username+password discussion board.

## What's here

- **App Router** with server components for pages, route handlers for the API.
- **Prisma** schema covering `User`, `Channel`, `Thread`, `Comment`, `Vote`, `Flag`, `ModAction`.
- **Auth**: classic handle + password. Passwords hashed with bcrypt (cost 12). Session is an encrypted cookie via `iron-session`. No email, no recovery — this is by design.
- **Post types**: Text, Link, Image (Vercel Blob upload or direct URL paste).
- **Moderation**: flag → mod queue → remove/restore/ban with a full audit log.
- **90s aesthetic** preserved across all pages (VT323 + Space Grotesk, cream/magenta/teal).

## Quickstart

Requirements: Node 20+, a Postgres URL (Neon, Supabase, Railway, or local).

```bash
cd next-app
cp .env.example .env.local            # fill DATABASE_URL, SESSION_SECRET
npm install
npx prisma db push                    # applies schema
npm run db:seed                       # seeds channels
npm run dev                           # http://localhost:3000
```

## Files worth reading first

- `prisma/schema.prisma` — the data model.
- `lib/auth.ts` — session, password hashing, handle/password validation, role helpers.
- `app/api/auth/signup/route.ts`, `.../login/route.ts` — account creation + login.
- `app/page.tsx` — server-rendered feed.
- `app/submit/page.tsx` + `components/SubmitForm.tsx` — three-tab post composer.
- `app/mod/page.tsx` — moderation dashboard.

## Auth model

- **Handle**: 3–24 characters, `[a-z0-9_]`, lowercased server-side. Small reserved-name list blocks `admin`, `mod`, `anon`, etc.
- **Password**: ≥ 8 characters, ≤ 200. Stored as a bcrypt hash at cost 12.
- **No email**: there's no password reset. A lost password is a lost account.
- **Ban**: sets `bannedAt`. `currentUser()` destroys any session belonging to a banned user on the next request.
- **Login rate limits**: nothing in-app yet — lean on bcrypt cost and add Redis/Upstash before launch.

## Moderation

Any signed-in user can flag a thread or comment. Flagged items land in `/mod` for users with `MOD` or `ADMIN` role, where a mod can:

- Remove / restore a thread or comment (reason logged to `ModAction`).
- Dismiss a flag (clears the flag without touching content).
- Ban / unban the author.
- (Admin only) promote a user to MOD or demote back to USER.

Removed content is replaced with a placeholder for regular users but remains visible to mods on the thread page and in the queue.

### Bootstrapping the first admin

There's no UI to self-promote. After your first signup, upgrade your role in SQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE handle = 'your_handle';
```

Once you're ADMIN, promote additional mods via `POST /api/mod/action` with `{ "kind": "PROMOTE_USER", "userId": "…" }`.

### Flag reasons

Hard-coded set (see `app/api/flag/route.ts`): `names_individual`, `defamatory`, `spam`, `off_topic`, `nsfw`, `insider_trading`, `other`.

## What's intentionally missing (pick your next move)

- **Abuse handling.** Add Redis/Upstash for real per-IP and per-handle login rate limits. CAPTCHA on signup.
- **Legal surface.** Terms of Service, Privacy Policy, DMCA agent page, subpoena policy. Not optional for a gossip site in the US.
- **Comment voting.** Thread voting is wired; comments have an `upvotes` column but no endpoint yet.
- **Observability.** Add Sentry + a structured logger.
- **Tests.** None yet — start with API-route tests for signup/login and voting.
- **Mod tooling extras.** Automated word/regex filters, appeals flow, per-channel mod assignments.

## Deployment

Easiest path: Vercel + Neon.
1. Create a Neon Postgres, copy the connection string.
2. Import this repo into Vercel; set project root to `next-app/`.
3. Add env vars: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, plus `BLOB_READ_WRITE_TOKEN` if you want native image uploads.
4. Add a Postgres migration step to your build: `prisma migrate deploy && next build` (switch from `db push` to real migrations before you have real users).

## Rotating secrets

- `SESSION_SECRET`: safe to rotate — just logs everyone out.
- No email pepper any more. Password hashes are self-contained bcrypt values.
