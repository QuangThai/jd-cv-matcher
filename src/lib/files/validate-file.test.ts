import { describe, it, expect } from "vitest";
import { validateFile, validateFiles, ALLOWED_EXTENSIONS } from "./validate-file";

describe("ALLOWED_EXTENSIONS", () => {
  it("includes pdf, docx, and txt", () => {
    expect(ALLOWED_EXTENSIONS).toContain("pdf");
    expect(ALLOWED_EXTENSIONS).toContain("docx");
    expect(ALLOWED_EXTENSIONS).toContain("txt");
  });
});

describe("validateFile", () => {
  it("validates a valid pdf file", () => {
    const result = validateFile({ name: "resume.pdf", size: 1024 * 500 });
    expect(result.valid).toBe(true);
    expect(result.ext).toBe("pdf");
  });

  it("validates a valid docx file", () => {
    const result = validateFile({ name: "resume.docx", size: 1024 * 500 });
    expect(result.valid).toBe(true);
    expect(result.ext).toBe("docx");
  });

  it("validates a valid txt file", () => {
    const result = validateFile({ name: "resume.txt", size: 1024 * 500 });
    expect(result.valid).toBe(true);
    expect(result.ext).toBe("txt");
  });

  it("rejects unsupported file types", () => {
    const result = validateFile({ name: "resume.png", size: 1024 * 500 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unsupported file format");
  });

  it("rejects files over 10MB", () => {
    const result = validateFile({ name: "resume.pdf", size: 11 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("accepts files exactly at 10MB", () => {
    const result = validateFile({ name: "resume.pdf", size: 10 * 1024 * 1024 });
    expect(result.valid).toBe(true);
  });
});

describe("validateFiles", () => {
  it("validates multiple files", () => {
    const files = [
      { name: "resume.pdf", size: 1000 },
      { name: "resume.png", size: 1000 },
      { name: "resume.docx", size: 1000 },
    ];
    const results = validateFiles(files);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[2].valid).toBe(true);
  });
});
