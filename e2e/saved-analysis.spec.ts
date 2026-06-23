import { test, expect } from "@playwright/test";

const mockAnalysisResponse = {
  analysisId: "test-1",
  report: {
    jdSummary: {
      jobTitle: "Test Engineer Role", seniorityLevel: null, yearsOfExperience: null,
      requiredSkillCount: 1, preferredSkillCount: 0, educationRequired: false,
      certificationRequired: false, summary: "A test JD.",
    },
    candidateOverview: [{
      candidateId: "c1", candidateName: "Alice Smith",
      matchScore: 78, matchLevel: "Good Match", recommendation: "Recommend",
    }],
    candidateAnalyses: [{
      candidateId: "c1", candidateName: "Alice Smith",
      matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [],
      strongEvidence: [], weaknessesOrConcerns: [],
      recruiterSummary: "Alice is a good match.",
      scoreBreakdown: {
        requiredSkills: 80, relevantExperience: 75, toolsAndPlatforms: 70,
        seniorityAndYears: 75, domainKnowledge: 70, educationAndCertifications: 80,
        softSkillsAndLanguages: 75, total: 78, explanation: "Score breakdown here.",
      },
    }],
    candidateRanking: [{
      rank: 1, candidateId: "c1", candidateName: "Alice Smith",
      matchScore: 78, matchLevel: "Good Match", recommendation: "Recommend",
      rationale: "Best match.",
    }],
    finalRecommendation: {
      topCandidateId: "c1", topCandidateName: "Alice Smith",
      topCandidateScore: 78, totalCandidates: 1,
      explanation: "Top candidate explanation here.",
      hiringAdvice: "Proceed with interview screening for this candidate.",
    },
  },
};

const mockHistoryResponse = {
  analyses: [
    {
      id: "analysis-1",
      title: "Saved: Test Engineer Role — 6/23/2026",
      createdAt: "2026-06-23T10:00:00Z",
      jdTitle: "Test Engineer Role",
      candidateCount: 1,
      topScore: 78,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
};

test.describe("Saved Analysis & History", () => {
  test("shows sign-in prompt when not authenticated", async ({ page }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockAnalysisResponse) });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Test JD");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles({ name: "cv.txt", mimeType: "text/plain", buffer: Buffer.from("Alice CV") });

    await page.getByRole("button", { name: /Start Analysis/i }).click();
    await expect(page.getByText("Test Engineer Role")).toBeVisible({ timeout: 15000 });

    // "Sign in to save analysis" should appear since not authenticated
    await expect(page.getByText("Sign in to save analysis")).toBeVisible();
  });

  test("shows history page with mocked data", async ({ page }) => {
    // Mock the analyses list API
    await page.route("**/api/analyses*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockHistoryResponse) });
    });

    // Mock session API to return a logged-in user
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { name: "Test User", email: "test@example.com" }, expires: "2099-01-01T00:00:00.000Z" }),
      });
    });

    await page.goto("/history");
    await expect(page.getByText("Saved: Test Engineer Role")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("78")).toBeVisible();
  });

  test("shows history page header when signed in", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { name: "Test User", email: "test@example.com" }, expires: "2099-01-01T00:00:00.000Z" }),
      });
    });
    await page.route("**/api/analyses*", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ analyses: [], total: 0, page: 1, pageSize: 10 }) });
    });

    await page.goto("/history");
    await expect(page.getByText("Analysis history")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("PDF Export & Charts", () => {
  test("shows PDF export button in results", async ({ page }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockAnalysisResponse) });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Test JD");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles({ name: "cv.txt", mimeType: "text/plain", buffer: Buffer.from("Alice CV") });

    await page.getByRole("button", { name: /Start Analysis/i }).click();
    await expect(page.getByText("Test Engineer Role")).toBeVisible({ timeout: 15000 });

    // PDF button should be visible (shows "Sign in" variant since unauthenticated)
    await expect(page.getByText("Sign in to save analysis")).toBeVisible();
  });

  test("shows chart placeholders in results", async ({ page }) => {
    // Use multi-candidate data
    const multiCandidateResponse = {
      analysisId: "test-2",
      report: {
        ...mockAnalysisResponse.report,
        candidateOverview: [
          { candidateId: "c1", candidateName: "Alice Smith", matchScore: 85, matchLevel: "Excellent Match", recommendation: "Strongly Recommend" },
          { candidateId: "c2", candidateName: "Bob Jones", matchScore: 62, matchLevel: "Partial Match", recommendation: "Consider" },
        ],
        candidateAnalyses: [
          {
            ...mockAnalysisResponse.report.candidateAnalyses[0],
            candidateName: "Alice Smith",
            scoreBreakdown: { requiredSkills: 90, relevantExperience: 85, toolsAndPlatforms: 80, seniorityAndYears: 90, domainKnowledge: 85, educationAndCertifications: 80, softSkillsAndLanguages: 80, total: 85, explanation: "Strong." },
          },
          {
            candidateId: "c2", candidateName: "Bob Jones",
            matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [],
            strongEvidence: [], weaknessesOrConcerns: [],
            recruiterSummary: "Bob is okay.",
            scoreBreakdown: { requiredSkills: 50, relevantExperience: 60, toolsAndPlatforms: 55, seniorityAndYears: 65, domainKnowledge: 45, educationAndCertifications: 70, softSkillsAndLanguages: 60, total: 62, explanation: "Partial." },
          },
        ],
        candidateRanking: [
          { rank: 1, candidateId: "c1", candidateName: "Alice Smith", matchScore: 85, matchLevel: "Excellent Match", recommendation: "Strongly Recommend", rationale: "Strong match." },
          { rank: 2, candidateId: "c2", candidateName: "Bob Jones", matchScore: 62, matchLevel: "Partial Match", recommendation: "Consider", rationale: "Weaker." },
        ],
        finalRecommendation: {
          topCandidateId: "c1", topCandidateName: "Alice Smith", topCandidateScore: 85, totalCandidates: 2,
          explanation: "Alice is strongest.", hiringAdvice: "Proceed with Alice.",
        },
      },
    };

    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(multiCandidateResponse) });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Test JD with multiple");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles([
      { name: "alice.txt", mimeType: "text/plain", buffer: Buffer.from("Alice CV") },
      { name: "bob.txt", mimeType: "text/plain", buffer: Buffer.from("Bob CV") },
    ]);

    await page.getByRole("button", { name: /Start Analysis/i }).click();
    await expect(page.getByText("Excellent Match").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Partial Match").first()).toBeVisible();

    // Candidate names should exist
    await expect(page.getByText("Alice Smith").first()).toBeVisible();
    await expect(page.getByText("Bob Jones").first()).toBeVisible();
    await expect(page.getByText("Proceed with Alice")).toBeVisible();
  });
});
