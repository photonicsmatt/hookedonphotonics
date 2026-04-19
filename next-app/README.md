# Hooked on Photonics — webapp

Next.js 14 + Postgres + Prisma. Anonymous-with-work-email-verification discussion board.

## What's here

- **App Router** with server components for pages, route handlers for the API.
- **Prisma** schema covering `User`, `Channel`, `Thread`, `Comment`, `Vote`, `LoginCode`, `AllowedDomain`.
- **Auth**: passwordless 6-digit code emailed to a work address. We store only a peppered SHA-256 hash of the email — never the raw value. Session is an encrypted cookie via `iron-session`.
- **Domain allow-list**: personal providers (gmail/outlook/etc.) are blocked. A seed list of photonics-adjacent company domains is in `lib/domains.ts`. Anything else requires a row in `AllowedDomain`.
- **Same 90s aesthetic** as the static demo (VT323 + Space Grotesk, cream/magenta/teal).

## Quickstart

Requirements: Node 20+, a Postgres URL (Neon, Supabase, Railway, or local).

```bash
cd next-app
cp .env.example .env.local            # fill in DATABASE_URL, SESSION_SECRET, EMAIL_PEPPER
npm install
npx prisma db push                    # applies schema
npm run db:seed                       # seeds channels and allowed domains
npm run dev                           # http://localhost:3000
```

In dev without a `RESEND_API_KEY`, magic codes print to the server console instead of being emailed — the sign-in page will tell you.

## Files worth reading first

- `prisma/schema.prisma` — the data model.
- `lib/auth.ts` — email hashing, session, handle generation, domain gating.
- `app/api/auth/request/route.ts`, `.../verify/route.ts` — the login flow.
- `app/page.tsx` — server-rendered feed.

## What's intentionally missing (pick your next move)

- **Abuse handling.** Rate limits in routes are in-memory per-request heuristics (count queries). Move to Redis (Upstash) for real rate limits, IP-level throttles, and a short-term IP log.
- **Legal surface.** Terms of Service, Privacy Policy, DMCA agent page, subpoena policy. Not optional for a gossip site in the US.
- **Comment voting.** Thread voting is wired; comments have an `upvotes` column but no endpoint yet.
- **Email delivery infra.** Wire up Resend (already a dep), add SPF/DKIM/DMARC on your sending domain.
- **Observability.** Add Sentry + a structured logger.
- **Tests.** None yet — start with API-route tests for auth and voting.
- **Mod tooling extras.** Basic flag/remove/ban is wired (see below). Missing: automated word/regex filters, CAPTCHA on signup, appeals flow, per-channel mod assignments.

## Moderation

Any signed-in user can flag a thread or comment from the thread page. Flagged items land in `/mod` for users with `MOD` or `ADMIN` role, where a mod can:

- Remove / restore a thread or comment (reason is logged to `ModAction`).
- Dismiss a flag (clears the flag without touching content).
- Ban / unban the author. Banned users have their session destroyed on next request.
- (Admin only) promote a user to MOD or demote back to USER.

Removed content is replaced with a placeholder for regular users but visible to mods on the thread page and in the queue.

### Bootstrapping the first admin

There's no UI to self-promote. After you sign in for the first time, upgrade your role in SQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE handle = 'your_handle_here';
```

Once you're ADMIN, promote additional mods via `POST /api/mod/action` with `{ "kind": "PROMOTE_USER", "userId": "…" }`.

### Flag reasons

Hard-coded set (see `app/api/flag/route.ts`): `names_individual`, `defamatory`, `spam`, `off_topic`, `nsfw`, `insider_trading`, `other`. Extend there if you want more granularity.

## Deployment

Easiest path: Vercel + Neon.
1. Create a Neon Postgres, copy the connection string.
2. Import this repo into Vercel, set project root to `next-app/`.
3. Add env vars: `DATABASE_URL`, `SESSION_SECRET`, `EMAIL_PEPPER`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`.
4. Add a Postgres migration step to your build: `prisma migrate deploy && next build` (switch `db push` to real migrations before you have real users).

## Rotating secrets

- `EMAIL_PEPPER`: **do not rotate casually.** Rotating invalidates every existing `emailHash`, which means every user has to re-register with the same email. If you must rotate, dual-hash during a transition window.
- `SESSION_SECRET`: safe to rotate — just logs everyone out.
