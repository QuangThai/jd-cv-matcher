import type { JDExtract } from "@/lib/types/jd";
import type { CVExtract } from "@/lib/types/cv";
import type {
  EvidenceGraphNode,
  EvidenceGraphEdge,
  CandidateEvidenceGraph,
  ScoreBreakdown,
} from "@/lib/types/match";
import { calculateScore } from "@/lib/scoring/calculate-score";

export function buildEvidenceGraph(
  jd: JDExtract,
  cv: CVExtract,
  candidateIndex: number
): CandidateEvidenceGraph {
  const candidateId = `candidate-${candidateIndex + 1}`;
  const jdNodes: EvidenceGraphNode[] = [];
  const cvNodes: EvidenceGraphNode[] = [];
  const edges: EvidenceGraphEdge[] = [];

  // Collect all JD requirements
  const allRequirements = [
    ...jd.requiredSkills.map((r) => ({ ...r, sourceType: "required_skill" as const })),
    ...jd.preferredSkills.map((r) => ({ ...r, sourceType: "preferred_skill" as const })),
    ...jd.technicalTools.map((r) => ({ ...r, sourceType: "tool" as const })),
    ...jd.platforms.map((r) => ({ ...r, sourceType: "platform" as const })),
    ...jd.educationRequirements.map((r) => ({ ...r, sourceType: "education" as const })),
    ...jd.certifications.map((r) => ({ ...r, sourceType: "certification" as const })),
    ...jd.domainKnowledge.map((r) => ({ ...r, sourceType: "domain" as const })),
    ...jd.softSkills.map((r) => ({ ...r, sourceType: "soft_skill" as const })),
    ...jd.mustHaveCriteria.map((r) => ({ ...r, sourceType: "must_have" as const })),
  ];

  // Build JD requirement nodes
  const reqNodeIds = new Set<string>();
  for (const req of allRequirements) {
    const nodeId = `jd-${req.id}`;
    reqNodeIds.add(nodeId);
    jdNodes.push({
      id: nodeId,
      type: "jd_requirement",
      label: req.name,
      data: { category: req.category, priority: req.priority, weight: req.weight },
    });
  }

  // Collect CV evidence
  const allCvEvidence = [
    ...cv.skills.map((f) => ({ ...f, sourceType: "skill" as const })),
    ...cv.tools.map((f) => ({ ...f, sourceType: "tool" as const })),
    ...cv.platforms.map((f) => ({ ...f, sourceType: "platform" as const })),
    ...cv.education.map((f) => ({ ...f, sourceType: "education" as const })),
    ...cv.certifications.map((f) => ({ ...f, sourceType: "certification" as const })),
    ...cv.domainExperience.map((f) => ({ ...f, sourceType: "domain" as const })),
  ];

  // Build CV evidence nodes
  const cvNodeIds = new Set<string>();
  for (const fact of allCvEvidence) {
    const nodeId = `cv-${fact.id}`;
    cvNodeIds.add(nodeId);
    cvNodes.push({
      id: nodeId,
      type: "cv_evidence",
      label: fact.value,
      data: { category: fact.category, confidence: fact.confidence },
    });
  }

  // Build edges — match JD requirements against CV evidence
  const cvText = collectCVText(cv);
  for (const req of allRequirements) {
    const reqNodeId = `jd-${req.id}`;
    const reqLower = req.name.toLowerCase();
    const matchedCvFact = allCvEvidence.find((fact) =>
      fact.value.toLowerCase().includes(reqLower) ||
      reqLower.includes(fact.value.toLowerCase())
    );

    if (matchedCvFact) {
      const cvNodeId = `cv-${matchedCvFact.id}`;
      edges.push({
        from: reqNodeId,
        to: cvNodeId,
        type: "MATCHED",
        confidence: matchedCvFact.confidence === "high" ? "high" : "medium",
        explanation: `"${req.name}" matches "${matchedCvFact.value}" in CV`,
      });
    } else {
      const partialMatch = allCvEvidence.find((fact) => {
        const factWords = fact.value.toLowerCase().split(/\s+/);
        const reqWords = reqLower.split(/\s+/);
        return reqWords.some((w) => w.length > 3 && factWords.some((fw) => fw.includes(w)));
      });

      if (partialMatch) {
        const cvNodeId = `cv-${partialMatch.id}`;
        edges.push({
          from: reqNodeId,
          to: cvNodeId,
          type: "PARTIALLY_MATCHED",
          confidence: "low",
          explanation: `"${req.name}" partially related to "${partialMatch.value}"`,
        });
      } else if (cvText.includes(reqLower)) {
        // Generic mention, not a structured fact
        edges.push({
          from: reqNodeId,
          to: candidateId,
          type: "DISCUSSED",
          confidence: "low",
          explanation: `"${req.name}" mentioned in CV text but not as a structured fact`,
        });
      } else {
        edges.push({
          from: reqNodeId,
          to: candidateId,
          type: "NOT_FOUND",
          confidence: "high",
          explanation: `"${req.name}" not found in CV`,
        });
      }
    }
  }

  const score = calculateScore(jd, cv);

  return {
    candidateId,
    jdRequirementNodes: jdNodes,
    cvEvidenceNodes: cvNodes,
    edges,
    scoreBreakdown: score.components,
  };
}

function collectCVText(cv: CVExtract): string {
  const parts: string[] = [];
  if (cv.currentTitle) parts.push(cv.currentTitle);
  cv.skills.forEach((s) => parts.push(s.value, s.evidenceFromCV));
  cv.tools.forEach((t) => parts.push(t.value, t.evidenceFromCV));
  cv.platforms.forEach((p) => parts.push(p.value, p.evidenceFromCV));
  cv.workExperience.forEach((w) => {
    if (w.company) parts.push(w.company);
    if (w.title) parts.push(w.title);
    w.responsibilities.forEach((r) => parts.push(r.value));
    w.technologies.forEach((t) => parts.push(t.value));
  });
  cv.education.forEach((e) => parts.push(e.value));
  cv.certifications.forEach((c) => parts.push(c.value));
  cv.projects.forEach((p) => parts.push(p.value));
  cv.achievements.forEach((a) => parts.push(a.value));
  cv.languages.forEach((l) => parts.push(l.value));
  cv.domainExperience.forEach((d) => parts.push(d.value));
  return parts.join(" ").toLowerCase();
}
