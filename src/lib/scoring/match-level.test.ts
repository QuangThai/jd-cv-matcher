import { describe, it, expect } from "vitest";
import { getMatchLevel } from "./match-level";

describe("getMatchLevel", () => {
  it('returns "Excellent Match" for scores 85-100', () => {
    expect(getMatchLevel(85)).toBe("Excellent Match");
    expect(getMatchLevel(92)).toBe("Excellent Match");
    expect(getMatchLevel(100)).toBe("Excellent Match");
  });

  it('returns "Good Match" for scores 70-84', () => {
    expect(getMatchLevel(70)).toBe("Good Match");
    expect(getMatchLevel(77)).toBe("Good Match");
    expect(getMatchLevel(84)).toBe("Good Match");
  });

  it('returns "Partial Match" for scores 50-69', () => {
    expect(getMatchLevel(50)).toBe("Partial Match");
    expect(getMatchLevel(61)).toBe("Partial Match");
    expect(getMatchLevel(69)).toBe("Partial Match");
  });

  it('returns "Weak Match" for scores 0-49', () => {
    expect(getMatchLevel(0)).toBe("Weak Match");
    expect(getMatchLevel(25)).toBe("Weak Match");
    expect(getMatchLevel(49)).toBe("Weak Match");
  });
});
