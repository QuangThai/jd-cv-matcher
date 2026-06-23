import { describe, it, expect } from "vitest";
import { JDExtractSchema, CVExtractSchema } from "./schemas";

describe("JDExtractSchema", () => {
  it("parses a minimal valid JD extract with defaults", () => {
    const input = {};
    const result = JDExtractSchema.parse(input);
    expect(result.jobTitle).toBeNull();
    expect(result.seniorityLevel).toBeNull();
    expect(result.requiredSkills).toEqual([]);
    expect(result.preferredSkills).toEqual([]);
    expect(result.yearsOfExperience).toEqual({
      minimumYears: null,
      maximumYears: null,
      rawText: null,
    });
    expect(result.technicalTools).toEqual([]);
    expect(result.platforms).toEqual([]);
  });

  it("parses a complete JD extract", () => {
    const input = {
      jobTitle: "Software Engineer",
      seniorityLevel: "Senior",
      requiredSkills: [
        {
          id: "r1",
          name: "React",
          category: "required_skill",
          priority: "required",
          evidenceFromJD: "Need React",
          weight: 90,
        },
      ],
      yearsOfExperience: { minimumYears: 5, maximumYears: null, rawText: "5+" },
      technicalTools: [],
      platforms: [],
      domainKnowledge: [],
      educationRequirements: [],
      certifications: [],
      responsibilities: [],
      softSkills: [],
      languageRequirements: [],
      locationRequirements: [],
      workArrangement: "Remote",
      mustHaveCriteria: [],
      niceToHaveCriteria: [],
    };
    const result = JDExtractSchema.parse(input);
    expect(result.jobTitle).toBe("Software Engineer");
    expect(result.requiredSkills).toHaveLength(1);
    expect(result.requiredSkills[0].name).toBe("React");
    expect(result.workArrangement).toBe("Remote");
  });
});

describe("CVExtractSchema", () => {
  it("parses a minimal valid CV extract with defaults", () => {
    const input = {};
    const result = CVExtractSchema.parse(input);
    expect(result.candidateName).toBeNull();
    expect(result.email).toBeNull();
    expect(result.skills).toEqual([]);
    expect(result.workExperience).toEqual([]);
  });

  it("parses a complete CV extract", () => {
    const input = {
      candidateName: "Jane Doe",
      email: "jane@email.com",
      currentTitle: "Senior Developer",
      totalYearsOfExperience: 6,
      skills: [
        {
          id: "s1",
          value: "React",
          category: "skill",
          evidenceFromCV: "Built apps with React",
          confidence: "high",
        },
      ],
      tools: [],
      platforms: [],
      workExperience: [
        {
          company: "TechCorp",
          title: "Senior Dev",
          startDate: "2021",
          endDate: "Present",
          durationMonths: 36,
          responsibilities: [],
          achievements: [],
          technologies: [],
        },
      ],
      education: [],
      certifications: [],
      projects: [],
      achievements: [],
      languages: [],
      domainExperience: [],
    };
    const result = CVExtractSchema.parse(input);
    expect(result.candidateName).toBe("Jane Doe");
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].value).toBe("React");
    expect(result.workExperience).toHaveLength(1);
    expect(result.workExperience[0].company).toBe("TechCorp");
  });
});
