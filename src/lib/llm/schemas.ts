import { z } from "zod";

const NullableString = z.string().nullable().optional().default(null);
const NullableNumber = z.number().nullable().optional().default(null);
const EmptyArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).optional().default([]);

export const RequirementSchema = z.preprocess(
  (val) => {
    if (typeof val === "object" && val !== null) {
      const input = val as Record<string, unknown>;
      // Normalize 'requirement' → 'name' (LLM sometimes uses 'requirement')
      if (input.requirement && !input.name) {
        input.name = input.requirement;
      }
    }
    return val;
  },
  z.object({
    id: z.string().default(""),
    name: z.string().default(""),
    category: z.string().default(""),
    priority: z.enum(["required", "preferred", "nice_to_have"]).default("required"),
    evidenceFromJD: z.string().default(""),
    weight: z.number().min(0).max(100).default(50),
  })
);

export const JDExtractSchema = z.object({
  jobTitle: NullableString,
  seniorityLevel: NullableString,
  requiredSkills: EmptyArray(RequirementSchema),
  preferredSkills: EmptyArray(RequirementSchema),
  yearsOfExperience: z
    .object({
      minimumYears: NullableNumber,
      maximumYears: NullableNumber,
      rawText: NullableString,
    })
    .optional()
    .default({ minimumYears: null, maximumYears: null, rawText: null }),
  technicalTools: EmptyArray(RequirementSchema),
  platforms: EmptyArray(RequirementSchema),
  domainKnowledge: EmptyArray(RequirementSchema),
  educationRequirements: EmptyArray(RequirementSchema),
  certifications: EmptyArray(RequirementSchema),
  responsibilities: EmptyArray(RequirementSchema),
  softSkills: EmptyArray(RequirementSchema),
  languageRequirements: EmptyArray(RequirementSchema),
  locationRequirements: EmptyArray(RequirementSchema),
  workArrangement: NullableString,
  mustHaveCriteria: EmptyArray(RequirementSchema),
  niceToHaveCriteria: EmptyArray(RequirementSchema),
});

export const CVFactSchema = z.object({
  id: z.string().default(""),
  value: z.string().default(""),
  category: z.string().default(""),
  evidenceFromCV: z.string().default(""),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
});

export const WorkExperienceSchema = z.object({
  company: NullableString,
  title: NullableString,
  startDate: NullableString,
  endDate: NullableString,
  durationMonths: NullableNumber,
  responsibilities: EmptyArray(CVFactSchema),
  achievements: EmptyArray(CVFactSchema),
  technologies: EmptyArray(CVFactSchema),
});

export const CVExtractSchema = z.object({
  candidateName: NullableString,
  email: NullableString,
  phone: NullableString,
  currentTitle: NullableString,
  totalYearsOfExperience: NullableNumber,
  skills: EmptyArray(CVFactSchema),
  tools: EmptyArray(CVFactSchema),
  platforms: EmptyArray(CVFactSchema),
  workExperience: EmptyArray(WorkExperienceSchema),
  education: EmptyArray(CVFactSchema),
  certifications: EmptyArray(CVFactSchema),
  projects: EmptyArray(CVFactSchema),
  achievements: EmptyArray(CVFactSchema),
  languages: EmptyArray(CVFactSchema),
  domainExperience: EmptyArray(CVFactSchema),
});

// Scoring schemas
export const ScoreBreakdownSchema = z.object({
  requiredSkills: z.number().min(0).max(100).default(0),
  relevantExperience: z.number().min(0).max(100).default(0),
  toolsAndPlatforms: z.number().min(0).max(100).default(0),
  seniorityAndYears: z.number().min(0).max(100).default(0),
  domainKnowledge: z.number().min(0).max(100).default(0),
  educationAndCertifications: z.number().min(0).max(100).default(0),
  softSkillsAndLanguages: z.number().min(0).max(100).default(0),
  total: z.number().min(0).max(100).default(0),
  explanation: z.string().default(""),
});

export const RequirementMatchSchema = z.object({
  requirement: z.string().default(""),
  category: z.string().default(""),
  priority: z.enum(["required", "preferred", "nice_to_have"]).default("required"),
  status: z.enum(["matched", "partially_matched"]).default("matched"),
  evidenceFromCV: z.string().default(""),
  explanation: z.string().default(""),
});

export const MissingRequirementSchema = z.object({
  requirement: z.string().default(""),
  category: z.string().default(""),
  priority: z.enum(["required", "preferred", "nice_to_have"]).default("required"),
  evidenceStatus: z
    .enum(["Not found in CV", "Unclear from CV evidence"])
    .default("Not found in CV"),
});
