# US-001 CLI MVP — Core Matching Pipeline

## Status

planned

## Lane

normal

## Product Contract

The CLI tool (`cli/index.ts`) must accept a JD file or text, one or multiple CV files, extract structured data via OpenAI, perform evidence-based matching, and output JSON and Markdown reports. This validates the intelligence pipeline before the web UI is built.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/product/design-laws.md`
- `docs/product/scoring.md`
- `docs/product/architecture.md`

## Acceptance Criteria

1. CLI can parse JD files (PDF, DOCX, TXT) and extract text.
2. CLI can parse CV files (PDF, DOCX, TXT) and extract text.
3. CLI sends extracted text to OpenAI for structured JD extraction.
4. CLI sends extracted text to OpenAI for structured CV extraction.
5. CLI performs evidence-based matching between JD criteria and CV facts.
6. CLI calculates a deterministic score (0–100) with breakdown.
7. CLI generates a JSON report.
8. CLI generates a Markdown report.
9. CLI handles single CV and multiple CVs.
10. CLI does not invent candidate data (evidence-first enforcement).

## Design Notes

- **Commands**: `atlas-match analyze --jd <file> --cv <file>`
- **Queries**: OpenAI structured extraction calls
- **API**: Direct function calls (no HTTP server for CLI MVP)
- **Domain rules**:
  - Evidence-first: every score component must reference CV evidence
  - Deterministic scoring after LLM classification
  - Required skills weigh more than preferred
  - Partial match ≠ full match
- **UI surfaces**: None (CLI-only for this story)
- **Key modules**:
  - `cli/services/parse-document.ts` — file parsing
  - `cli/services/extract-jd.ts` — JD extraction via OpenAI
  - `cli/services/extract-cv.ts` — CV extraction via OpenAI
  - `cli/services/match.ts` — matching engine
  - `cli/services/report.ts` — JSON/MD report generation

## Validation

| Layer | Expected proof |
|---|---|
| Unit | Parse logic, scoring calculation, schema validation |
| Integration | OpenAI extraction calls (mock), full pipeline with sample files |
| E2E | Manual CLI run with real sample files |
| Platform | Windows execution verified |

## Harness Delta

- Create story record in harness DB
- Update test matrix with proof expectations
- Run `harness-cli trace` after implementation

## Evidence

Add commands and sample output after implementation.
