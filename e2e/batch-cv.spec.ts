import { test, expect } from "@playwright/test";

test.describe("Batch CV Processing", () => {
  test("shows batch mode indicator with 6+ CVs", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Senior Engineer role");

    // Add 6 CVs to trigger batch mode
    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    const files1 = Array.from({ length: 6 }, (_, i) => ({
      name: `cv${i + 1}.txt`,
      mimeType: "text/plain" as const,
      buffer: Buffer.from(`Candidate ${i + 1} CV`),
    })) as any;
    await f.setFiles(files1);

    // Batch mode indicator should appear
    await expect(page.getByText("6 CVs — batch mode with live progress")).toBeVisible();
  });

  test("uses batch endpoint for 6+ CVs", async ({ page }) => {
    let batchApiCalled = false;

    // Intercept batch endpoint
    await page.route("**/api/analyze/batch", async (route) => {
      batchApiCalled = true;
      // Create SSE response that completes immediately
      const events = [
        'data: {"type":"phase","phase":"Starting..."}',
        'data: {"type":"cv-status","fileId":"cv-0","name":"cv1.txt","status":"queued","index":0}',
        'data: {"type":"cv-status","fileId":"cv-0","name":"cv1.txt","status":"done","index":0}',
        'data: {"type":"complete","report":{"jdSummary":{"jobTitle":"Batch Test","requiredSkillCount":0,"preferredSkillCount":0,"educationRequired":false,"certificationRequired":false,"summary":""},"candidateOverview":[{"candidateId":"c1","candidateName":"Result","matchScore":85,"matchLevel":"Good","recommendation":"Recommend"}],"candidateAnalyses":[{"candidateId":"c1","candidateName":"Result","matchedRequirements":[],"partiallyMatchedRequirements":[],"missingRequirements":[],"strongEvidence":[],"weaknessesOrConcerns":[],"recruiterSummary":"","scoreBreakdown":{"requiredSkills":80,"relevantExperience":75,"toolsAndPlatforms":70,"seniorityAndYears":75,"domainKnowledge":70,"educationAndCertifications":80,"softSkillsAndLanguages":75,"total":85,"explanation":""}}],"candidateRanking":[{"rank":1,"candidateId":"c1","candidateName":"Result","matchScore":85,"matchLevel":"Good","recommendation":"Recommend","rationale":""}],"finalRecommendation":{"topCandidateId":"c1","topCandidateName":"Result","topCandidateScore":85,"totalCandidates":1,"explanation":"","hiringAdvice":""}}}',
        "data: [DONE]",
      ].join("\n\n") + "\n\n";

      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        body: events,
      });
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Senior role");

    // Upload 6 CVs
    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    const files2 = Array.from({ length: 6 }, (_, i) => ({
      name: `cv${i + 1}.txt`,
      mimeType: "text/plain" as const,
      buffer: Buffer.from(`CV ${i + 1}`),
    })) as any;
    await f.setFiles(files2);

    await page.getByRole("button", { name: /Start Analysis/i }).click();

    // Wait for batch API to be called
    await expect(async () => {
      expect(batchApiCalled).toBe(true);
    }).toPass({ timeout: 15000 });

    // Result should display
    await expect(page.getByText("Result").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows cancel button during batch processing", async ({ page }) => {
    // Endpoint that never finishes
    await page.route("**/api/analyze/batch", async () => {
      await new Promise(() => {}); // Never resolve
    });

    await page.goto("/");
    await page.getByPlaceholder(/Paste Job Description/i).fill("Engineer role");

    const fc = page.waitForEvent("filechooser");
    await page.getByText("Upload CV files").first().click();
    const f = await fc;
    const files3 = Array.from({ length: 6 }, (_, i) => ({
      name: `cv${i + 1}.txt`,
      mimeType: "text/plain" as const,
      buffer: Buffer.from(`CV ${i + 1}`),
    })) as any;
    await f.setFiles(files3);

    await page.getByRole("button", { name: /Start Analysis/i }).click();
    await expect(page.getByText("Cancel")).toBeVisible({ timeout: 10000 });

    // Click cancel
    await page.getByText("Cancel").click();
    await expect(page.getByText("Start Analysis")).toBeVisible({ timeout: 10000 });
  });
});
