# US-002 Better Scoring & Evidence Graph

## Status

planned

## Lane

normal

## Product Contract

Improve score reliability and transparency by adding weight configuration, an evidence graph viewer, requirement-level score breakdown, match confidence labels, and better skill alias normalization.

## Relevant Product Docs

- `docs/product/scoring.md`
- `docs/product/design-laws.md`
- `docs/product/overview.md`

## Acceptance Criteria

1. **Weight Configuration**: Users can view and understand the scoring weight breakdown per candidate.
2. **Evidence Graph Viewer**: A visual graph shows the relationship between JD requirements and CV evidence, with node types (JD requirement, CV evidence, match result) and edge types (MATCHED, PARTIALLY_MATCHED, NOT_FOUND, SUPPORTED_BY).
3. **Requirement-Level Score Breakdown**: Each requirement shows its individual score contribution, not just category-level scores.
4. **Match Confidence Labels**: Each match edge in the graph displays a confidence label (high/medium/low).
5. **Better Skill Alias Normalization**: Expanded alias dictionary and case-insensitive fuzzy matching to catch more skill variations without inventing evidence.

## Design Notes

- **Evidence Graph Component**: New React component that renders an interactive graph using a lightweight graph library or SVG-based approach.
- **New types**: `EvidenceGraphNode`, `EvidenceGraphEdge`, `CandidateEvidenceGraph` (already defined in `src/lib/types/match.ts`)
- **Enhance existing scoring**: Make `calculateScore` return per-requirement scoring instead of only category-level.
- **Alias expansion**: Add more industry-specific aliases to `src/lib/files/normalize-text.ts`.
- **No database changes**: Evidence graph is computed in-memory from structured extraction data.

## Validation

| Layer | Expected proof |
|---|---|
| Unit | Alias normalization tests, score breakdown tests, evidence graph builder tests |
| Integration | Evidence graph generation from JD + CV extraction data |
| E2E | Visual verification of graph component in browser |
| Platform | npm run build passes |

## Harness Delta

- Record intake for Phase 3 work.
- Update story proof matrix after implementation.
