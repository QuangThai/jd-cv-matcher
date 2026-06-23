export type FactConfidence = "high" | "medium" | "low";

export type CVFact = {
  id: string;
  value: string;
  category: string;
  evidenceFromCV: string;
  confidence: FactConfidence;
};

export type WorkExperience = {
  company: string | null;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  durationMonths: number | null;
  responsibilities: CVFact[];
  achievements: CVFact[];
  technologies: CVFact[];
};

export type CVExtract = {
  candidateName: string | null;
  email: string | null;
  phone: string | null;
  currentTitle: string | null;
  totalYearsOfExperience: number | null;
  skills: CVFact[];
  tools: CVFact[];
  platforms: CVFact[];
  workExperience: WorkExperience[];
  education: CVFact[];
  certifications: CVFact[];
  projects: CVFact[];
  achievements: CVFact[];
  languages: CVFact[];
  domainExperience: CVFact[];
};
