import { describe, it, expect } from "vitest";
import {
  normalizeText,
  normalizeSkillName,
  getAliasMap,
  findAliasMatch,
  levenshteinDistance,
  similarityRatio,
  fuzzyMatch,
  calculatePartialScore,
  getDomainKeywords,
} from "./normalize-text";

describe("normalizeText", () => {
  it("normalizes Windows line endings", () => {
    expect(normalizeText("line1\r\nline2")).toBe("line1\nline2");
  });

  it("collapses multiple newlines", () => {
    expect(normalizeText("a\n\n\n\nb")).toBe("a\n\nb");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeText("a    b   c")).toBe("a b c");
  });

  it("normalizes bullet points", () => {
    expect(normalizeText("• item1\n● item2\n- item3")).toBe("- item1\n- item2\n- item3");
  });

  it("trims whitespace", () => {
    expect(normalizeText("  hello world  ")).toBe("hello world");
  });
});

describe("normalizeSkillName", () => {
  it("normalizes React.js to React", () => {
    expect(normalizeSkillName("React.js")).toBe("React");
  });

  it("normalizes NodeJS to Node.js", () => {
    expect(normalizeSkillName("NodeJS")).toBe("Node.js");
  });

  it("normalizes K8s to Kubernetes", () => {
    expect(normalizeSkillName("K8s")).toBe("Kubernetes");
  });

  it("returns unchanged if no alias exists", () => {
    expect(normalizeSkillName("Python")).toBe("Python");
  });
});

describe("levenshteinDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshteinDistance("react", "react")).toBe(0);
  });

  it("returns length for completely different strings", () => {
    expect(levenshteinDistance("", "react")).toBe(5);
  });

  it("calculates single character difference", () => {
    expect(levenshteinDistance("react", "reakt")).toBe(1);
  });

  it("handles insertion", () => {
    expect(levenshteinDistance("cat", "cats")).toBe(1);
  });

  it("handles deletion", () => {
    expect(levenshteinDistance("cats", "cat")).toBe(1);
  });
});

describe("similarityRatio", () => {
  it("returns 1.0 for identical strings", () => {
    expect(similarityRatio("TypeScript", "TypeScript")).toBe(1.0);
  });

  it("returns 0.0 for empty vs non-empty", () => {
    expect(similarityRatio("", "TypeScript")).toBe(0.0);
  });

  it("returns high ratio for similar strings", () => {
    const ratio = similarityRatio("Typescript", "TypeScript");
    expect(ratio).toBeGreaterThan(0.8);
  });

  it("returns low ratio for different strings", () => {
    const ratio = similarityRatio("React", "Kubernetes");
    expect(ratio).toBeLessThan(0.3);
  });
});

describe("fuzzyMatch", () => {
  it("matches identical strings", () => {
    expect(fuzzyMatch("React", "React")).toBe(true);
  });

  it("matches similar strings at default threshold", () => {
    expect(fuzzyMatch("Typescript", "TypeScript")).toBe(true);
  });

  it("rejects different strings", () => {
    expect(fuzzyMatch("React", "Vue")).toBe(false);
  });

  it("respects custom threshold", () => {
    expect(fuzzyMatch("Kuberneties", "Kubernetes", 0.95)).toBe(false);
    expect(fuzzyMatch("Kuberneties", "Kubernetes", 0.7)).toBe(true);
  });

  it("is case insensitive", () => {
    expect(fuzzyMatch("REACT", "react")).toBe(true);
  });
});

describe("findAliasMatch", () => {
  it("finds direct match", () => {
    const result = findAliasMatch("experienced in React and TypeScript", "React");
    expect(result).toContain("React");
  });

  it("finds alias match (nodejs -> Node.js)", () => {
    const result = findAliasMatch("worked with nodejs and express", "Node.js");
    expect(result).toContain("node.js");
    expect(result).toContain("Node.js");
  });

  it("finds alias match (k8s -> Kubernetes)", () => {
    const result = findAliasMatch("deployed on k8s", "Kubernetes");
    expect(result).toContain("k8s");
  });

  it("finds alias match (aws -> Amazon Web Services)", () => {
    const result = findAliasMatch("deploying on AWS cloud", "Amazon Web Services");
    expect(result).toContain("aws");
    expect(result).toContain("Amazon Web Services");
  });

  it("returns null when nothing matches", () => {
    const result = findAliasMatch("experienced in Python and Django", "Kubernetes");
    expect(result).toBeNull();
  });

  it("matches version control alias to Git", () => {
    const result = findAliasMatch("proficient with Git and GitHub", "Version Control");
    expect(result).toContain("Git");
  });

  it("matches Git directly", () => {
    const result = findAliasMatch("proficient with Git and GitHub", "Git");
    expect(result).toContain("Git");
  });

  it("fuzzy matches misspelled skill", () => {
    const result = findAliasMatch("experienced with React and TypeScrip", "TypeScript");
    expect(result).toContain("fuzzy match");
  });

  it("fuzzy matches via alias", () => {
    const result = findAliasMatch("deploying on AWS cloud", "Amazon Web Services");
    expect(result).not.toBeNull();
  });
});

describe("calculatePartialScore", () => {
  it("returns 100 when all matched", () => {
    expect(calculatePartialScore(5, 5)).toBe(100);
  });

  it("returns 0 when none matched", () => {
    expect(calculatePartialScore(0, 5)).toBe(0);
  });

  it("returns proportional score", () => {
    expect(calculatePartialScore(3, 6)).toBe(50);
  });

  it("returns 0 when total is 0", () => {
    expect(calculatePartialScore(0, 0)).toBe(0);
  });

  it("rounds to integer", () => {
    expect(calculatePartialScore(1, 3)).toBe(33);
  });
});

describe("getDomainKeywords", () => {
  it("returns all domain groups", () => {
    const domains = getDomainKeywords();
    expect(domains).toHaveProperty("frontend");
    expect(domains).toHaveProperty("backend");
    expect(domains).toHaveProperty("cloud");
    expect(domains).toHaveProperty("devops");
    expect(domains).toHaveProperty("data");
    expect(domains).toHaveProperty("mobile");
  });

  it("frontend includes common frameworks", () => {
    const { frontend } = getDomainKeywords();
    expect(frontend).toContain("react");
    expect(frontend).toContain("vue");
  });

  it("cloud includes major providers", () => {
    const { cloud } = getDomainKeywords();
    expect(cloud).toContain("aws");
    expect(cloud).toContain("gcp");
    expect(cloud).toContain("azure");
  });
});

describe("getAliasMap", () => {
  it("returns a large alias dictionary", () => {
    const map = getAliasMap();
    expect(map["reactjs"]).toBe("React");
    expect(map["nodejs"]).toBe("Node.js");
    expect(Object.keys(map).length).toBeGreaterThan(50);
  });
});
