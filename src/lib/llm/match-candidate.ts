import type { JDExtract } from "@/lib/types/jd";
import type { CVExtract } from "@/lib/types/cv";
import type {
  MatchReport,
  JDSummary,
  CandidateOverview,
  CandidateAnalysis,
  CandidateRankingItem,
  FinalRecommendation,
  RequirementMatch,
  MissingRequirement,
  EvidenceSnippet,
} from "@/lib/types/match";
import { calculateScore } from "@/lib/scoring/calculate-score";
import { getMatchLevel } from "@/lib/scoring/match-level";
import { getRecommendation } from "@/lib/scoring/recommendation";
import { findAliasMatch } from "@/lib/files/normalize-text";

function generateJDSummary(jd: JDExtract): JDSummary {
  return {
    jobTitle: jd.jobTitle,
    seniorityLevel: jd.seniorityLevel,
    yearsOfExperience: jd.yearsOfExperience.rawText,
    requiredSkillCount:
      jd.requiredSkills.length + jd.mustHaveCriteria.length,
    preferredSkillCount:
      jd.preferredSkills.length + jd.niceToHaveCriteria.length,
    educationRequired: jd.educationRequirements.length > 0,
    certificationRequired: jd.certifications.length > 0,
    summary: `This role requires ${jd.requiredSkills.length} core skills${jd.yearsOfExperience.rawText ? ` with ${jd.yearsOfExperience.rawText} of experience` : ""}${jd.educationRequirements.length > 0 ? ", specific education requirements," : ""} in the ${jd.seniorityLevel || "unspecified"} seniority range.`,
  };
}

function generateRequirementMatches(
  jd: JDExtract,
  cv: CVExtract
): {
  matched: RequirementMatch[];
  partiallyMatched: RequirementMatch[];
  missing: MissingRequirement[];
} {
  const allRequirements = [
    ...jd.requiredSkills.map((r) => ({ ...r, priority: "required" as const })),
    ...jd.preferredSkills.map((r) => ({
      ...r,
      priority: "preferred" as const,
    })),
    ...jd.mustHaveCriteria.map((r) => ({
      ...r,
      priority: "required" as const,
    })),
    ...jd.niceToHaveCriteria.map((r) => ({
      ...r,
      priority: "nice_to_have" as const,
    })),
  ];

  const matched: RequirementMatch[] = [];
  const partiallyMatched: RequirementMatch[] = [];
  const missing: MissingRequirement[] = [];

  const cvText = collectCVText(cv);

  for (const req of allRequirements) {
    const reqLower = req.name.toLowerCase();
    const foundInCV = findEvidence(cvText, reqLower);
    const partialEvidence = findPartialEvidence(cvText, reqLower);

    if (foundInCV) {
      matched.push({
        requirement: req.name,
        category: req.category,
        priority: req.priority,
        status: "matched",
        evidenceFromCV: foundInCV,
        explanation: `Found direct evidence of "${req.name}" in CV.`,
      });
    } else if (partialEvidence) {
      partiallyMatched.push({
        requirement: req.name,
        category: req.category,
        priority: req.priority,
        status: "partially_matched",
        evidenceFromCV: partialEvidence,
        explanation: `Related evidence found but not direct match for "${req.name}".`,
      });
    } else {
      missing.push({
        requirement: req.name,
        category: req.category,
        priority: req.priority,
        evidenceStatus: "Not found in CV",
      });
    }
  }

  return { matched, partiallyMatched, missing };
}

function collectCVText(cv: CVExtract): string {
  const parts: string[] = [];

  if (cv.candidateName) parts.push(cv.candidateName);
  if (cv.currentTitle) parts.push(cv.currentTitle);

  cv.skills.forEach((s) => parts.push(s.value, s.evidenceFromCV));
  cv.tools.forEach((t) => parts.push(t.value, t.evidenceFromCV));
  cv.platforms.forEach((p) => parts.push(p.value, p.evidenceFromCV));
  cv.workExperience.forEach((w) => {
    if (w.company) parts.push(w.company);
    if (w.title) parts.push(w.title);
    w.responsibilities.forEach((r) => parts.push(r.value, r.evidenceFromCV));
    w.technologies.forEach((t) => parts.push(t.value, t.evidenceFromCV));
  });
  cv.education.forEach((e) => parts.push(e.value, e.evidenceFromCV));
  cv.certifications.forEach((c) => parts.push(c.value, c.evidenceFromCV));
  cv.projects.forEach((p) => parts.push(p.value, p.evidenceFromCV));
  cv.achievements.forEach((a) => parts.push(a.value, a.evidenceFromCV));
  cv.languages.forEach((l) => parts.push(l.value, l.evidenceFromCV));
  cv.domainExperience.forEach((d) => parts.push(d.value, d.evidenceFromCV));

  return parts.join(" ").toLowerCase();
}

function findEvidence(cvText: string, requirement: string): string | null {
  const result = findAliasMatch(cvText, requirement);
  if (result) return result;

  // Direct match on derived forms
  const reqForm1 = requirement.replace(/[.\-\s]/g, "");
  const reqForm2 = requirement.replace(/[.\-]/g, " ");
  if (cvText.includes(reqForm1) || cvText.includes(reqForm2)) {
    return `CV contains direct reference to "${requirement}".`;
  }

  return null;
}

function findPartialEvidence(
  cvText: string,
  requirement: string
): string | null {
  const words = requirement.split(/\s+/);
  if (words.length <= 1) return null;

  const matchingWords = words.filter((w) => w.length > 3 && cvText.includes(w));
  if (matchingWords.length >= Math.ceil(words.length / 2)) {
    return `CV contains related terms: "${matchingWords.join(", ")}" but not exact match for "${requirement}".`;
  }

  return null;
}

function generateEvidenceSnippets(
  jd: JDExtract,
  cv: CVExtract
): EvidenceSnippet[] {
  const snippets: EvidenceSnippet[] = [];

  cv.skills.slice(0, 5).forEach((s) => {
    snippets.push({
      source: "CV",
      text: s.evidenceFromCV,
      relatedRequirementId: s.id,
    });
  });

  cv.workExperience.slice(0, 3).forEach((w) => {
    if (w.responsibilities.length > 0) {
      snippets.push({
        source: "CV",
        text: w.responsibilities[0]?.evidenceFromCV || w.responsibilities[0]?.value,
      });
    }
  });

  // Add JD evidence
  jd.requiredSkills.slice(0, 3).forEach((r) => {
    snippets.push({
      source: "JD",
      text: r.evidenceFromJD,
      relatedRequirementId: r.id,
    });
  });

  return snippets;
}

function generateConcerns(
  jd: JDExtract,
  cv: CVExtract,
  missing: MissingRequirement[]
): string[] {
  const concerns: string[] = [];

  const missingRequired = missing.filter((m) => m.priority === "required");
  if (missingRequired.length > 0) {
    concerns.push(
      `Missing ${missingRequired.length} required ${missingRequired.length === 1 ? "criterion" : "criteria"}: ${missingRequired.map((m) => m.requirement).join(", ")}`
    );
  }

  if (jd.yearsOfExperience.minimumYears && cv.totalYearsOfExperience) {
    if (cv.totalYearsOfExperience < jd.yearsOfExperience.minimumYears) {
      concerns.push(
        `Candidate has ${cv.totalYearsOfExperience} years of experience, below the required ${jd.yearsOfExperience.minimumYears} years.`
      );
    }
  } else if (jd.yearsOfExperience.minimumYears && !cv.totalYearsOfExperience) {
    concerns.push(
      "Candidate's total years of experience could not be determined from CV."
    );
  }

  return concerns;
}

function generateRecruiterSummary(
  jd: JDExtract,
  cv: CVExtract,
  score: { total: number; explanation: string },
  matchedCount: number,
  missingCount: number
): string {
  const name = cv.candidateName || "Candidate";
  const role = jd.jobTitle || "this role";

  if (score.total >= 85) {
    return `${name} is an excellent match for ${role}. Strong alignment with ${matchedCount} key requirements. ${score.explanation}`;
  } else if (score.total >= 70) {
    return `${name} is a good match for ${role}. Meets most core requirements with ${missingCount} gaps to review. ${score.explanation}`;
  } else if (score.total >= 50) {
    return `${name} is a partial match for ${role}. Has some relevant experience but missing ${missingCount} key criteria. Further review recommended.`;
  } else {
    return `${name} is a weak match for ${role}. Significant gaps in ${missingCount} requirement areas. Not recommended for this role based on available evidence.`;
  }
}

export async function matchCandidate(
  jd: JDExtract,
  cv: CVExtract,
  candidateIndex: number
): Promise<{
  overview: CandidateOverview;
  analysis: CandidateAnalysis;
}> {
  const score = calculateScore(jd, cv);
  const matchLevel = getMatchLevel(score.components.total);
  const recommendation = getRecommendation(score.components.total);

  const { matched, partiallyMatched, missing } = generateRequirementMatches(
    jd,
    cv
  );
  const evidence = generateEvidenceSnippets(jd, cv);
  const concerns = generateConcerns(jd, cv, missing);

  const candidateId = `candidate-${candidateIndex + 1}`;

  const overview: CandidateOverview = {
    candidateId,
    candidateName: cv.candidateName,
    matchScore: score.components.total,
    matchLevel,
    recommendation,
  };

  const analysis: CandidateAnalysis = {
    candidateId,
    candidateName: cv.candidateName,
    matchedRequirements: matched,
    partiallyMatchedRequirements: partiallyMatched,
    missingRequirements: missing,
    strongEvidence: evidence,
    weaknessesOrConcerns: concerns,
    recruiterSummary: generateRecruiterSummary(
      jd,
      cv,
      score.components,
      matched.length,
      missing.length
    ),
    scoreBreakdown: score.components,
  };

  return { overview, analysis };
}

export function buildReport(
  jd: JDExtract,
  cvExtracts: CVExtract[],
  results: Awaited<ReturnType<typeof matchCandidate>>[]
): MatchReport {
  const jdSummary = generateJDSummary(jd);

  const candidateOverview = results.map((r) => r.overview);
  const candidateAnalyses = results.map((r) => r.analysis);

  // Sort by score descending for ranking
  const sorted = [...results].sort(
    (a, b) => b.overview.matchScore - a.overview.matchScore
  );

  const candidateRanking: CandidateRankingItem[] = sorted.map((r, i) => ({
    rank: i + 1,
    candidateId: r.overview.candidateId,
    candidateName: r.overview.candidateName,
    matchScore: r.overview.matchScore,
    matchLevel: r.overview.matchLevel,
    recommendation: r.overview.recommendation,
    rationale: i === 0
      ? `Highest overall match score (${r.overview.matchScore}/100) with strongest alignment to JD requirements.`
      : `Match score of ${r.overview.matchScore}/100 with ${r.analysis.matchedRequirements.length} matched criteria.`,
  }));

  const topCandidate = sorted[0];
  const finalRecommendation: FinalRecommendation = {
    topCandidateId: topCandidate?.overview.candidateId || null,
    topCandidateName: topCandidate?.overview.candidateName || null,
    topCandidateScore: topCandidate?.overview.matchScore || 0,
    totalCandidates: results.length,
    explanation: topCandidate
      ? `${topCandidate.overview.candidateName || "Top candidate"} scores ${topCandidate.overview.matchScore}/100 with ${topCandidate.analysis.matchedRequirements.length} matched requirements. ${topCandidate.analysis.recruiterSummary}`
      : "No candidates were analyzed.",
    hiringAdvice:
      results.length === 0
        ? "No candidates provided for analysis."
        : topCandidate?.overview.matchScore && topCandidate.overview.matchScore >= 70
          ? "Recommended to proceed with interview screening for the top candidate(s)."
          : "Consider revising the JD or sourcing additional candidates.",
  };

  return {
    jdSummary,
    candidateOverview,
    candidateAnalyses,
    candidateRanking,
    finalRecommendation,
  };
}
