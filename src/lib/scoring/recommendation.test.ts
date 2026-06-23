import { describe, it, expect } from "vitest";
import { getRecommendation } from "./recommendation";

describe("getRecommendation", () => {
  it('returns "Strongly Recommend" for scores 85-100', () => {
    expect(getRecommendation(85)).toBe("Strongly Recommend");
    expect(getRecommendation(95)).toBe("Strongly Recommend");
    expect(getRecommendation(100)).toBe("Strongly Recommend");
  });

  it('returns "Recommend" for scores 70-84', () => {
    expect(getRecommendation(70)).toBe("Recommend");
    expect(getRecommendation(78)).toBe("Recommend");
    expect(getRecommendation(84)).toBe("Recommend");
  });

  it('returns "Consider" for scores 50-69', () => {
    expect(getRecommendation(50)).toBe("Consider");
    expect(getRecommendation(60)).toBe("Consider");
    expect(getRecommendation(69)).toBe("Consider");
  });

  it('returns "Not Recommended" for scores below 50', () => {
    expect(getRecommendation(0)).toBe("Not Recommended");
    expect(getRecommendation(25)).toBe("Not Recommended");
    expect(getRecommendation(49)).toBe("Not Recommended");
  });
});
