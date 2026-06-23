import { test, expect } from "@playwright/test";

test.describe("Atlas Match - Home Page", () => {
  test("shows app header and how-to instructions", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("banner").getByText("Atlas")).toBeVisible();
    await expect(page.getByRole("banner").getByText("Match")).toBeVisible();
    await expect(page.getByText("Add a Job Description")).toBeVisible();
    await expect(page.getByText("Upload candidate CVs")).toBeVisible();
    await expect(page.getByText("Review evidence-based results")).toBeVisible();
  });

  test("shows JD and CV input sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Job Description").first()).toBeVisible();
    await expect(page.getByText("Candidate CVs").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Paste text" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload file" })).toBeVisible();
  });

  test("toggles between JD paste and upload modes", async ({ page }) => {
    await page.goto("/");
    const textarea = page.getByPlaceholder(/Paste Job Description/i);
    await expect(textarea).toBeVisible();

    await page.getByRole("button", { name: "Upload file" }).click();
    await expect(page.getByText("Upload JD file")).toBeVisible();
    await expect(textarea).not.toBeVisible();

    await page.getByRole("button", { name: "Paste text" }).click();
    await expect(textarea).toBeVisible();
  });

  test("submit button disabled without inputs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Start Analysis/i })).toBeDisabled();
  });

  test("enables submit with JD text and CV", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Senior Frontend requiring React");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles({ name: "cv.txt", mimeType: "text/plain", buffer: Buffer.from("Jane Doe") });

    await expect(page.getByRole("button", { name: /Start Analysis/i })).toBeEnabled();
  });

  test("shows and removes selected CV files", async ({ page }) => {
    await page.goto("/");
    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles([
      { name: "cv1.txt", mimeType: "text/plain", buffer: Buffer.from("CV 1") },
      { name: "cv2.txt", mimeType: "text/plain", buffer: Buffer.from("CV 2") },
    ]);

    await expect(page.getByText("2 files selected")).toBeVisible();
    await expect(page.getByText("cv1.txt")).toBeVisible();
    await expect(page.getByText("cv2.txt")).toBeVisible();

    // Remove first file
    await page.getByRole("button", { name: "Remove" }).first().click();
    await expect(page.getByText("1 file selected")).toBeVisible();
  });

  test("displays results with mocked API", async ({ page }) => {
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          analysisId: "test-1",
          report: {
            jdSummary: {
              jobTitle: "Test Engineer Role",
              seniorityLevel: null,
              yearsOfExperience: null,
              requiredSkillCount: 1,
              preferredSkillCount: 0,
              educationRequired: false,
              certificationRequired: false,
              summary: "A test JD.",
            },
            candidateOverview: [{
              candidateId: "c1",
              candidateName: "Alice Smith",
              matchScore: 78,
              matchLevel: "Good Match",
              recommendation: "Recommend",
            }],
            candidateAnalyses: [{
              candidateId: "c1",
              candidateName: "Alice Smith",
              matchedRequirements: [{
                requirement: "React",
                category: "skill",
                priority: "required",
                status: "matched",
                evidenceFromCV: "Built apps with React",
                explanation: "Found React in CV",
              }],
              partiallyMatchedRequirements: [],
              missingRequirements: [],
              strongEvidence: [],
              weaknessesOrConcerns: ["Some concern"],
              recruiterSummary: "Alice is a good match.",
              scoreBreakdown: {
                requiredSkills: 80, relevantExperience: 75, toolsAndPlatforms: 70,
                seniorityAndYears: 75, domainKnowledge: 70, educationAndCertifications: 80,
                softSkillsAndLanguages: 75, total: 78,
                explanation: "Score breakdown here.",
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
        }),
      });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Test JD");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles({ name: "cv.txt", mimeType: "text/plain", buffer: Buffer.from("Alice CV") });

    await page.getByRole("button", { name: /Start Analysis/i }).click();

    // Results should show
    await expect(page.getByText("Test Engineer Role").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Alice Smith").first()).toBeVisible();
    await expect(page.getByText("Good Match").first()).toBeVisible();
    await expect(page.getByText("Recommend").first()).toBeVisible();
    await expect(page.getByText("Proceed with interview screening")).toBeVisible();
  });

  test("shows 404 page", async ({ page }) => {
    await page.goto("/nonexistent");
    await expect(page.getByText("Page Not Found")).toBeVisible();
  });

  test("has correct HTML title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Atlas Match/);
  });

  test("shows Ask Atlas panel in results area", async ({ page }) => {
    // Intercept analyze API
    await page.route("**/api/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          analysisId: "test-1",
          report: {
            jdSummary: {
              jobTitle: "Test Role", seniorityLevel: null, yearsOfExperience: null,
              requiredSkillCount: 1, preferredSkillCount: 0,
              educationRequired: false, certificationRequired: false, summary: "Test JD summary.",
            },
            candidateOverview: [{
              candidateId: "c1", candidateName: "Alice",
              matchScore: 78, matchLevel: "Good Match", recommendation: "Recommend",
            }],
            candidateAnalyses: [{
              candidateId: "c1", candidateName: "Alice",
              matchedRequirements: [], partiallyMatchedRequirements: [], missingRequirements: [],
              strongEvidence: [], weaknessesOrConcerns: [],
              recruiterSummary: "Good match.",
              scoreBreakdown: {
                requiredSkills: 80, relevantExperience: 75, toolsAndPlatforms: 70,
                seniorityAndYears: 75, domainKnowledge: 70, educationAndCertifications: 80,
                softSkillsAndLanguages: 75, total: 78, explanation: "Breakdown.",
              },
            }],
            candidateRanking: [{
              rank: 1, candidateId: "c1", candidateName: "Alice",
              matchScore: 78, matchLevel: "Good Match", recommendation: "Recommend",
              rationale: "Best match.",
            }],
            finalRecommendation: {
              topCandidateId: "c1", topCandidateName: "Alice",
              topCandidateScore: 78, totalCandidates: 1,
              explanation: "Top candidate.", hiringAdvice: "Proceed.",
            },
          },
        }),
      });
    });

    // Intercept chat API with SSE response
    await page.route("**/api/chat", async (route) => {
      const body = 
        `data: ${JSON.stringify({ content: "Hello! I'm Atlas. " })}\n\n` +
        `data: ${JSON.stringify({ content: "Alice scored 78/100. " })}\n\n` +
        `data: ${JSON.stringify({ content: "She is a Good Match." })}\n\n` +
        "data: [DONE]\n\n";
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body,
      });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Test JD");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    await f.setFiles({ name: "cv.txt", mimeType: "text/plain", buffer: Buffer.from("Alice CV") });

    await page.getByRole("button", { name: /Start Analysis/i }).click();
    await expect(page.getByText("Test Role").first()).toBeVisible({ timeout: 15000 });

    // Open ChatPanel
    await page.getByText("Ask Atlas").click();

    // Empty state shows
    await expect(page.getByText("Ask anything about these results")).toBeVisible();

    // Type and send a message
    const chatInput = page.getByPlaceholder(/Ask about the analysis/i);
    await chatInput.fill("Summarize the results");
    await page.getByRole("button", { name: "Send" }).click();

    // Should see the streamed response
    await expect(page.getByText("Hello! I'm Atlas.")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Alice scored 78/100")).toBeVisible();
    await expect(page.getByText("She is a Good Match.")).toBeVisible();
  });
});
