export type Priority = "required" | "preferred" | "nice_to_have";

export type Requirement = {
  id: string;
  name: string;
  category: string;
  priority: Priority;
  evidenceFromJD: string;
  weight: number;
};

export type JDExtract = {
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
