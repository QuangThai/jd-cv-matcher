# US-005 Saved Analysis + Database

## Status

planned

## Lane

high-risk

## Product Contract

Users can persist analysis results to a local database, browse their history, re-open past reports, delete old analyses, and compare two analyses side by side. Authentication ensures each user sees only their own analyses. The system uses Prisma ORM with SQLite as the embedded database for zero-config local persistence.

## Relevant Product Docs

- `docs/product/architecture.md`
- `docs/product/overview.md`

## Acceptance Criteria

- AC1: SQLite database initializes automatically on first use via Prisma migration.
- AC2: Analysis results are saved on completion (user can opt-in or auto-save).
- AC3: History page shows list of past analyses with date, job title, candidate count, top score.
- AC4: User can click a history item to re-view the full report.
- AC5: User can delete individual analysis entries.
- AC6: User can search/filter history by job title or date range.
- AC7: Comparison view shows two analyses side by side.
- AC8: Authentication via NextAuth.js with email/password or GitHub OAuth.
- AC9: Each user sees only their own analyses (row-level security).
- AC10: Loading, empty, and error states for all data-fetching views.

## Design Notes

- **Database**: SQLite via Prisma ORM
  - Table: `Analysis` — id, userId, jobTitle, candidateCount, topScore, matchLevel, report (JSON), createdAt, updatedAt
  - Table: `User` — id, name, email, emailVerified, image, createdAt
  - Table: `Account` / `Session` — NextAuth standard tables
- **API Endpoints**:
  - `GET /api/analyses` — list user's analyses (paginated, filterable)
  - `GET /api/analyses/[id]` — get single analysis
  - `DELETE /api/analyses/[id]` — delete analysis
  - `POST /api/analyses` — save current analysis
  - `POST /api/analyses/compare` — compare two analyses
- **UI Routes**:
  - `/history` — analysis history page
  - `/history/[id]` — re-view past report
  - `/history/compare?ids=a,b` — comparison view
- **Auth**: NextAuth.js v5 with credentials provider (email/password) + GitHub OAuth
- **Auto-save**: After analysis completes, show save prompt with option to name the analysis
- **Comparison**: Display two reports in a split view with score differences highlighted

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Prisma schema validation, API response formatting, comparison logic |
| Integration | All CRUD endpoints with test DB, auth middleware |
| E2E | Playwright: login, save analysis, browse history, re-open, delete, compare |
| Platform | — |
| Release | DB migration script tested on clean install |

## Harness Delta

- Decision record needed for DB choice (SQLite vs PostgreSQL vs file-based)
- Decision record needed for auth strategy (NextAuth vs Clerk vs custom)

## Evidence

To be added after implementation.
