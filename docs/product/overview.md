# Atlas Match — Product Overview

## Product Identity

- **Product name**: Atlas Match
- **Type**: Web-based JD & CV Matching Tool
- **Tagline**: Evidence-first candidate screening

## Problem

Recruiters and hiring managers need to review many CVs against a single Job Description. Manual screening is slow, inconsistent, and can miss important signals such as relevant experience, required tools, seniority, domain fit, or missing qualifications.

## Goal

Build a web application that helps recruiters quickly understand how suitable each candidate is for a role by:

- Accepting JD text input or uploaded JD files.
- Accepting single or multiple uploaded CV files.
- Extracting structured hiring requirements from the JD.
- Extracting structured candidate information from each CV.
- Matching CV evidence against JD requirements.
- Returning explainable match scores, strengths, gaps, concerns, and recommendations.
- Ranking candidates when multiple CVs are uploaded.

## Primary Users

- Recruiters
- HR teams
- Hiring managers
- Talent acquisition teams
- Small companies without a dedicated ATS screening workflow

## Key Principle

Evidence-first. Never invent candidate experience, skills, certifications, education, achievements, or qualifications. Every match, concern, and recommendation must be grounded in evidence found in the JD or CV.

## Core Use Cases

1. **Single JD + single CV match** — Paste or upload a JD, upload one CV, receive a detailed match report.
2. **Single JD + multiple CV comparison** — Upload one JD and multiple CVs, get ranked candidates.
3. **Paste JD text** — Paste JD directly into a text area instead of uploading a file.
4. **Upload JD file** — Upload JD in PDF, DOCX, or TXT format.
5. **Evidence review** — Understand why a candidate received a specific score with visible evidence snippets.
6. **Fast shortlist generation** — Upload many CVs, get ranked candidates with comparison table.

## Main Screens

1. **Home / Matching Workspace** — JD input (paste or upload), multi-CV upload, start analysis.
2. **Analysis Progress** — Shows parsing, extraction, and matching status per file.
3. **Results Page** — JD Summary, Candidate Overview, Detailed Analysis, Ranking, Final Recommendation.
4. **Candidate Detail View** — Score breakdown, matched/partial/missing requirements, evidence snippets.
5. **Comparison View** — Ranking table, score comparison, strengths and gaps comparison.

## Output Structure

```json
{
  "jdSummary": {},
  "candidateOverview": [],
  "candidateAnalyses": [],
  "candidateRanking": [],
  "finalRecommendation": {}
}
```

## Non-Goals (MVP)

- User authentication
- Team workspace
- ATS integration
- Saved candidate database
- Manual criteria editing
- Long-term file storage
- Interview scheduling
- Email outreach
- Background worker infrastructure

## Future Phases

- Phase 3: Better scoring and evidence graph viewer
- Phase 4: Ask Atlas conversational assistant
- Phase 5: Team and workflow features
