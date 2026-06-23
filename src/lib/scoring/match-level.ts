export type MatchLevel =
  | "Excellent Match"
  | "Good Match"
  | "Partial Match"
  | "Weak Match";

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Partial Match";
  return "Weak Match";
}
