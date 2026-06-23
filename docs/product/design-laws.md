# Atlas Match — Design Laws

These laws govern all product decisions, scoring, and output behavior.

## Law 1 — Evidence First

Every match, weakness, concern, and recommendation must be supported by evidence from the uploaded CV or JD.
If a skill, qualification, or experience is not found in the CV, write: `Not found in CV`.

## Law 2 — Do Not Invent Candidate Data

The system must not infer or fabricate: candidate name, years of experience, past job titles, skills, certifications, education, projects, tools, achievements, domain experience.
If unclear: `Unclear from CV evidence`.

## Law 3 — JD Requirements Have Priority

Score must prioritize JD requirements over general candidate strengths. Impressive but unrelated experience should not inflate score.

## Law 4 — Required Skills Weigh More Than Preferred

Required criteria have higher scoring weight than preferred or nice-to-have criteria.

## Law 5 — Recent and Relevant Experience Weighs More

Recent experience directly matching the JD contributes more than older or loosely related experience.

## Law 6 — Scores Must Be Explainable

Every overall score must be supported by a score breakdown showing what contributed positively, what reduced the score, which required criteria were missing, and what evidence supports the recommendation.

## Law 7 — Partial Match Is Not Full Match

Related but not exact experience → partial match. E.g., JD requires AWS Lambda, CV mentions AWS EC2/S3 but not Lambda → partial AWS cloud experience, but Lambda not found.

## Law 8 — Professional Recruiter Tone

Output must be concise, objective, and useful for hiring decisions. Avoid overly casual language, exaggerated praise, or unsupported claims.

## Law 9 — Human Decision Support

Tool provides screening assistance. It should not claim to make final hiring decisions independently.

## Law 10 — Privacy by Design

CVs may contain personal data. Minimize unnecessary retention, avoid exposing candidate data outside the analysis workflow, delete temporary files after analysis.
