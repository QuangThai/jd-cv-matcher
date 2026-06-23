export type MatchStatus =
  | "matched"
  | "partially_matched"
  | "missing"
  | "not_applicable"
  | "unclear";

export type EvidenceStrength =
  | "verified"
  | "discussed"
  | "not_found"
  | "unclear";

export type MatchLevel =
  | "Excellent Match"
  | "Good Match"
  | "Partial Match"
  | "Weak Match";

export type Recommendation =
  | "Strongly Recommend"
  | "Recommend"
  | "Consider"
  | "Not Recommended";

export type Priority = "required" | "preferred" | "nice_to_have";

export type JDSummary = {
  jobTitle: string | null;
  seniorityLevel: string | null;
  yearsOfExperience: string | null;
  requiredSkillCount: number;
  preferredSkillCount: number;
  educationRequired: boolean;
  certificationRequired: boolean;
  summary: string;
};

export type CandidateOverview = {
  candidateId: string;
  candidateName: string | null;
  matchScore: number;
  matchLevel: MatchLevel;
  recommendation: Recommendation;
};

export type RequirementMatch = {
  requirement: string;
  category: string;
  priority: Priority;
  status: "matched" | "partially_matched";
  evidenceFromCV: string;
  explanation: string;
};

export type MissingRequirement = {
  requirement: string;
  category: string;
  priority: Priority;
  evidenceStatus: "Not found in CV" | "Unclear from CV evidence";
};

export type EvidenceSnippet = {
  source: "JD" | "CV";
  text: string;
  relatedRequirementId?: string;
};

export type ScoreBreakdown = {
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

export type CandidateAnalysis = {
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

export type CandidateRankingItem = {
  rank: number;
  candidateId: string;
  candidateName: string | null;
  matchScore: number;
  matchLevel: MatchLevel;
  recommendation: Recommendation;
  rationale: string;
};

export type FinalRecommendation = {
  topCandidateId: string | null;
  topCandidateName: string | null;
  topCandidateScore: number;
  totalCandidates: number;
  explanation: string;
  hiringAdvice: string;
};

export type MatchReport = {
  jdSummary: JDSummary;
  candidateOverview: CandidateOverview[];
  candidateAnalyses: CandidateAnalysis[];
  candidateRanking: CandidateRankingItem[];
  finalRecommendation: FinalRecommendation;
};

export type AnalyzeRequest = {
  jdText?: string;
  jdFilePath?: string;
  cvFilePaths: string[];
};

export type AnalyzeResponse = {
  analysisId: string;
  report: MatchReport;
};

// Evidence Graph types
export type EvidenceGraphNodeType =
  | "jd_requirement"
  | "cv_evidence"
  | "candidate"
  | "match_result";

export type EvidenceGraphEdgeType =
  | "MATCHED"
  | "PARTIALLY_MATCHED"
  | "NOT_FOUND"
  | "DISCUSSED"
  | "SUPPORTED_BY"
  | "CONTRADICTED_BY"
  | "INSUFFICIENT_EVIDENCE";

export type EvidenceGraphNode = {
  id: string;
  type: EvidenceGraphNodeType;
  label: string;
  data: Record<string, unknown>;
};

export type EvidenceGraphEdge = {
  from: string;
  to: string;
  type: EvidenceGraphEdgeType;
  confidence: "high" | "medium" | "low";
  explanation: string;
};

export type CandidateEvidenceGraph = {
  candidateId: string;
  jdRequirementNodes: EvidenceGraphNode[];
  cvEvidenceNodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  scoreBreakdown: ScoreBreakdown;
};
