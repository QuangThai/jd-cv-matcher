import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/files/extract-text";
import { normalizeText } from "@/lib/files/normalize-text";
import { validateFile } from "@/lib/files/validate-file";
import { extractJD } from "@/lib/llm/extract-jd";
import { extractCV } from "@/lib/llm/extract-cv";
import { matchCandidate, buildReport } from "@/lib/llm/match-candidate";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get JD input
    const jdText = formData.get("jdText") as string | null;
    const jdFile = formData.get("jdFile") as File | null;

    if (!jdText && !jdFile) {
      return NextResponse.json(
        { error: "Please provide JD text or upload a JD file." },
        { status: 400 }
      );
    }

    // Get CV files
    const cvFiles = formData.getAll("cvFiles") as File[];
    if (cvFiles.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one CV file." },
        { status: 400 }
      );
    }

    // Validate CV files
    for (const cv of cvFiles) {
      const validation = validateFile({ name: cv.name, size: cv.size });
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Invalid CV file "${cv.name}": ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Extract JD text
    let jdTextContent: string;
    if (jdFile) {
      const jdValidation = validateFile({ name: jdFile.name, size: jdFile.size });
      if (!jdValidation.valid) {
        return NextResponse.json(
          { error: `Invalid JD file: ${jdValidation.error}` },
          { status: 400 }
        );
      }
      const jdBuffer = Buffer.from(await jdFile.arrayBuffer());
      const jdExtracted = await extractTextFromBuffer(jdBuffer, jdFile.name);
      jdTextContent = normalizeText(jdExtracted.text);
    } else {
      jdTextContent = normalizeText(jdText || "");
    }

    if (!jdTextContent.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from JD input." },
        { status: 400 }
      );
    }

    // Extract CV texts
    const cvBufferTexts = await Promise.all(
      cvFiles.map(async (cvFile) => {
        const buffer = Buffer.from(await cvFile.arrayBuffer());
        const extracted = await extractTextFromBuffer(buffer, cvFile.name);
        return normalizeText(extracted.text);
      })
    );

    // Run LLM extraction
    const jd = await extractJD(jdTextContent);
    const cvExtracts = await Promise.all(
      cvBufferTexts.map((text) => extractCV(text))
    );

    // Match and build report
    const results = await Promise.all(
      cvExtracts.map((cv, i) => matchCandidate(jd, cv, i))
    );

    const report = buildReport(jd, cvExtracts, results);

    return NextResponse.json({
      analysisId: `analysis-${Date.now()}`,
      report,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during analysis.",
      },
      { status: 500 }
    );
  }
}
