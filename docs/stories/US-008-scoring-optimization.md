# US-008 Scoring Optimization

## Status

planned

## Lane

normal

## Product Contract

Skill matching uses fuzzy string comparison (Levenshtein distance) to catch near-matches like "React.js" vs "React" or "Typescript" vs "TypeScript". Domain-specific keyword dictionaries are expanded for common tech stacks (cloud, backend, frontend, data, mobile, DevOps). Partial matching is more granular with keyword-level scoring.

## Relevant Product Docs

- `docs/product/scoring.md`

## Acceptance Criteria

- AC1: Levenshtein-based fuzzy matching for skill comparison (threshold 0.8 similarity).
- AC2: Expanded skill aliases for cloud (AWS, GCP, Azure), backend (Node.js, Python, Java, Go), frontend (React, Vue, Angular, Svelte).
- AC3: Partial match scores are proportional to overlap (e.g., 3/5 matched skills = 60%).
- AC4: Domain-specific keywords boost for relevant experience.
- AC5: All existing 71 unit tests still pass.

## Design Notes

- **fuzzyMatch(a, b, threshold?)**: Levenshtein distance → similarity ratio
- **expandAliases(skill)**: Check aliases AND fuzzy match against alias list
- **calculatePartialScore(matched, total)**: Returns 0-100 proportional score
- **Impact**: Updates `findAliasMatch` in normalize-text.ts, scoring in calculate-score.ts

## Harness Delta

None.
