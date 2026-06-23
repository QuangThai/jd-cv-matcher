# Atlas Match — Scoring & Matching

## MVP Score Levels

| Score Range | Match Level | Recommendation |
|---|---|---|
| 85–100 | Excellent Match | Strongly Recommend |
| 70–84 | Good Match | Recommend |
| 50–69 | Partial Match | Consider |
| 0–49 | Weak Match | Not Recommended |

## MVP Scoring Weights

| Category | Weight |
|---|---|
| Required skills match | 30% |
| Relevant work experience | 25% |
| Role responsibility match | 15% |
| Tools, technologies, or domain knowledge | 10% |
| Education and certifications | 10% |
| Soft skills, communication, and other preferences | 10% |

## Match Statuses

| Status | Meaning |
|---|---|
| matched | CV has explicit, direct evidence |
| partially_matched | CV has related but not exact evidence |
| missing | No evidence found in CV |
| not_applicable | Requirement does not apply |
| unclear | Evidence is ambiguous |

## Evidence Strength Labels

| Label | Meaning |
|---|---|
| verified | CV explicitly provides evidence |
| discussed | CV mentions related context but not strong direct evidence |
| not_found | CV does not mention the required item or alias |
| unclear | Cannot determine from available evidence |

## Scoring Rules

1. Verified match → full or near-full criterion points
2. Discussed / partial match → partial points only
3. Not found → zero points
4. Unclear → low or zero points depending on requirement priority
5. Missing must-have requirements should reduce total score significantly
6. Score is calculated by deterministic application logic where possible
7. LLM classifies match quality and provides evidence-based reasoning

## Score Breakdown Components

| Component | Description |
|---|---|
| requiredSkills | Score for must-have skills |
| relevantExperience | Score for work experience relevance |
| toolsAndPlatforms | Score for technical tools and platforms |
| seniorityAndYears | Score for seniority level and years of experience |
| domainKnowledge | Score for domain/industry knowledge |
| educationAndCertifications | Score for education and certifications |
| softSkillsAndLanguages | Score for soft skills and language requirements |
| total | Aggregate score (0–100) |
| explanation | Text explaining the score |

## Evidence Graph

The system models relationships between JD requirements and CV evidence as a graph:

- **Node types**: JDRequirementNode, CVEvidenceNode, CandidateNode, MatchResultNode
- **Edge types**: MATCHED, PARTIALLY_MATCHED, NOT_FOUND, SUPPORTED_BY, CONTRADICTED_BY, INSUFFICIENT_EVIDENCE
- **Benefit**: Enables transparent, explainable scoring

## Skill Alias Mapping

Controlled normalization for common variations:

```
React.js → React
NodeJS → Node.js
Postgres → PostgreSQL
K8s → Kubernetes
TailwindCSS → Tailwind CSS
```
