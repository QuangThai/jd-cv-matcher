import { NextRequest } from "next/server";
import { extractTextFromBuffer } from "@/lib/files/extract-text";
import { normalizeText } from "@/lib/files/normalize-text";
import { validateFile } from "@/lib/files/validate-file";
import { extractJD } from "@/lib/llm/extract-jd";
import { extractCV } from "@/lib/llm/extract-cv";
import { matchCandidate, buildReport } from "@/lib/llm/match-candidate";
import type { MatchReport } from "@/lib/types/match";

const BATCH_SIZE = 3; // Concurrent CVs to process
const MAX_CVS = 100;

function sseEvent(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function sseDone(): string {
  return "data: [DONE]\n\n";
}

type CVStatus = {
  fileId: string;
  name: string;
  status: "queued" | "extracting" | "analyzing" | "done" | "error";
  error?: string;
  index?: number;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const jdText = formData.get("jdText") as string | null;
    const jdFile = formData.get("jdFile") as File | null;
    const cvFiles = formData.getAll("cvFiles") as File[];

    // Validate
    if (!jdText && !jdFile) {
      return new Response(sseEvent({ type: "error", message: "No JD provided" }), {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    if (cvFiles.length === 0) {
      return new Response(sseEvent({ type: "error", message: "No CV files" }), {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    if (cvFiles.length > MAX_CVS) {
      return new Response(
        sseEvent({ type: "error", message: `Max ${MAX_CVS} CVs allowed` }),
        { status: 400, headers: { "Content-Type": "text/event-stream" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) =>
          controller.enqueue(new TextEncoder().encode(sseEvent(data)));

        try {
          // Extract JD text
          let jdTextContent: string;
          if (jdFile) {
            const v = validateFile({ name: jdFile.name, size: jdFile.size });
            if (!v.valid) { send({ type: "error", message: `JD: ${v.error}` }); controller.close(); return; }
            const buf = Buffer.from(await jdFile.arrayBuffer());
            const ext = await extractTextFromBuffer(buf, jdFile.name);
            jdTextContent = normalizeText(ext.text);
          } else {
            jdTextContent = normalizeText(jdText || "");
          }
          if (!jdTextContent.trim()) {
            send({ type: "error", message: "Could not extract JD text" });
            controller.close(); return;
          }

          send({ type: "jd-extracted" });

          // Extract JD structure via LLM
          send({ type: "phase", phase: "Analyzing job description..." });
          const jd = await extractJD(jdTextContent);

          // Process CVs in batches
          const results: { cvIndex: number; matchScore: number; candidateName: string | null; matchLevel: string; recommendation: string }[] = [];

          // Initial queued status
          for (let i = 0; i < cvFiles.length; i++) {
            send({ type: "cv-status", fileId: `cv-${i}`, name: cvFiles[i].name, status: "queued", index: i });
          }

          for (let batchStart = 0; batchStart < cvFiles.length; batchStart += BATCH_SIZE) {
            const batch = cvFiles.slice(batchStart, batchStart + BATCH_SIZE);
            const batchPromises = batch.map(async (cvFile, batchIdx) => {
              const i = batchStart + batchIdx;
              const fileId = `cv-${i}`;

              send({ type: "cv-status", fileId, name: cvFile.name, status: "extracting", index: i });

              const v = validateFile({ name: cvFile.name, size: cvFile.size });
              if (!v.valid) {
                send({ type: "cv-status", fileId, name: cvFile.name, status: "error", error: v.error, index: i });
                return;
              }

              try {
                const buf = Buffer.from(await cvFile.arrayBuffer());
                const extracted = await extractTextFromBuffer(buf, cvFile.name);
                const text = normalizeText(extracted.text);

                send({ type: "cv-status", fileId, name: cvFile.name, status: "analyzing", index: i });

                const cv = await extractCV(text);
                const matchResult = await matchCandidate(jd, cv, i);
                const report = buildReport(jd, [cv], [matchResult]);

                results.push({
                  cvIndex: i,
                  matchScore: report.candidateOverview[0]?.matchScore ?? 0,
                  candidateName: report.candidateOverview[0]?.candidateName ?? null,
                  matchLevel: report.candidateOverview[0]?.matchLevel ?? "N/A",
                  recommendation: report.candidateOverview[0]?.recommendation ?? "N/A",
                });

                send({ type: "cv-status", fileId, name: cvFile.name, status: "done", index: i });

                // Send partial result as soon as available
                send({
                  type: "cv-result",
                  fileId,
                  name: cvFile.name,
                  candidateName: report.candidateOverview[0]?.candidateName ?? null,
                  matchScore: report.candidateOverview[0]?.matchScore ?? 0,
                  matchLevel: report.candidateOverview[0]?.matchLevel ?? null,
                  recommendation: report.candidateOverview[0]?.recommendation ?? null,
                  report,
                });
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Processing failed";
                send({ type: "cv-status", fileId, name: cvFile.name, status: "error", error: msg, index: i });
              }
            });

            await Promise.all(batchPromises);
          }

          // Build final aggregate report
          // Re-run to get full report using all CV extracts (they were done above but reports are per-CV)
          // For simplicity, re-extract and re-match to get aggregated report
          // Actually we already have partial results accumulated. Let's build the full report.
          // Re-extract all CVs and run full match
          send({ type: "phase", phase: "Building final report..." });

          const cvExtracts = await Promise.all(
            cvFiles.map(async (cvFile) => {
              const buf = Buffer.from(await cvFile.arrayBuffer());
              const ext = await extractTextFromBuffer(buf, cvFile.name);
              return extractCV(normalizeText(ext.text));
            })
          );
          const matchResults = await Promise.all(
            cvExtracts.map((cv, i) => matchCandidate(jd, cv, i))
          );
          const fullReport: MatchReport = buildReport(jd, cvExtracts, matchResults);

          send({ type: "complete", report: fullReport });
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Batch processing failed";
          send({ type: "error", message: msg });
        } finally {
          controller.enqueue(new TextEncoder().encode(sseDone()));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Invalid request";
    return new Response(sseEvent({ type: "error", message: msg }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
}
