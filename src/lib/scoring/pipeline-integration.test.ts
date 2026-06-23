import { describe, it, expect } from "vitest";
import { matchCandidate, buildReport } from "@/lib/llm/match-candidate";
import { JDExtractSchema, CVExtractSchema } from "@/lib/llm/schemas";
import type { z } from "zod";

type JDExtract = z.infer<typeof JDExtractSchema>;
type CVExtract = z.infer<typeof CVExtractSchema>;

// Build JD data using the schema for proper defaults
function makeJD(): JDExtract {
  return JDExtractSchema.parse({
    jobTitle: "Senior Frontend Engineer",
    requiredSkills: [
      { requirement: "React", category: "skill", priority: "required", evidenceFromJD: "5+ years React", weight: 100 },
      { requirement: "TypeScript", category: "skill", priority: "required", evidenceFromJD: "TypeScript proficiency", weight: 90 },
      { requirement: "CSS", category: "skill", priority: "required", evidenceFromJD: "Modern CSS", weight: 80 },
    ],
    preferredSkills: [
      { requirement: "Next.js", category: "skill", priority: "preferred", evidenceFromJD: "", weight: 50 },
      { requirement: "GraphQL", category: "skill", priority: "preferred", evidenceFromJD: "", weight: 50 },
    ],
    yearsOfExperience: { minimumYears: 5, maximumYears: null, rawText: "5+ years" },
    seniorityLevel: "Senior",
    summary: "Looking for a senior frontend engineer.",
    responsibilities: [
      { requirement: "Build UI", category: "responsibility", priority: "required", evidenceFromJD: "", weight: 50 },
    ],
  });
}

function makeStrongCV(): CVExtract {
  return CVExtractSchema.parse({
    candidateName: "Alice Smith",
    totalYearsOfExperience: 6,
    skills: [
      { id: "s1", value: "React", category: "frontend" },
      { id: "s2", value: "TypeScript", category: "language" },
      { id: "s3", value: "CSS", category: "frontend" },
      { id: "s4", value: "Next.js", category: "framework" },
      { id: "s5", value: "Node.js", category: "backend" },
    ],
    tools: [
      { id: "t1", value: "Git", category: "tool" },
      { id: "t2", value: "Webpack", category: "build" },
      { id: "t3", value: "Jest", category: "testing" },
    ],
    workExperience: [
      {
        title: "Senior Frontend Developer",
        company: "Tech Corp",
        startDate: "2020-01",
        endDate: "2024-06",
        description: "Built React apps and led frontend team.",
        achievements: [],
      },
    ],
    education: [
      { id: "e1", value: "BSc Computer Science", category: "degree" },
    ],
    languages: [
      { id: "l1", value: "English", category: "language" },
    ],
    domainExperience: [],
    platforms: [],
    certifications: [],
    projects: [],
    achievements: [],
  });
}

function makeWeakCV(): CVExtract {
  return CVExtractSchema.parse({
    candidateName: "Bob Weak",
    totalYearsOfExperience: 2,
    skills: [
      { id: "s1", value: "Java", category: "language" },
      { id: "s2", value: "Spring Boot", category: "framework" },
    ],
    tools: [
      { id: "t1", value: "Git", category: "tool" },
    ],
    workExperience: [
      {
        title: "Junior Developer",
        company: "Startup Inc",
        startDate: "2022-01",
        endDate: "2024-01",
        description: "Backend services work.",
        achievements: [],
      },
    ],
    education: [
      { id: "e1", value: "Bootcamp", category: "certificate" },
    ],
    languages: [],
    domainExperience: [],
    platforms: [],
    certifications: [],
    projects: [],
    achievements: [],
  });
}

describe("Scoring Pipeline Integration", () => {
  it("scores a strong candidate correctly", async () => {
    const jd = makeJD();
    const cv = makeStrongCV();

    const result = await matchCandidate(jd, cv, 0);

    expect(result.overview.matchScore).toBeGreaterThanOrEqual(70);
    expect(result.overview.matchLevel).toMatch(/Excellent|Good/);
    expect(result.analysis.matchedRequirements.length).toBeGreaterThanOrEqual(1);
  });

  it("ranks strong candidate above weak candidate", async () => {
    const jd = makeJD();
    const strong = makeStrongCV();
    const weak = makeWeakCV();

    const r1 = await matchCandidate(jd, strong, 0);
    const r2 = await matchCandidate(jd, weak, 1);

    expect(r1.overview.matchScore).toBeGreaterThan(r2.overview.matchScore);
    expect(r1.overview.matchLevel).toBe("Excellent Match");
  });

  it("produces consistent rankings via buildReport", async () => {
    const jd = makeJD();
    const strong = makeStrongCV();
    const weak = makeWeakCV();

    const r1 = await matchCandidate(jd, strong, 0);
    const r2 = await matchCandidate(jd, weak, 1);

    const report = buildReport(jd, [strong, weak], [r1, r2]);

    expect(report.candidateRanking).toHaveLength(2);
    expect(report.candidateRanking[0].matchScore).toBeGreaterThan(
      report.candidateRanking[1].matchScore
    );
    expect(report.candidateRanking[0].candidateName).toBe("Alice Smith");
    expect(report.candidateRanking[1].candidateName).toBe("Bob Weak");
  });

  it("produces complete score breakdown", async () => {
    const jd = makeJD();
    const cv = makeStrongCV();

    const r = await matchCandidate(jd, cv, 0);
    const report = buildReport(jd, [cv], [r]);

    const sb = report.candidateAnalyses[0].scoreBreakdown;
    expect(sb.requiredSkills).toBeGreaterThanOrEqual(0);
    expect(sb.relevantExperience).toBeGreaterThanOrEqual(0);
    expect(sb.toolsAndPlatforms).toBeGreaterThanOrEqual(0);
    expect(sb.seniorityAndYears).toBeGreaterThanOrEqual(0);
    expect(sb.domainKnowledge).toBeGreaterThanOrEqual(0);
    expect(sb.educationAndCertifications).toBeGreaterThanOrEqual(0);
    expect(sb.softSkillsAndLanguages).toBeGreaterThanOrEqual(0);
    expect(sb.total).toBeGreaterThan(0);
  });

  it("is deterministic for identical inputs", async () => {
    const jd = makeJD();
    const cv = makeStrongCV();

    const r1 = await matchCandidate(jd, cv, 0);
    const r2 = await matchCandidate(jd, cv, 0);

    expect(r1.overview.matchScore).toBe(r2.overview.matchScore);
    expect(r1.overview.matchLevel).toBe(r2.overview.matchLevel);
  });
});
