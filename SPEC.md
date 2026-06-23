# SPEC.md — Web-based JD & CV Matching Tool

## 1. Product summary

### Product name

**Atlas Match**

### One-line summary

Atlas Match is a web-based tool that compares one Job Description against one or multiple candidate CVs, extracts evidence-based matching criteria, scores each candidate, and produces recruiter-friendly recommendations.

### Problem

Recruiters and hiring managers often need to review many CVs against a single Job Description. Manual screening is slow, inconsistent, and can miss important signals such as relevant experience, required tools, seniority, domain fit, or missing qualifications.

### Goal

Build a web application that helps recruiters quickly understand how suitable each candidate is for a role by:

- Accepting JD text input or uploaded JD files.
- Accepting single or multiple uploaded CV files.
- Extracting structured hiring requirements from the JD.
- Extracting structured candidate information from each CV.
- Matching CV evidence against JD requirements.
- Returning explainable match scores, strengths, gaps, concerns, and recommendations.
- Ranking candidates when multiple CVs are uploaded.

### Primary users

- Recruiters
- HR teams
- Hiring managers
- Talent acquisition teams
- Small companies without a dedicated ATS screening workflow

### Key principle

The product must be **evidence-first**. It must never invent candidate experience, skills, certifications, education, achievements, or qualifications. Every match, concern, and recommendation must be grounded in evidence found in the JD or CV.

---

## 2. Core use cases

### Use case 1 — Single JD + single CV match

A recruiter pastes or uploads a Job Description, uploads one CV, and receives a detailed candidate match report.

Expected output:

- JD Summary
- Candidate name, if available
- Overall match score from 0 to 100
- Match level
- Recommendation
- Matched requirements
- Partially matched requirements
- Missing requirements
- Evidence from CV
- Weaknesses or concerns
- Recruiter summary

### Use case 2 — Single JD + multiple CV comparison

A recruiter uploads one JD and multiple CVs. The system analyzes each CV independently, then ranks candidates by match quality.

Expected output:

- JD Summary
- Candidate Match Overview table
- Detailed Candidate Analysis for each candidate
- Candidate Ranking
- Explanation of why the top candidate is strongest
- Final hiring recommendation

### Use case 3 — Paste JD text instead of uploading file

A recruiter pastes a JD directly into a text area and uploads CV files.

Expected behavior:

- JD text is normalized.
- Uploaded CVs are parsed separately.
- Matching pipeline works the same as file-based JD input.

### Use case 4 — Upload JD file instead of pasting text

A recruiter uploads a JD file in PDF, DOCX, TXT, or another supported document format.

Expected behavior:

- File content is extracted.
- Content is normalized.
- JD criteria are extracted into a structured schema.
- CV matching proceeds normally.

### Use case 5 — Evidence review

A recruiter wants to understand why a candidate received a certain score.

Expected behavior:

- Each scored criterion includes supporting evidence.
- Missing information is clearly marked as `Not found in CV`.
- The score breakdown is visible and explainable.

### Use case 6 — Fast shortlist generation

A recruiter uploads many CVs and wants to identify the strongest candidates quickly.

Expected behavior:

- Candidates are ranked from highest to lowest match score.
- Comparison table shows score, recommendation, strengths, and gaps.
- Top candidate rationale is highlighted.

---

## 3. Product Shape

### Product type

A web application built with **Next.js App Router**.

### Main screens

#### 1. Home / Matching Workspace

Primary workspace where the recruiter provides input and starts analysis.

Main elements:

- JD input mode selector:
  - Paste JD text
  - Upload JD file
- JD text area
- JD file uploader
- Multi-CV uploader
- File validation status
- Start analysis button
- Error and warning messages

#### 2. Analysis Progress State

Shown while the system extracts and analyzes documents.

Main elements:

- Uploaded file list
- Parsing status per file
- Extraction status
- Matching status
- Progress indicator
- Failure state for unsupported or unreadable files

#### 3. Results Page

Displays the structured matching output.

Sections:

1. JD Summary
2. Candidate Match Overview
3. Detailed Candidate Analysis
4. Candidate Ranking
5. Final Recommendation

#### 4. Candidate Detail View

Allows recruiters to inspect a single candidate in more detail.

Main elements:

- Score breakdown
- Matched requirements
- Partial matches
- Missing requirements
- Evidence snippets from CV
- Concerns
- Recruiter summary

#### 5. Comparison View

Available when multiple CVs are uploaded.

Main elements:

- Candidate ranking table
- Score comparison
- Key strengths comparison
- Key gaps comparison
- Recommendation comparison

### Output shape

The final output should be structured, recruiter-friendly, concise, and evidence-based.

Example top-level result structure:

```json
{
  "jdSummary": {},
  "candidateOverview": [],
  "candidateAnalyses": [],
  "candidateRanking": [],
  "finalRecommendation": {}
}
```

---

## 4. Design Laws

### Law 1 — Evidence first

Every match, weakness, concern, and recommendation must be supported by evidence from the uploaded CV or JD.

If a skill, qualification, or experience is not found in the CV, the system must write:

```text
Not found in CV
```

### Law 2 — Do not invent candidate data

The system must not infer or fabricate:

- Candidate name
- Years of experience
- Past job titles
- Skills
- Certifications
- Education
- Projects
- Tools
- Achievements
- Domain experience

If information is unclear, it should be marked as:

```text
Unclear from CV evidence
```

### Law 3 — JD requirements have priority

The score must prioritize JD requirements over general candidate strengths.

A candidate with impressive but unrelated experience should not receive a high score unless that experience directly matches the JD.

### Law 4 — Required skills weigh more than preferred skills

Required criteria should have higher scoring weight than preferred or nice-to-have criteria.

### Law 5 — Recent and relevant experience weighs more

Recent experience that directly matches the JD should contribute more than older or loosely related experience.

### Law 6 — Scores must be explainable

Every overall score must be supported by a score breakdown.

The system should explain:

- What contributed positively
- What reduced the score
- Which required criteria were missing
- Which evidence supports the final recommendation

### Law 7 — Partial match is not full match

A candidate who has related but not exact experience should be marked as a partial match.

Example:

- JD requires `AWS Lambda`.
- CV mentions `AWS EC2` and `AWS S3`, but not Lambda.
- Result: partial AWS cloud experience, but `AWS Lambda` is not found.

### Law 8 — Professional recruiter tone

Output must be concise, objective, and useful for hiring decisions.

Avoid overly casual language, exaggerated praise, or unsupported claims.

### Law 9 — Human decision support, not final hiring authority

The tool provides screening assistance. It should not claim to make final hiring decisions independently.

### Law 10 — Privacy by design

CVs may contain personal data. The application should minimize unnecessary retention and avoid exposing candidate data outside the analysis workflow.

---

## 5. Technical architecture

### High-level architecture

```text
User Browser
   |
   v
Next.js App Router Web App
   |
   |-- UI Layer
   |     |-- JD input
   |     |-- File upload
   |     |-- Analysis progress
   |     |-- Result rendering
   |
   |-- API Layer
   |     |-- /api/parse/jd
   |     |-- /api/parse/cv
   |     |-- /api/analyze
   |     |-- /api/match
   |
   |-- Document Processing Layer
   |     |-- File validation
   |     |-- Text extraction
   |     |-- Text normalization
   |     |-- Chunking
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

### Recommended request flow

```text
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
```

### Suggested application structure

```text
src/
  app/
    page.tsx
    results/
      page.tsx
    api/
      analyze/
        route.ts
      parse/
        jd/
          route.ts
        cv/
          route.ts
  components/
    jd-input.tsx
    file-uploader.tsx
    candidate-overview-table.tsx
    candidate-detail-card.tsx
    score-breakdown.tsx
    evidence-list.tsx
    ranking-table.tsx
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

### Data flow boundaries

The system should separate:

- Raw extracted text
- Normalized text
- Structured JD data
- Structured CV data
- Evidence snippets
- Matching graph
- Score calculation
- Final recruiter-facing narrative

This separation makes the system easier to debug, test, and improve.

### Server-side processing

Document parsing and OpenAI API calls should run server-side only.

Client-side should not expose:

- OpenAI API keys
- Internal prompts
- Raw model configuration
- Temporary processing logic

### File handling policy

MVP behavior:

- Process files temporarily in memory or temporary server storage.
- Do not persist CV files unless explicitly needed.
- Delete temporary files after analysis.
- Store only the final structured result if persistence is required later.

Future behavior:

- Optional saved analysis history.
- Optional team workspace.
- Optional candidate database.
- Optional ATS integration.

---

## 6. Tech stack

### Frontend

- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **React Hook Form** for form handling
- **Zod** for schema validation

### Backend

- **Next.js Route Handlers** for API endpoints
- **TypeScript** for backend logic
- **OpenAI API** for structured extraction and analysis
- **Zod schemas** for validating LLM output

### Document parsing

Recommended libraries:

- PDF parsing: `pdf-parse`, `pdfjs-dist`, or an external document parsing service if needed
- DOCX parsing: `mammoth`
- TXT parsing: native text decoding
- File type detection: `file-type`

Supported MVP file formats:

- PDF
- DOCX
- TXT

Possible future file formats:

- RTF
- ODT
- HTML
- Markdown

### Optional storage

MVP can run without a database if analysis history is not required.

If persistence is needed:

- **PostgreSQL** for analysis records
- **Prisma** as ORM
- **S3-compatible object storage** for temporary or persistent document storage

### Optional background processing

For large files or many CVs:

- Queue: BullMQ
- Cache: Redis
- Background workers: Node.js worker process

### LLM provider

Primary:

- OpenAI

Recommended model usage:

- A strong reasoning model for final matching and recommendations.
- A fast lower-cost model for initial extraction, normalization, or simple classification.

### Validation

- Zod schemas for all extracted objects
- Server-side file validation
- LLM output validation and retry strategy
- Strict evidence requirement checks before rendering final result

---

## 7. Struct extraction strategy

### Goal

Convert unstructured JD and CV text into reliable structured data before matching.

### Extraction stages

```text
Raw document
  -> Extracted text
  -> Normalized text
  -> Structured facts
  -> Evidence-linked facts
  -> Match-ready schema
```

### JD extraction schema

The JD extractor should return:

```ts
type JDExtract = {
  jobTitle: string | null;
  seniorityLevel: string | null;
  requiredSkills: Requirement[];
  preferredSkills: Requirement[];
  yearsOfExperience: {
    minimumYears: number | null;
    maximumYears: number | null;
    rawText: string | null;
  };
  technicalTools: Requirement[];
  platforms: Requirement[];
  domainKnowledge: Requirement[];
  educationRequirements: Requirement[];
  certifications: Requirement[];
  responsibilities: Requirement[];
  softSkills: Requirement[];
  languageRequirements: Requirement[];
  locationRequirements: Requirement[];
  workArrangement: string | null;
  mustHaveCriteria: Requirement[];
  niceToHaveCriteria: Requirement[];
};

type Requirement = {
  id: string;
  name: string;
  category: string;
  priority: "required" | "preferred" | "nice_to_have";
  evidenceFromJD: string;
  weight: number;
};
```

### CV extraction schema

Each CV should be parsed separately and return:

```ts
type CVExtract = {
  candidateName: string | null;
  email: string | null;
  phone: string | null;
  currentTitle: string | null;
  totalYearsOfExperience: number | null;
  skills: CVFact[];
  tools: CVFact[];
  platforms: CVFact[];
  workExperience: WorkExperience[];
  education: CVFact[];
  certifications: CVFact[];
  projects: CVFact[];
  achievements: CVFact[];
  languages: CVFact[];
  domainExperience: CVFact[];
};

type CVFact = {
  id: string;
  value: string;
  category: string;
  evidenceFromCV: string;
  confidence: "high" | "medium" | "low";
};

type WorkExperience = {
  company: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number | null;
  responsibilities: CVFact[];
  achievements: CVFact[];
  technologies: CVFact[];
};
```

### Normalization rules

The system should normalize:

- Whitespace
- Bullet points
- Broken PDF lines
- Duplicate headers or footers
- Unicode characters
- Skill aliases
- Case differences
- Common tool naming variations

Examples:

```text
React.js -> React
NodeJS -> Node.js
Postgres -> PostgreSQL
K8s -> Kubernetes
```

### Skill alias handling

The system should support controlled alias mapping.

Example:

```json
{
  "react.js": "React",
  "nodejs": "Node.js",
  "postgres": "PostgreSQL",
  "k8s": "Kubernetes",
  "tailwindcss": "Tailwind CSS"
}
```

Aliases should help matching, but they must not invent experience. If the CV does not mention the skill or a clear alias, it should not be counted as found.

### Extraction quality checks

After LLM extraction, validate that:

- Output matches the schema.
- Every extracted requirement has JD evidence.
- Every extracted candidate fact has CV evidence.
- Required fields are present or explicitly null.
- No field contains unsupported claims.

### Retry strategy

If LLM output fails validation:

1. Retry with schema repair prompt.
2. If still invalid, run a stricter extraction prompt.
3. If still invalid, return a user-visible parsing error.

---

## 8. From Evidence to Graph

### Goal

Represent the relationship between JD requirements and CV evidence as a graph so scoring and explanations are transparent.

### Graph concept

The system should model:

- JD requirement nodes
- CV evidence nodes
- Candidate profile nodes
- Match relationship edges
- Missing requirement markers

### Node types

```ts
type EvidenceGraphNode =
  | JDRequirementNode
  | CVEvidenceNode
  | CandidateNode
  | MatchResultNode;
```

### Edge types

```ts
type EvidenceGraphEdge = {
  from: string;
  to: string;
  type:
    | "MATCHED"
    | "PARTIALLY_MATCHED"
    | "NOT_FOUND"
    | "SUPPORTED_BY"
    | "CONTRADICTED_BY"
    | "INSUFFICIENT_EVIDENCE";
  confidence: "high" | "medium" | "low";
  explanation: string;
};
```

### Example graph relationship

```text
JD Requirement: React
   |
   |-- MATCHED, high confidence
   v
CV Evidence: "Built frontend dashboards using React and TypeScript"
```

### Match statuses

Each JD requirement should map to one of these statuses:

```ts
type MatchStatus =
  | "matched"
  | "partially_matched"
  | "missing"
  | "not_applicable"
  | "unclear";
```

### Evidence graph benefits

The evidence graph helps the product:

- Explain why a score was assigned.
- Avoid hallucinated matching.
- Show recruiter-friendly evidence snippets.
- Debug extraction and scoring issues.
- Support future Ask Atlas questions.

### Graph output for each candidate

```ts
type CandidateEvidenceGraph = {
  candidateId: string;
  jdRequirementNodes: JDRequirementNode[];
  cvEvidenceNodes: CVEvidenceNode[];
  edges: EvidenceGraphEdge[];
  scoreBreakdown: ScoreBreakdown;
};
```

---

## 9. Separate Discussed vs verified

### Goal

Clearly distinguish between claims that are directly verified by CV evidence and claims that are only loosely discussed or implied.

### Definitions

#### Verified

A criterion is verified when the CV explicitly provides evidence.

Example:

```text
JD requires: React
CV says: "Developed React components for an internal admin dashboard."
Result: Verified match
```

#### Discussed

A criterion is discussed when the CV mentions related context but does not provide strong direct evidence.

Example:

```text
JD requires: AWS Lambda
CV says: "Worked with AWS cloud services."
Result: Discussed / partial match, not verified
```

#### Not found

A criterion is not found when the CV does not mention the required item or a reliable alias.

Example:

```text
JD requires: Kubernetes
CV has no Kubernetes-related evidence.
Result: Not found in CV
```

### Output labels

Use these labels in detailed analysis:

```ts
type EvidenceStrength =
  | "verified"
  | "discussed"
  | "not_found"
  | "unclear";
```

### Scoring impact

Recommended scoring behavior:

- Verified match: full or near-full criterion points
- Discussed / partial match: partial points only
- Not found: zero points
- Unclear: low or zero points depending on requirement priority

### Evidence rule

The system must never upgrade `discussed` to `verified` unless the CV contains direct supporting evidence.

### UI representation

Candidate details should show:

- Verified matches
- Discussed / partial matches
- Missing requirements
- Evidence snippets
- Confidence level

---

## 10. Roadmap

### Phase 1 — CLI MVP

Goal:

Validate the extraction, matching, scoring, and reporting pipeline without building the full web UI first.

Features:

- Accept one JD file or text file.
- Accept one or multiple CV files.
- Extract text.
- Run structured JD extraction.
- Run structured CV extraction.
- Match each CV against the JD.
- Generate JSON and Markdown reports.

### Phase 2 — Website MVP

Goal:

Build the first usable web interface for recruiters.

Features:

- JD text input
- JD file upload
- Single/multiple CV upload
- Analysis progress state
- Candidate overview table
- Detailed candidate analysis
- Candidate ranking
- Final recommendation

### Phase 3 — Better scoring and evidence graph

Goal:

Improve score reliability and transparency.

Features:

- Weight configuration
- Evidence graph viewer
- Requirement-level score breakdown
- Match confidence labels
- Better skill alias normalization

### Phase 4 — Ask Atlas

Goal:

Allow recruiters to ask follow-up questions about candidates and JD fit.

Features:

- Ask natural language questions about the analysis
- Answer only from JD and CV evidence
- Cite evidence snippets
- Compare candidates conversationally

### Phase 5 — Team and workflow features

Goal:

Support real recruiting workflows.

Features:

- Saved analyses
- User accounts
- Team workspace
- Export to PDF or DOCX
- Shareable reports
- ATS integration

---

## 11. CLI MVP

### Purpose

The CLI MVP is used to validate the backend intelligence before investing in the full UI.

### CLI command examples

Analyze one CV:

```bash
atlas-match analyze \
  --jd ./samples/jd/frontend-engineer.pdf \
  --cv ./samples/cv/jane-doe.pdf \
  --out ./reports/jane-doe-match.md
```

Analyze multiple CVs:

```bash
atlas-match analyze \
  --jd ./samples/jd/backend-engineer.docx \
  --cv-dir ./samples/cvs \
  --out ./reports/backend-candidate-ranking.md
```

Return JSON:

```bash
atlas-match analyze \
  --jd ./samples/jd/product-manager.txt \
  --cv-dir ./samples/cvs \
  --format json \
  --out ./reports/result.json
```

### CLI MVP input

Supported input:

- JD file: PDF, DOCX, TXT
- CV file: PDF, DOCX, TXT
- CV directory for batch analysis

### CLI MVP output

Supported output:

- Markdown report
- JSON report

### CLI MVP success criteria

The CLI MVP is successful when it can:

- Parse JD and CV files.
- Extract structured JD criteria.
- Extract structured CV facts.
- Produce evidence-based matching results.
- Rank multiple candidates.
- Generate an explainable score.
- Avoid invented candidate data.

### Suggested CLI folder structure

```text
cli/
  index.ts
  commands/
    analyze.ts
  services/
    parse-document.ts
    extract-jd.ts
    extract-cv.ts
    match.ts
    report.ts
  samples/
    jd/
    cvs/
  reports/
```

---

## 12. Webiste MVP

> Note: This section name intentionally keeps the requested spelling `Webiste MVP`. It refers to the Website MVP.

### Purpose

The Website MVP provides a usable recruiter-facing interface for JD and CV matching.

### MVP pages

#### Page 1 — Matching workspace

Route:

```text
/
```

Main features:

- Paste JD text
- Upload JD file
- Upload one or multiple CVs
- Show accepted file formats
- Validate file size and file type
- Start analysis

#### Page 2 — Results

Route:

```text
/results/[analysisId]
```

Main features:

- JD Summary
- Candidate Match Overview
- Detailed Candidate Analysis
- Candidate Ranking
- Final Recommendation

### MVP UI components

```text
components/
  jd-input.tsx
  jd-file-upload.tsx
  cv-multi-upload.tsx
  analysis-submit-button.tsx
  analysis-progress.tsx
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
```

### MVP user flow

```text
1. Recruiter opens the app.
2. Recruiter pastes JD text or uploads a JD file.
3. Recruiter uploads one or multiple CV files.
4. Recruiter clicks Analyze.
5. App validates inputs.
6. App extracts document text.
7. App runs JD and CV structured extraction.
8. App runs matching and scoring.
9. App shows results.
10. Recruiter reviews ranking and detailed candidate evidence.
```

### MVP constraints

- No login required.
- No permanent file storage required.
- No ATS integration.
- No manual score editing.
- No advanced candidate database.
- No team collaboration.

### MVP success criteria

The Website MVP is successful when a recruiter can:

- Input one JD.
- Upload multiple CVs.
- Receive ranked results.
- Understand each score.
- See direct CV evidence.
- Identify missing criteria quickly.
- Make a shortlist decision faster.

---

## 13. Ask Atlas

### Summary

Ask Atlas is a future conversational assistant inside the product. It allows recruiters to ask follow-up questions about the JD, candidates, evidence, and rankings.

### Example questions

Recruiters can ask:

```text
Why is Candidate A ranked higher than Candidate B?
```

```text
Which candidates have verified React experience?
```

```text
Who has the strongest domain experience for fintech?
```

```text
Which required skills are missing from this candidate?
```

```text
Does this candidate meet the education requirement?
```

```text
Show evidence that this candidate has team leadership experience.
```

### Ask Atlas rules

Ask Atlas must:

- Answer only using JD and CV evidence.
- Cite the evidence snippets used.
- Clearly mark missing information as `Not found in CV`.
- Avoid general assumptions about candidates.
- Avoid making hiring claims unsupported by evidence.
- Respect the difference between verified and discussed evidence.

### Ask Atlas data source

Ask Atlas should use:

- Structured JD extraction
- Structured CV extraction
- Evidence graph
- Candidate ranking result
- Score breakdown

### Ask Atlas answer shape

```ts
type AskAtlasAnswer = {
  answer: string;
  evidence: EvidenceSnippet[];
  confidence: "high" | "medium" | "low";
  limitations: string[];
};
```

### Example answer behavior

Question:

```text
Does Candidate B have Kubernetes experience?
```

Correct answer if Kubernetes is missing:

```text
Kubernetes experience was not found in Candidate B's CV. The CV mentions Docker and AWS, but there is no direct evidence of Kubernetes usage.
```

Incorrect answer:

```text
Candidate B likely has Kubernetes experience because they worked with cloud infrastructure.
```

---

## 14. Main Risk

### Risk 1 — Hallucinated candidate qualifications

The biggest risk is the model inventing skills or experience that are not in the CV.

Mitigation:

- Require evidence snippets for every extracted CV fact.
- Validate outputs with schemas.
- Add post-processing checks.
- Display `Not found in CV` when evidence is missing.

### Risk 2 — Poor PDF extraction quality

PDF CVs may have columns, tables, icons, and unusual layouts that break text extraction.

Mitigation:

- Use robust PDF parsing.
- Add fallback extraction strategy.
- Warn users when extracted text quality is low.
- Consider OCR support in future versions.

### Risk 3 — Inconsistent scoring

LLM-generated scores may vary across runs.

Mitigation:

- Use deterministic scoring logic outside the LLM where possible.
- Let LLM classify match status and evidence.
- Calculate numeric scores in code using fixed weights.
- Keep model temperature low.

### Risk 4 — Overweighting generic strengths

A strong candidate may receive an inflated score because of impressive but irrelevant background.

Mitigation:

- Score only against JD criteria.
- Prioritize required criteria.
- Penalize missing must-have requirements.

### Risk 5 — Data privacy

CVs contain personal information.

Mitigation:

- Avoid unnecessary storage.
- Process server-side.
- Delete temporary files after analysis.
- Add privacy notice.
- Avoid sending files to unnecessary third-party services.

### Risk 6 — Bias in recommendations

Recruiting tools can accidentally reinforce bias.

Mitigation:

- Focus matching on job-relevant evidence.
- Avoid demographic inference.
- Do not evaluate protected characteristics.
- Keep recommendations evidence-based.

### Risk 7 — Token limits and large documents

Large CV batches may exceed model context limits.

Mitigation:

- Chunk documents.
- Extract structured facts first.
- Match against structured data instead of raw full text.
- Process CVs independently.

### Risk 8 — Ambiguous JD requirements

Some JDs are vague or overloaded.

Mitigation:

- Extract must-have and nice-to-have criteria separately.
- Mark ambiguous requirements clearly.
- Allow future manual adjustment of JD criteria.

---

## 15. Research

### Research questions

#### Document parsing

- Which PDF parser gives the best quality for real CV layouts?
- How should the system detect bad extraction quality?
- Is OCR required for scanned CVs in the MVP?

#### Matching quality

- Which scoring weights produce the most recruiter-aligned results?
- Should score calculation be fully deterministic after extraction?
- How should partial matches be calibrated?

#### Skill normalization

- How large should the alias dictionary be in MVP?
- Should aliases be global, role-specific, or company-specific?
- How should the system handle skill families such as AWS, frontend, DevOps, or data engineering?

#### Recruiter usability

- Which output format helps recruiters make the fastest shortlist decision?
- Is a score enough, or should the UI emphasize gaps and evidence more?
- Should recruiters be able to edit JD criteria before matching?

#### Privacy and compliance

- How long should analysis data be retained?
- Should files be deleted immediately after analysis?
- What privacy notice is needed before upload?

#### Cost and performance

- What is the average cost per JD and CV batch?
- Can extraction use a lower-cost model while final reasoning uses a stronger model?
- How many CVs can be analyzed in parallel safely?

### Research experiments

#### Experiment 1 — Parser comparison

Test multiple PDF and DOCX parsers using real-world CV samples.

Metrics:

- Text completeness
- Formatting preservation
- Skill extraction accuracy
- Name and contact extraction accuracy

#### Experiment 2 — Scoring consistency

Run the same JD and CV set multiple times and compare scores.

Metrics:

- Score variance
- Match status consistency
- Recommendation consistency

#### Experiment 3 — Recruiter feedback

Ask recruiters to compare tool output with manual screening results.

Metrics:

- Ranking agreement
- False positives
- False negatives
- Usefulness of evidence snippets
- Time saved

#### Experiment 4 — Evidence graph validation

Check whether every generated claim can be traced back to JD or CV evidence.

Metrics:

- Unsupported claim rate
- Missing evidence rate
- Incorrect match rate

---

## 16. Decisions & open questions

### Decisions

#### Decision 1 — Framework

Use **Next.js App Router** as the main web application framework.

#### Decision 2 — UI stack

Use **Tailwind CSS v4** and **shadcn/ui** for the user interface.

#### Decision 3 — LLM provider

Use **OpenAI** as the primary LLM provider.

#### Decision 4 — Evidence-first analysis

Every candidate claim must be linked to CV evidence.

#### Decision 5 — Multiple CV support

The MVP must support uploading and analyzing multiple CVs in one run.

#### Decision 6 — JD input flexibility

The MVP must support both pasted JD text and uploaded JD files.

#### Decision 7 — Structured extraction before matching

The system should extract structured JD and CV facts before generating final recommendations.

#### Decision 8 — Deterministic score calculation preferred

The numeric match score should be calculated by application logic using fixed weights when possible, instead of relying entirely on the LLM.

### Open questions

#### Product questions

- Should recruiters be able to manually adjust JD criteria before matching?
- Should users be able to export reports as PDF or DOCX in the MVP?
- Should candidate reports be shareable by link?
- Should analysis history be saved?

#### Technical questions

- Which file size limit should be used for JD and CV uploads?
- How many CVs should be allowed per batch in MVP?
- Should analysis run synchronously or through a background queue?
- Should results be stored in a database or only kept in memory/session?

#### Scoring questions

- What exact weight should each requirement category receive?
- Should missing must-have requirements cap the maximum possible score?
- How should seniority mismatch affect the final score?
- How should years of experience be calculated from incomplete dates?

#### Privacy questions

- Should uploaded files be deleted immediately after processing?
- Should raw extracted text be stored?
- Should candidate contact information be masked in output?

---

## 17. Current MVP Definition

### MVP objective

Build a usable web-based JD and CV matching tool that allows recruiters to upload or paste a JD, upload one or multiple CVs, and receive evidence-based candidate match reports with ranking.

### MVP must-have features

#### Input

- Paste JD text.
- Upload JD file.
- Upload one CV.
- Upload multiple CVs.
- Support PDF, DOCX, and TXT for JD and CV files.
- Validate file type and file size.

#### Extraction

- Extract and normalize JD text.
- Extract and normalize CV text.
- Extract structured JD criteria.
- Extract structured candidate profile from each CV.
- Preserve evidence snippets.

#### Matching

- Match each candidate against JD criteria.
- Identify matched skills.
- Identify partially matched skills.
- Identify missing or weak requirements.
- Compare years of experience.
- Compare responsibilities.
- Compare tools and technologies.
- Compare education and certifications.
- Compare domain relevance.

#### Scoring

- Generate overall score from 0 to 100.
- Generate match level:
  - Excellent Match
  - Good Match
  - Partial Match
  - Weak Match
- Generate recommendation:
  - Strongly Recommend
  - Recommend
  - Consider
  - Not Recommended
- Provide score explanation.

#### Output

The output must include:

1. JD Summary
2. Candidate Match Overview
3. Detailed Candidate Analysis
4. Candidate Ranking
5. Final Recommendation

### MVP score levels

Recommended default mapping:

```text
85 - 100: Excellent Match
70 - 84: Good Match
50 - 69: Partial Match
0 - 49: Weak Match
```

### MVP recommendation mapping

```text
85 - 100: Strongly Recommend
70 - 84: Recommend
50 - 69: Consider
0 - 49: Not Recommended
```

### AI scoring logic prompt

This prompt should be used inside the tool during the AI scoring and recommendation stage after JD extraction and CV extraction are completed.

```text
You are an expert recruitment evaluator.

Your task is to compare a Job Description with one or multiple candidate CVs and determine how well each candidate matches the role.

Evaluate candidates based only on evidence available in the CV. Do not assume or invent missing information.

Scoring guideline:

* Required skills match: 30%
* Relevant work experience: 25%
* Role responsibility match: 15%
* Tools, technologies, or domain knowledge: 10%
* Education and certifications: 10%
* Soft skills, communication, and other preferences: 10%

For each candidate, provide:

1. Overall match score from 0 to 100

2. Match level:

   * 85–100: Excellent Match
   * 70–84: Good Match
   * 50–69: Partial Match
   * Below 50: Weak Match

3. Matched JD criteria

4. Partially matched JD criteria

5. Missing JD criteria

6. Evidence from CV

7. Main strengths

8. Main risks or concerns

9. Recruiter-friendly summary

10. Final recommendation

When comparing multiple candidates, rank them by overall match score and explain the ranking clearly.

Always keep the analysis objective, structured, and based on the JD requirements.
```

### MVP scoring weights

Initial scoring weight proposal:

```text
Required skills match: 30%
Relevant work experience: 25%
Role responsibility match: 15%
Tools, technologies, or domain knowledge: 10%
Education and certifications: 10%
Soft skills, communication, and other preferences: 10%
```

Implementation note:

- The LLM may classify match quality and produce evidence-based reasoning.
- The final numeric score should still be validated or calculated by deterministic application logic when possible.
- Each score component must be traceable to JD requirements and CV evidence.

### MVP output schema

```ts
type MatchReport = {
  jdSummary: JDSummary;
  candidateOverview: CandidateOverview[];
  candidateAnalyses: CandidateAnalysis[];
  candidateRanking: CandidateRankingItem[];
  finalRecommendation: FinalRecommendation;
};

type CandidateOverview = {
  candidateId: string;
  candidateName: string | null;
  matchScore: number;
  matchLevel: "Excellent Match" | "Good Match" | "Partial Match" | "Weak Match";
  recommendation:
    | "Strongly Recommend"
    | "Recommend"
    | "Consider"
    | "Not Recommended";
};

type CandidateAnalysis = {
  candidateId: string;
  candidateName: string | null;
  matchedRequirements: RequirementMatch[];
  partiallyMatchedRequirements: RequirementMatch[];
  missingRequirements: MissingRequirement[];
  strongEvidence: EvidenceSnippet[];
  weaknessesOrConcerns: string[];
  recruiterSummary: string;
  scoreBreakdown: ScoreBreakdown;
};

type RequirementMatch = {
  requirement: string;
  category: string;
  priority: "required" | "preferred" | "nice_to_have";
  status: "matched" | "partially_matched";
  evidenceFromCV: string;
  explanation: string;
};

type MissingRequirement = {
  requirement: string;
  category: string;
  priority: "required" | "preferred" | "nice_to_have";
  evidenceStatus: "Not found in CV" | "Unclear from CV evidence";
};

type EvidenceSnippet = {
  source: "JD" | "CV";
  text: string;
  relatedRequirementId?: string;
};

type ScoreBreakdown = {
  requiredSkills: number;
  relevantExperience: number;
  toolsAndPlatforms: number;
  seniorityAndYears: number;
  domainKnowledge: number;
  educationAndCertifications: number;
  softSkillsAndLanguages: number;
  total: number;
  explanation: string;
};
```

### MVP API endpoints

```text
POST /api/analyze
```

Purpose:

- Accept JD input and CV files.
- Run the full analysis pipeline.
- Return final match report.

Request shape:

```ts
type AnalyzeRequest = {
  jdText?: string;
  jdFile?: File;
  cvFiles: File[];
};
```

Response shape:

```ts
type AnalyzeResponse = {
  analysisId: string;
  report: MatchReport;
};
```

### MVP non-goals

The MVP will not include:

- User authentication
- Team workspace
- ATS integration
- Saved candidate database
- Manual editing of criteria
- Long-term file storage
- Interview scheduling
- Email outreach
- Background worker infrastructure unless required by file volume

### MVP acceptance criteria

The MVP is acceptable when:

- A recruiter can submit one JD and multiple CVs.
- The app returns ranked candidate results.
- Each candidate has a score, level, and recommendation.
- Each score has an explanation.
- Missing requirements are clearly marked.
- Candidate claims are backed by CV evidence.
- The system does not invent candidate information.
- The output is concise, professional, and recruiter-friendly.

### Final MVP principle

The MVP should optimize for **trustworthy screening**, not maximum automation. Recruiters should be able to quickly understand the reasoning, verify evidence, and make better shortlist decisions.
