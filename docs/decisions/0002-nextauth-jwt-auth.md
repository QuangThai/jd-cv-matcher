# 0002 NextAuth Credentials + JWT Authentication

Date: 2026-06-23

## Status

Accepted

## Context

Phase 5 (Saved Analysis + Database) needed authentication to associate saved analyses with users. Requirements:
- Email/password sign-up and sign-in
- GitHub OAuth as a convenience option
- Session persistence across page reloads
- Must work with Next.js App Router (server components, API routes)
- Minimal external database schema complexity

NextAuth v5 (Auth.js) was chosen as the auth library.

## Decision

**Credentials provider** (email/password) as primary auth method, with **GitHub OAuth** as secondary. **JWT strategy** for session management instead of database sessions.

- Credentials: Simple email/password with bcrypt password hashing. No magic links, no password reset (future scope).
- GitHub OAuth: Quick sign-in for developers who already have GitHub accounts.
- JWT sessions: Token stored in an httpOnly cookie. No database lookup on every request. Simpler deployment.

User model in Prisma stores: id, name, email, hashedPassword, image. Account + Session tables exist but are unused with JWT strategy (required by NextAuth schema).

## Alternatives Considered

1. **Database sessions**: More secure (can revoke sessions server-side) but requires a DB query on every request. Overhead for a local-first tool.

2. **Magic link email auth**: Better UX but requires an email provider (SendGrid, Resend). Adds cost and setup complexity.

3. **NextAuth v4**: More mature but App Router support less polished than v5.

4. **Iron Session / next-iron-session**: Lower level, no OAuth support, no built-in providers.

## Consequences

Positive:
- Fast session validation (no DB query per request).
- Simple deployment — no session table maintenance.
- Credentials + OAuth covers both quick-start and convenience use cases.
- Password hashing via bcrypt (industry standard).

Tradeoffs:
- JWT sessions cannot be revoked server-side (token valid until expiry).
- No password reset flow yet (manual DB reset needed).
- No email verification on sign-up.

## Follow-Up

- Add password reset via email (requires email provider integration).
- Add rate limiting on sign-in attempts.
- Consider switching to database sessions if server-side revocation becomes critical.
