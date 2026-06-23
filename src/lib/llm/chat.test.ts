import { describe, it, expect } from "vitest";
import {
  buildChatSystemPrompt,
  buildChatMessages,
  getSuggestedQuestions,
  formatSSEData,
  formatSSEEnd,
  formatSSEError,
} from "../llm/chat";
import type { MatchReport } from "../types/match";

const mockReport: MatchReport = {
  jdSummary: {
    jobTitle: "Senior Frontend Engineer",
    seniorityLevel: "Senior",
    yearsOfExperience: "5",
    requiredSkillCount: 3,
    preferredSkillCount: 2,
    educationRequired: false,
    certificationRequired: false,
    summary: "We need a senior frontend engineer with React experience.",
  },
  candidateOverview: [
    {
      candidateId: "cand-1",
      candidateName: "Alice Smith",
      matchScore: 85,
      matchLevel: "Excellent Match",
      recommendation: "Strongly Recommend",
    },
    {
      candidateId: "cand-2",
      candidateName: "Bob Jones",
      matchScore: 62,
      matchLevel: "Partial Match",
      recommendation: "Consider",
    },
  ],
  candidateAnalyses: [
    {
      candidateId: "cand-1",
      candidateName: "Alice Smith",
      matchedRequirements: [
        {
          requirement: "React",
          category: "skill",
          priority: "required",
          status: "matched",
          evidenceFromCV: "5 years React experience",
          explanation: "Found React in work experience",
        },
      ],
      partiallyMatchedRequirements: [],
      missingRequirements: [],
      strongEvidence: [],
      weaknessesOrConcerns: [],
      recruiterSummary: "Alice is a strong frontend engineer with deep React knowledge.",
      scoreBreakdown: {
        requiredSkills: 90,
        relevantExperience: 85,
        toolsAndPlatforms: 80,
        seniorityAndYears: 85,
        domainKnowledge: 80,
        educationAndCertifications: 85,
        softSkillsAndLanguages: 80,
        total: 85,
        explanation: "Strong across all dimensions.",
      },
    },
    {
      candidateId: "cand-2",
      candidateName: "Bob Jones",
      matchedRequirements: [],
      partiallyMatchedRequirements: [],
      missingRequirements: [
        {
          requirement: "React",
          category: "skill",
          priority: "required",
          evidenceStatus: "Not found in CV",
        },
      ],
      strongEvidence: [],
      weaknessesOrConcerns: ["No React experience mentioned"],
      recruiterSummary: "Bob lacks the required React experience.",
      scoreBreakdown: {
        requiredSkills: 50,
        relevantExperience: 65,
        toolsAndPlatforms: 55,
        seniorityAndYears: 70,
        domainKnowledge: 60,
        educationAndCertifications: 65,
        softSkillsAndLanguages: 60,
        total: 62,
        explanation: "Missing key required skills.",
      },
    },
  ],
  candidateRanking: [
    {
      rank: 1,
      candidateId: "cand-1",
      candidateName: "Alice Smith",
      matchScore: 85,
      matchLevel: "Excellent Match",
      recommendation: "Strongly Recommend",
      rationale: "Strong React experience and senior-level expertise.",
    },
    {
      rank: 2,
      candidateId: "cand-2",
      candidateName: "Bob Jones",
      matchScore: 62,
      matchLevel: "Partial Match",
      recommendation: "Consider",
      rationale: "Missing key React requirement.",
    },
  ],
  finalRecommendation: {
    topCandidateId: "cand-1",
    topCandidateName: "Alice Smith",
    topCandidateScore: 85,
    totalCandidates: 2,
    explanation: "Alice is clearly the best fit.",
    hiringAdvice: "Proceed with first-round interview.",
  },
};

describe("buildChatSystemPrompt", () => {
  it("includes job title and summary", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("Senior Frontend Engineer");
    expect(prompt).toContain("senior frontend engineer with React experience");
  });

  it("includes candidate overview scores", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("Alice Smith");
    expect(prompt).toContain("85/100");
    expect(prompt).toContain("Excellent Match");
    expect(prompt).toContain("Bob Jones");
    expect(prompt).toContain("62/100");
    expect(prompt).toContain("Partial Match");
  });

  it("includes matched requirements with evidence", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("[required] React");
    expect(prompt).toContain("5 years React experience");
  });

  it("includes missing requirements", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("Not found in CV");
  });

  it("includes score breakdowns", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("Skills=90");
    expect(prompt).toContain("Experience=85");
  });

  it("includes ranking and final recommendation", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("**#1** Alice Smith");
    expect(prompt).toContain("**#2** Bob Jones");
    expect(prompt).toContain("Strong React experience");
    expect(prompt).toContain("Proceed with first-round interview");
  });

  it("includes the no-hallucination guideline", () => {
    const prompt = buildChatSystemPrompt(mockReport);
    expect(prompt).toContain("ONLY using the evidence");
    expect(prompt).toContain("I don't have that information");
  });
});

describe("buildChatMessages", () => {
  it("returns system message, history, and new user message", () => {
    const messages = buildChatMessages(
      "system prompt",
      [{ role: "user", content: "previous question" }],
      "new question"
    );
    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({ role: "system", content: "system prompt" });
    expect(messages[1]).toEqual({ role: "user", content: "previous question" });
    expect(messages[2]).toEqual({ role: "user", content: "new question" });
  });

  it("works without history", () => {
    const messages = buildChatMessages("system prompt", [], "first question");
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
    expect(messages[1].content).toBe("first question");
  });
});

describe("getSuggestedQuestions", () => {
  it("includes a summary question", () => {
    const questions = getSuggestedQuestions(mockReport);
    expect(questions.some((q) => q.toLowerCase().includes("summarize"))).toBe(true);
  });

  it("includes a comparison question when multiple candidates", () => {
    const questions = getSuggestedQuestions(mockReport);
    expect(questions.some((q) => q.toLowerCase().includes("compare"))).toBe(true);
    expect(questions.some((q) => q.includes("Alice") && q.includes("Bob"))).toBe(true);
  });

  it("does not include comparison when only one candidate", () => {
    const singleReport: MatchReport = {
      ...mockReport,
      candidateOverview: [mockReport.candidateOverview[0]],
      candidateAnalyses: [mockReport.candidateAnalyses[0]],
      candidateRanking: [mockReport.candidateRanking[0]],
    };
    const questions = getSuggestedQuestions(singleReport);
    expect(questions.some((q) => q.toLowerCase().includes("compare"))).toBe(false);
  });

  it("includes concerns question when candidate has weaknesses", () => {
    const questions = getSuggestedQuestions(mockReport);
    expect(questions.some((q) => q.toLowerCase().includes("concern"))).toBe(true);
  });

  it("returns at most 6 suggestions", () => {
    const questions = getSuggestedQuestions(mockReport);
    expect(questions.length).toBeLessThanOrEqual(6);
  });
});

describe("SSE formatting helpers", () => {
  it("formatSSEData wraps content in JSON with data: prefix", () => {
    const result = formatSSEData("Hello world");
    expect(result).toBe(`data: ${JSON.stringify({ content: "Hello world" })}\n\n`);
  });

  it("formatSSEEnd returns DONE signal", () => {
    expect(formatSSEEnd()).toBe("data: [DONE]\n\n");
  });

  it("formatSSEError wraps error message", () => {
    const result = formatSSEError("Something broke");
    expect(result).toBe(`data: ${JSON.stringify({ error: "Something broke" })}\n\n`);
  });
});
