export type Recommendation =
  | "Strongly Recommend"
  | "Recommend"
  | "Consider"
  | "Not Recommended";

export function getRecommendation(score: number): Recommendation {
  if (score >= 85) return "Strongly Recommend";
  if (score >= 70) return "Recommend";
  if (score >= 50) return "Consider";
  return "Not Recommended";
}
