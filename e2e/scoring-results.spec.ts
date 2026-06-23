import { test, expect } from "@playwright/test";

const JD_TITLE = "Senior Frontend Engineer";

function buildMockReport(score: number, level: string, rec: string) {
  return {
    analysisId: "score-test",
    report: {
      jdSummary: {
        jobTitle: JD_TITLE, seniorityLevel: "Senior", yearsOfExperience: "5+",
        requiredSkillCount: 3, preferredSkillCount: 0, educationRequired: false,
        certificationRequired: false, summary: "Test.",
      },
      candidateOverview: [
        { candidateId: "c1", candidateName: "Alice React", matchScore: score, matchLevel: level, recommendation: rec },
      ],
      candidateAnalyses: [
        {
          candidateId: "c1", candidateName: "Alice React",
          matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [],
          strongEvidence: [], weaknessesOrConcerns: [],
          recruiterSummary: "Test summary.",
          scoreBreakdown: {
            requiredSkills: score, relevantExperience: 75, toolsAndPlatforms: 70,
            seniorityAndYears: 80, domainKnowledge: 70, educationAndCertifications: 75,
            softSkillsAndLanguages: 70, total: score, explanation: "Score breakdown.",
          },
        },
      ],
      candidateRanking: [
        { rank: 1, candidateId: "c1", candidateName: "Alice React", matchScore: score, matchLevel: level, recommendation: rec, rationale: "Best match." },
      ],
      finalRecommendation: {
        topCandidateId: "c1", topCandidateName: "Alice React", topCandidateScore: score, totalCandidates: 1,
        explanation: "Top candidate.", hiringAdvice: "Proceed.",
      },
    },
  };
}

async function runAnalysis(page: any, mockData: any) {
  await page.route("**/api/analyze", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockData) });
  });

  await page.goto("/");
  await page.getByPlaceholder(/Paste Job Description/i).fill("Senior Frontend requiring React");

  const fc = page.waitForEvent("filechooser");
  await page.getByText("Upload CV files").first().click();
  const f = await fc;
  await f.setFiles({ name: "alice.txt", mimeType: "text/plain", buffer: Buffer.from("Alice CV") });

  await page.getByRole("button", { name: /Start Analysis/i }).click();
}

test.describe("Scoring Results Display", () => {
  test("shows Excellent Match for high score (85)", async ({ page }) => {
    await runAnalysis(page, buildMockReport(85, "Excellent Match", "Strongly Recommend"));
    await expect(page.getByText(JD_TITLE).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("85/100").first()).toBeVisible();
    await expect(page.getByText("Excellent Match").first()).toBeVisible();
    await expect(page.getByText("Strongly Recommend").first()).toBeVisible();
    await expect(page.getByText("Proceed.").first()).toBeVisible();
  });

  test("shows Good Match for medium score (72)", async ({ page }) => {
    await runAnalysis(page, buildMockReport(72, "Good Match", "Recommend"));
    await expect(page.getByText(JD_TITLE).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("72/100").first()).toBeVisible();
    await expect(page.getByText("Good Match").first()).toBeVisible();
    await expect(page.getByText("Recommend").first()).toBeVisible();
  });

  test("shows Weak Match for low score (35)", async ({ page }) => {
    await runAnalysis(page, buildMockReport(35, "Weak Match", "Not Recommended"));
    await expect(page.getByText(JD_TITLE).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("35/100").first()).toBeVisible();
    await expect(page.getByText("Weak Match").first()).toBeVisible();
    await expect(page.getByText("Not Recommended").first()).toBeVisible();
  });

  test("shows multi-candidate ranking correctly", async ({ page }) => {
    const multiData = {
      analysisId: "multi-test",
      report: {
        jdSummary: {
          jobTitle: "Full Stack Developer", seniorityLevel: null, yearsOfExperience: null,
          requiredSkillCount: 2, preferredSkillCount: 0, educationRequired: false,
          certificationRequired: false, summary: "Multi test.",
        },
        candidateOverview: [
          { candidateId: "c1", candidateName: "Alice Strong", matchScore: 92, matchLevel: "Excellent Match", recommendation: "Strongly Recommend" },
          { candidateId: "c2", candidateName: "Bob Medium", matchScore: 68, matchLevel: "Partial Match", recommendation: "Consider" },
          { candidateId: "c3", candidateName: "Charlie Weak", matchScore: 28, matchLevel: "Weak Match", recommendation: "Not Recommended" },
        ],
        candidateAnalyses: [
          { candidateId: "c1", candidateName: "Alice Strong", matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [], strongEvidence: [], weaknessesOrConcerns: [], recruiterSummary: "Strong.", scoreBreakdown: { requiredSkills: 92, relevantExperience: 85, toolsAndPlatforms: 80, seniorityAndYears: 90, domainKnowledge: 85, educationAndCertifications: 80, softSkillsAndLanguages: 80, total: 92, explanation: "Strong." } },
          { candidateId: "c2", candidateName: "Bob Medium", matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [], strongEvidence: [], weaknessesOrConcerns: [], recruiterSummary: "OK.", scoreBreakdown: { requiredSkills: 68, relevantExperience: 65, toolsAndPlatforms: 60, seniorityAndYears: 70, domainKnowledge: 55, educationAndCertifications: 60, softSkillsAndLanguages: 60, total: 68, explanation: "OK." } },
          { candidateId: "c3", candidateName: "Charlie Weak", matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [], strongEvidence: [], weaknessesOrConcerns: [], recruiterSummary: "Weak.", scoreBreakdown: { requiredSkills: 28, relevantExperience: 40, toolsAndPlatforms: 30, seniorityAndYears: 35, domainKnowledge: 20, educationAndCertifications: 25, softSkillsAndLanguages: 30, total: 28, explanation: "Weak." } },
        ],
        candidateRanking: [
          { rank: 1, candidateId: "c1", candidateName: "Alice Strong", matchScore: 92, matchLevel: "Excellent Match", recommendation: "Strongly Recommend", rationale: "Highest." },
          { rank: 2, candidateId: "c2", candidateName: "Bob Medium", matchScore: 68, matchLevel: "Partial Match", recommendation: "Consider", rationale: "Medium." },
          { rank: 3, candidateId: "c3", candidateName: "Charlie Weak", matchScore: 28, matchLevel: "Weak Match", recommendation: "Not Recommended", rationale: "Lowest." },
        ],
        finalRecommendation: {
          topCandidateId: "c1", topCandidateName: "Alice Strong", topCandidateScore: 92, totalCandidates: 3,
          explanation: "Alice is strongest.", hiringAdvice: "Interview Alice.",
        },
      },
    };

    await page.route("**/api/analyze", async (route: any) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(multiData) });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Full Stack role");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles([
      { name: "alice.txt", mimeType: "text/plain", buffer: Buffer.from("Alice") },
      { name: "bob.txt", mimeType: "text/plain", buffer: Buffer.from("Bob") },
      { name: "charlie.txt", mimeType: "text/plain", buffer: Buffer.from("Charlie") },
    ]);

    await page.getByRole("button", { name: /Start Analysis/i }).click();
    await expect(page.getByText("Full Stack Developer").first()).toBeVisible({ timeout: 15000 });

    // All three candidates should be visible
    await expect(page.getByText("Alice Strong").first()).toBeVisible();
    await expect(page.getByText("Bob Medium").first()).toBeVisible();
    await expect(page.getByText("Charlie Weak").first()).toBeVisible();

    // Scores should show
    await expect(page.getByText("92/100").first()).toBeVisible();
    await expect(page.getByText("68/100").first()).toBeVisible();
    await expect(page.getByText("28/100").first()).toBeVisible();

    // Final recommendation should mention Alice
    await expect(page.getByText("Interview Alice")).toBeVisible();
  });
});
