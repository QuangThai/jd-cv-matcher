# Atlas Match — Architecture

## High-Level Architecture

```
User Browser
   |
   v
Next.js App Router Web App
   |
   |-- UI Layer
   |     |-- JD input (paste/upload)
   |     |-- File upload (single/multi CV)
   |     |-- Analysis progress
   |     |-- Result rendering
   |
   |-- API Layer
   |     |-- POST /api/analyze
   |
   |-- Document Processing Layer
   |     |-- File validation
   |     |-- Text extraction (pdf-parse, mammoth)
   |     |-- Text normalization
   |
   |-- LLM Analysis Layer
   |     |-- JD structured extraction
   |     |-- CV structured extraction
   |     |-- Evidence extraction
   |     |-- Matching and scoring
   |
   |-- Result Layer
   |     |-- Score breakdown
   |     |-- Ranking
   |     |-- Recruiter summary
   |
   v
OpenAI API
```

## Request Flow

1. User submits JD input and CV files.
2. Server validates file size, type, and count.
3. Server extracts text from JD.
4. Server extracts text from each CV separately.
5. Server normalizes extracted text.
6. LLM extracts structured JD criteria.
7. LLM extracts structured candidate profiles from each CV.
8. Matching engine compares JD criteria against each candidate profile.
9. Evidence graph is built from JD criteria, CV facts, and match relationships.
10. Score is calculated using weighted criteria.
11. Final report is generated.
12. UI renders overview, details, ranking, and final recommendation.

## Application Structure

```
src/
  app/
    page.tsx                    # Home / Matching workspace
    results/
      [analysisId]/
        page.tsx                # Results page
    api/
      analyze/
        route.ts                # POST /api/analyze
  components/
    jd-input.tsx
    jd-file-upload.tsx
    cv-multi-upload.tsx
    analysis-progress.tsx
    analysis-submit-button.tsx
    jd-summary-card.tsx
    candidate-overview-table.tsx
    match-score-badge.tsx
    match-level-badge.tsx
    recommendation-badge.tsx
    candidate-analysis-card.tsx
    evidence-snippet.tsx
    missing-requirement-list.tsx
    ranking-table.tsx
    final-recommendation-card.tsx
  lib/
    files/
      validate-file.ts
      extract-text.ts
      normalize-text.ts
    llm/
      openai-client.ts
      prompts.ts
      schemas.ts
      extract-jd.ts
      extract-cv.ts
      match-candidate.ts
    scoring/
      weights.ts
      calculate-score.ts
      match-level.ts
      recommendation.ts
    types/
      jd.ts
      cv.ts
      match.ts
  styles/
    globals.css
```

## Data Flow Boundaries

- Raw extracted text → Normalized text → Structured JD/CV data → Evidence snippets → Matching graph → Score → Final narrative
- Each boundary is a separate module for testability
- Client never sees OpenAI API keys, internal prompts, or raw model configuration

## File Handling Policy (MVP)

- Process files in memory or temporary server storage
- Do not persist CV files unless explicitly needed
- Delete temporary files after analysis
- Store only the final structured result if persistence is required later

## CLI Application Structure

```
cli/
  index.ts                    # CLI entrypoint
  commands/
    analyze.ts                # analyze command
  services/
    parse-document.ts         # document parsing
    extract-jd.ts             # JD extraction
    extract-cv.ts             # CV extraction
    match.ts                  # matching engine
    report.ts                 # report generation
  samples/
    jd/
    cvs/
  reports/
```

## Tech Stack

- **Frontend**: Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, React Hook Form, Zod
- **Backend**: Next.js Route Handlers, TypeScript, OpenAI API
- **CLI**: TypeScript (tsx/node)
- **Parsing**: pdf-parse, mammoth, file-type
- **Validation**: Zod schemas for LLM output validation
- **Storage (optional future)**: PostgreSQL + Prisma
