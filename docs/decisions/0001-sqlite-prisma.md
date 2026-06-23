# 0001 SQLite + Prisma 7 with libSQL Adapter

Date: 2026-06-23

## Status

Accepted

## Context

Phase 5 (Saved Analysis + Database) needed a database to persist analysis reports, user accounts, and sessions. Requirements:
- Zero-config local development (no external database server)
- Type-safe queries with auto-generated types
- Easy schema migrations
- Compatibility with Next.js App Router
- Must work in serverless/Edge environments later

Prisma 7 was chosen as the ORM. However, Prisma 7 removed built-in SQLite support and requires a driver adapter.

## Decision

Use SQLite via `@prisma/adapter-libsql` + `@libsql/client` (Turso's libSQL).

- SQLite: Local file-based database, zero config, perfect for single-user desktop-style usage.
- libSQL: Open-source fork of SQLite with better async support and a native Node.js binding.
- Prisma 7 + libSQL adapter: Type-safe queries, auto-generated client, familiar Prisma schema format.

The database file lives at `prisma/dev.db` and is gitignored. Schema at `prisma/schema.prisma`.
DB initialization and migration are handled automatically via `prisma.generate()` at first import.

## Alternatives Considered

1. **PostgreSQL via pg + Prisma**: Full-featured, production-ready, but requires a running PostgreSQL server. Overkill for a local-first tool. Could be added later as a production option.

2. **SQLite via better-sqlite3**: Simple and fast, but synchronous API. Prisma 7 dropped built-in SQLite support.

3. **Drizzle ORM with SQLite**: Lighter than Prisma but weaker type inference for complex queries and fewer migration features.

4. **Raw SQL via node:sqlite (Node 22+)**: No schema validation, no migrations, no type safety. Not suitable for a project with evolving schema.

## Consequences

Positive:
- Zero-config local setup — database auto-initializes on first use.
- Full Prisma ecosystem: migrations, type generation, studio.
- libSQL offers compatibility with Turso for future edge deployment.

Tradeoffs:
- Extra ~20 lines of boilerplate for adapter setup and path resolution.
- libSQL adapter adds one more dependency layer compared to built-in SQLite.
- 3-level relative path needed from `src/lib/db/` to reach `prisma/generated/`.
- Migration to PostgreSQL would require rewriting the Prisma provider and connection string.

## Follow-Up

- Consider adding a `DATABASE_URL` env var option for production PostgreSQL.
- Evaluate Turso/libSQL for edge deployment if serverless hosting is added.
