# US-003 Validate Core Pipeline — E2E Tests, Unit Tests, UX Polish

## Status

planned

## Lane

normal

## Product Contract

The core analysis pipeline is validated end-to-end with real OpenAI API calls, critical logic has automated unit tests, and the user interface handles errors gracefully with proper loading states and boundaries.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/product/scoring.md`
- `docs/product/architecture.md`

## Acceptance Criteria

1. **E2E Pipeline Validation**: CLI and web pipeline run successfully with sample JD + CV files through real OpenAI API
2. **Unit Tests**: Scoring engine, match level, recommendation, file validation, text normalization, and Zod schemas have passing unit tests
3. **Error Boundaries**: React error boundary catches rendering errors gracefully
4. **Loading Skeletons**: Results page shows skeleton placeholders while loading
5. **Edge Cases**: App handles empty JD, no CVs, unsupported files, extraction failures with clear error messages

## Design Notes

- **Test framework**: Vitest (fast, native ESM, compatible with Vite/Next.js)
- **Test structure**: `src/**/*.test.ts` co-located with source files
- **Error Boundary**: React component wrapping main content area
- **Skeleton**: Reusable `Skeleton` UI component
- **Key test targets**: `calculate-score.ts`, `match-level.ts`, `recommendation.ts`, `validate-file.ts`, `normalize-text.ts`, Zod schemas

## Validation

| Layer | Expected proof |
|---|---|
| Unit | All tests pass: `npx vitest run` |
| Integration | CLI output generates valid report |
| E2E | Web app produces results with real API |
| Platform | `npm run build` passes |

## Harness Delta

- Record trace after completion
- Update test matrix with proof flags
