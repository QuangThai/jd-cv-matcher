import type { JDExtract } from "@/lib/types/jd";
import type { CVExtract } from "@/lib/types/cv";

export const SCORING_WEIGHTS = {
  requiredSkills: 0.30,
  relevantExperience: 0.25,
  roleResponsibility: 0.15,
  toolsAndDomain: 0.10,
  educationAndCertifications: 0.10,
  softSkillsAndLanguages: 0.10,
} as const;

export function calculateRequiredSkillsScore(
  jd: JDExtract,
  cv: CVExtract
): number {
  const requiredSkills = [
    ...jd.requiredSkills,
    ...jd.mustHaveCriteria.filter((r) => r.category === "skill"),
  ];

  if (requiredSkills.length === 0) return 0;

  const matchedSkills = requiredSkills.filter((req) => {
    const reqName = (req.name || "").toLowerCase().trim();
    if (!reqName) return false; // Empty name can't match
    return cv.skills.some((s) => s.value.toLowerCase().includes(reqName));
  });

  return (matchedSkills.length / requiredSkills.length) * 100;
}

export function calculateExperienceScore(jd: JDExtract, cv: CVExtract): number {
  if (!cv.totalYearsOfExperience) return 50; // unknown, partial score

  const minYears = jd.yearsOfExperience.minimumYears;
  if (minYears === null) return 75; // no minimum specified

  if (cv.totalYearsOfExperience >= minYears) {
    // Bonus for exceeding, but cap at 100
    return Math.min(100, 70 + (cv.totalYearsOfExperience - minYears) * 5);
  } else {
    // Penalty for being under
    return Math.max(0, 100 - (minYears - cv.totalYearsOfExperience) * 15);
  }
}

export function calculateToolsScore(jd: JDExtract, cv: CVExtract): number {
  const toolRequirements = [...jd.technicalTools, ...jd.platforms];

  if (toolRequirements.length === 0) return 75; // no tool requirements

  const cvToolValues = cv.tools.map((t) => t.value.toLowerCase());
  const cvPlatformValues = cv.platforms.map((p) => p.value.toLowerCase());
  const allCvTools = [...cvToolValues, ...cvPlatformValues];

  const matchedTools = toolRequirements.filter((req) => {
    const reqName = req.name.toLowerCase();
    return allCvTools.some((t) => t.includes(reqName) || reqName.includes(t));
  });

  return (matchedTools.length / toolRequirements.length) * 100;
}

export function calculateEducationScore(
  jd: JDExtract,
  cv: CVExtract
): number {
  if (jd.educationRequirements.length === 0) return 75; // no education requirement
  if (cv.education.length === 0) return 0;

  // Simple: check if CV has any education entry
  return cv.education.length > 0 ? 85 : 0;
}

export function calculateCertificationScore(
  jd: JDExtract,
  cv: CVExtract
): number {
  if (jd.certifications.length === 0) return 75; // no cert requirement

  const jdCertNames = jd.certifications.map((c) => c.name.toLowerCase());
  const cvCertValues = cv.certifications.map((c) => c.value.toLowerCase());

  const matchedCerts = jdCertNames.filter((jdCert) =>
    cvCertValues.some((cvCert) => cvCert.includes(jdCert))
  );

  if (jdCertNames.length === 0) return 75;
  return (matchedCerts.length / jdCertNames.length) * 100;
}

export function calculateDomainScore(jd: JDExtract, cv: CVExtract): number {
  if (jd.domainKnowledge.length === 0) return 75;

  const jdDomains = jd.domainKnowledge.map((d) => d.name.toLowerCase());
  const cvDomains = cv.domainExperience.map((d) => d.value.toLowerCase());

  const matchedDomains = jdDomains.filter((jdDomain) =>
    cvDomains.some((cvDomain) => cvDomain.includes(jdDomain))
  );

  return (matchedDomains.length / jdDomains.length) * 100;
}

export function calculateSoftSkillsScore(
  jd: JDExtract,
  cv: CVExtract
): number {
  if (jd.softSkills.length === 0) return 75;

  const jdSoftSkills = jd.softSkills.map((s) => s.name.toLowerCase());
  const cvSkills = cv.skills.map((s) => s.value.toLowerCase());
  const cvAchievements = cv.achievements.map((a) => a.value.toLowerCase());
  const allCvText = [...cvSkills, ...cvAchievements].join(" ");

  const matchedSkills = jdSoftSkills.filter((jdSkill) =>
    allCvText.includes(jdSkill)
  );

  return (matchedSkills.length / jdSoftSkills.length) * 100;
}

export type ScoreComponents = {
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

export function calculateScore(
  jd: JDExtract,
  cv: CVExtract
): {
  components: ScoreComponents;
  breakdown: Record<string, number>;
} {
  // Calculate each component
  const requiredSkills = calculateRequiredSkillsScore(jd, cv);
  const relevantExperience =
    calculateExperienceScore(jd, cv);
  const toolsAndPlatforms = calculateToolsScore(jd, cv);
  const seniorityAndYears = calculateExperienceScore(jd, cv);
  const domainKnowledge = calculateDomainScore(jd, cv);

  const educationAndCertifications = Math.round(
    calculateEducationScore(jd, cv) * 0.5 +
      calculateCertificationScore(jd, cv) * 0.5
  );

  const softSkillsAndLanguages = calculateSoftSkillsScore(jd, cv);

  // Weighted total
  const total = Math.round(
    requiredSkills * SCORING_WEIGHTS.requiredSkills +
      relevantExperience * SCORING_WEIGHTS.relevantExperience +
      toolsAndPlatforms * SCORING_WEIGHTS.toolsAndDomain +
      seniorityAndYears * SCORING_WEIGHTS.toolsAndDomain + // reuse weight
      domainKnowledge * SCORING_WEIGHTS.toolsAndDomain +
      educationAndCertifications * SCORING_WEIGHTS.educationAndCertifications +
      softSkillsAndLanguages * SCORING_WEIGHTS.softSkillsAndLanguages
  );

  const explanation = `Score based on weighted evaluation: Skills (${requiredSkills.toFixed(0)}/100 × 30%), Experience (${relevantExperience.toFixed(0)}/100 × 25%), Tools (${toolsAndPlatforms.toFixed(0)}/100 × 10%), Education/Certs (${educationAndCertifications}/100 × 10%), Soft Skills (${softSkillsAndLanguages}/100 × 10%).`;

  return {
    components: {
      requiredSkills: Math.round(requiredSkills),
      relevantExperience: Math.round(relevantExperience),
      toolsAndPlatforms: Math.round(toolsAndPlatforms),
      seniorityAndYears: Math.round(seniorityAndYears),
      domainKnowledge: Math.round(domainKnowledge),
      educationAndCertifications,
      softSkillsAndLanguages,
      total: Math.min(100, total),
      explanation,
    },
    breakdown: {
      requiredSkills: Math.round(requiredSkills),
      relevantExperience: Math.round(relevantExperience),
      toolsAndPlatforms: Math.round(toolsAndPlatforms),
      seniorityAndYears: Math.round(seniorityAndYears),
      domainKnowledge: Math.round(domainKnowledge),
      educationAndCertifications,
      softSkillsAndLanguages,
    },
  };
}
