import { describe, it, expect } from "vitest";
import { calculateRequiredSkillsScore, calculateExperienceScore, calculateToolsScore, calculateEducationScore, calculateCertificationScore, calculateDomainScore, calculateSoftSkillsScore, calculateScore } from "./calculate-score";
import type { JDExtract } from "@/lib/types/jd";
import type { CVExtract } from "@/lib/types/cv";

function makeMockJD(overrides: Partial<JDExtract> = {}): JDExtract {
  return {
    jobTitle: "Test Role",
    seniorityLevel: "Senior",
    requiredSkills: [],
    preferredSkills: [],
    yearsOfExperience: { minimumYears: null, maximumYears: null, rawText: null },
    technicalTools: [],
    platforms: [],
    domainKnowledge: [],
    educationRequirements: [],
    certifications: [],
    responsibilities: [],
    softSkills: [],
    languageRequirements: [],
    locationRequirements: [],
    workArrangement: null,
    mustHaveCriteria: [],
    niceToHaveCriteria: [],
    ...overrides,
  };
}

function makeMockCV(overrides: Partial<CVExtract> = {}): CVExtract {
  return {
    candidateName: "Test Candidate",
    email: null,
    phone: null,
    currentTitle: null,
    totalYearsOfExperience: null,
    skills: [],
    tools: [],
    platforms: [],
    workExperience: [],
    education: [],
    certifications: [],
    projects: [],
    achievements: [],
    languages: [],
    domainExperience: [],
    ...overrides,
  };
}

describe("calculateRequiredSkillsScore", () => {
  it("returns 0 when JD has no required skills", () => {
    const jd = makeMockJD();
    const cv = makeMockCV({ skills: [{ id: "s1", value: "React", category: "skill", evidenceFromCV: "Used React", confidence: "high" }] });
    expect(calculateRequiredSkillsScore(jd, cv)).toBe(0);
  });

  it("returns 100 when all skills match", () => {
    const jd = makeMockJD({
      requiredSkills: [{ id: "r1", name: "React", category: "required_skill", priority: "required", evidenceFromJD: "Need React", weight: 90 }],
    });
    const cv = makeMockCV({ skills: [{ id: "s1", value: "React", category: "skill", evidenceFromCV: "Used React", confidence: "high" }] });
    expect(calculateRequiredSkillsScore(jd, cv)).toBe(100);
  });

  it("returns 50 when half the skills match", () => {
    const jd = makeMockJD({
      requiredSkills: [
        { id: "r1", name: "React", category: "required_skill", priority: "required", evidenceFromJD: "Need React", weight: 90 },
        { id: "r2", name: "Angular", category: "required_skill", priority: "required", evidenceFromJD: "Need Angular", weight: 80 },
      ],
    });
    const cv = makeMockCV({ skills: [{ id: "s1", value: "React", category: "skill", evidenceFromCV: "Used React", confidence: "high" }] });
    expect(calculateRequiredSkillsScore(jd, cv)).toBe(50);
  });

  it("returns 0 when no skills match", () => {
    const jd = makeMockJD({
      requiredSkills: [{ id: "r1", name: "Angular", category: "required_skill", priority: "required", evidenceFromJD: "Need Angular", weight: 90 }],
    });
    const cv = makeMockCV({ skills: [{ id: "s1", value: "React", category: "skill", evidenceFromCV: "Used React", confidence: "high" }] });
    expect(calculateRequiredSkillsScore(jd, cv)).toBe(0);
  });
});

describe("calculateExperienceScore", () => {
  it("returns 50 when CV has no experience info", () => {
    const jd = makeMockJD();
    const cv = makeMockCV({ totalYearsOfExperience: null });
    expect(calculateExperienceScore(jd, cv)).toBe(50);
  });

  it("returns 75 when JD has no minimum years requirement", () => {
    const jd = makeMockJD({ yearsOfExperience: { minimumYears: null, maximumYears: null, rawText: null } });
    const cv = makeMockCV({ totalYearsOfExperience: 5 });
    expect(calculateExperienceScore(jd, cv)).toBe(75);
  });

  it("returns 100 when candidate exceeds minimum by 6+ years", () => {
    const jd = makeMockJD({ yearsOfExperience: { minimumYears: 3, maximumYears: null, rawText: "3+" } });
    const cv = makeMockCV({ totalYearsOfExperience: 10 });
    expect(calculateExperienceScore(jd, cv)).toBe(100);
  });

  it("returns 70 when candidate just meets minimum", () => {
    const jd = makeMockJD({ yearsOfExperience: { minimumYears: 5, maximumYears: null, rawText: "5" } });
    const cv = makeMockCV({ totalYearsOfExperience: 5 });
    expect(calculateExperienceScore(jd, cv)).toBe(70);
  });

  it("returns lower score when below minimum", () => {
    const jd = makeMockJD({ yearsOfExperience: { minimumYears: 5, maximumYears: null, rawText: "5" } });
    const cv = makeMockCV({ totalYearsOfExperience: 2 });
    const score = calculateExperienceScore(jd, cv);
    expect(score).toBeLessThan(70);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateToolsScore", () => {
  it("returns 75 when JD has no tool requirements", () => {
    const jd = makeMockJD();
    const cv = makeMockCV({ tools: [{ id: "t1", value: "Git", category: "tool", evidenceFromCV: "Used Git", confidence: "high" }] });
    expect(calculateToolsScore(jd, cv)).toBe(75);
  });

  it("returns 100 when all tools match", () => {
    const jd = makeMockJD({ technicalTools: [{ id: "r1", name: "Git", category: "tool", priority: "required", evidenceFromJD: "Need Git", weight: 50 }] });
    const cv = makeMockCV({ tools: [{ id: "t1", value: "Git", category: "tool", evidenceFromCV: "Used Git", confidence: "high" }] });
    expect(calculateToolsScore(jd, cv)).toBe(100);
  });

  it("returns 0 when no tools match", () => {
    const jd = makeMockJD({ technicalTools: [{ id: "r1", name: "Docker", category: "tool", priority: "required", evidenceFromJD: "Need Docker", weight: 50 }] });
    const cv = makeMockCV({ tools: [{ id: "t1", value: "Git", category: "tool", evidenceFromCV: "Used Git", confidence: "high" }] });
    expect(calculateToolsScore(jd, cv)).toBe(0);
  });
});

describe("calculateEducationScore", () => {
  it("returns 75 when JD has no education requirement", () => {
    const jd = makeMockJD();
    const cv = makeMockCV({ education: [{ id: "e1", value: "B.S. CS", category: "education", evidenceFromCV: "B.S. Computer Science", confidence: "high" }] });
    expect(calculateEducationScore(jd, cv)).toBe(75);
  });

  it("returns 85 when JD requires education and CV has it", () => {
    const jd = makeMockJD({ educationRequirements: [{ id: "r1", name: "Bachelor's", category: "education", priority: "preferred", evidenceFromJD: "Need degree", weight: 50 }] });
    const cv = makeMockCV({ education: [{ id: "e1", value: "B.S. CS", category: "education", evidenceFromCV: "B.S. Computer Science", confidence: "high" }] });
    expect(calculateEducationScore(jd, cv)).toBe(85);
  });

  it("returns 0 when JD requires education but CV has none", () => {
    const jd = makeMockJD({ educationRequirements: [{ id: "r1", name: "Bachelor's", category: "education", priority: "preferred", evidenceFromJD: "Need degree", weight: 50 }] });
    const cv = makeMockCV({ education: [] });
    expect(calculateEducationScore(jd, cv)).toBe(0);
  });
});

describe("calculateScore (integration)", () => {
  it("returns valid score components for realistic JD and CV", () => {
    const jd = makeMockJD({
      jobTitle: "Frontend Developer",
      requiredSkills: [
        { id: "r1", name: "React", category: "required_skill", priority: "required", evidenceFromJD: "Need React", weight: 90 },
        { id: "r2", name: "TypeScript", category: "required_skill", priority: "required", evidenceFromJD: "Need TS", weight: 85 },
      ],
      yearsOfExperience: { minimumYears: 3, maximumYears: null, rawText: "3+" },
    });

    const cv = makeMockCV({
      candidateName: "John",
      totalYearsOfExperience: 5,
      skills: [
        { id: "s1", value: "React", category: "skill", evidenceFromCV: "Used React", confidence: "high" },
        { id: "s2", value: "TypeScript", category: "skill", evidenceFromCV: "Used TS", confidence: "high" },
      ],
    });

    const result = calculateScore(jd, cv);
    expect(result.components.total).toBeGreaterThanOrEqual(0);
    expect(result.components.total).toBeLessThanOrEqual(100);
    expect(result.components.requiredSkills).toBe(100);
    expect(result.components.explanation).toBeTruthy();
  });

  it("returns lower score for poor match", () => {
    const jd = makeMockJD({
      jobTitle: "Backend Developer",
      requiredSkills: [
        { id: "r1", name: "Python", category: "required_skill", priority: "required", evidenceFromJD: "Need Python", weight: 90 },
        { id: "r2", name: "Django", category: "required_skill", priority: "required", evidenceFromJD: "Need Django", weight: 85 },
        { id: "r3", name: "PostgreSQL", category: "required_skill", priority: "required", evidenceFromJD: "Need PG", weight: 80 },
      ],
      yearsOfExperience: { minimumYears: 5, maximumYears: null, rawText: "5+" },
    });

    const cv = makeMockCV({
      candidateName: "Jane",
      totalYearsOfExperience: 2,
      skills: [
        { id: "s1", value: "React", category: "skill", evidenceFromCV: "Used React", confidence: "high" },
        { id: "s2", value: "CSS", category: "skill", evidenceFromCV: "Used CSS", confidence: "high" },
      ],
    });

    const result = calculateScore(jd, cv);
    expect(result.components.total).toBeLessThan(50);
    expect(result.components.requiredSkills).toBe(0);
  });
});
