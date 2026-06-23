import fs from "fs";
import path from "path";

type ExtractedText = {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount: number;
  };
};

export async function extractTextFromFile(
  filePath: string
): Promise<ExtractedText> {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const fileName = path.basename(filePath);

  switch (ext) {
    case "txt":
      return extractFromTxt(filePath);
    case "pdf":
      return extractFromPdf(filePath);
    case "docx":
      return extractFromDocx(filePath);
    default:
      throw new Error(`Unsupported file format: .${ext}`);
  }
}

async function extractFromTxt(filePath: string): Promise<ExtractedText> {
  const text = fs.readFileSync(filePath, "utf-8");
  return {
    text,
    metadata: {
      fileName: path.basename(filePath),
      fileType: "txt",
      wordCount: text.split(/\s+/).filter(Boolean).length,
    },
  };
}

async function extractFromPdf(filePath: string): Promise<ExtractedText> {
  const pdfParse = await import("pdf-parse");
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse.default(dataBuffer);

  return {
    text: data.text,
    metadata: {
      fileName: path.basename(filePath),
      fileType: "pdf",
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).filter(Boolean).length,
    },
  };
}

async function extractFromDocx(filePath: string): Promise<ExtractedText> {
  const mammoth = await import("mammoth");
  const dataBuffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });

  return {
    text: result.value,
    metadata: {
      fileName: path.basename(filePath),
      fileType: "docx",
      wordCount: result.value.split(/\s+/).filter(Boolean).length,
    },
  };
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<ExtractedText> {
  const ext = path.extname(fileName).toLowerCase().replace(".", "");

  switch (ext) {
    case "txt":
      return {
        text: buffer.toString("utf-8"),
        metadata: {
          fileName,
          fileType: "txt",
          wordCount: buffer.toString("utf-8").split(/\s+/).filter(Boolean).length,
        },
      };
    case "pdf": {
      const pdfParse = await import("pdf-parse");
      const data = await pdfParse.default(buffer);
      return {
        text: data.text,
        metadata: {
          fileName,
          fileType: "pdf",
          pageCount: data.numpages,
          wordCount: data.text.split(/\s+/).filter(Boolean).length,
        },
      };
    }
    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value,
        metadata: {
          fileName,
          fileType: "docx",
          wordCount: result.value.split(/\s+/).filter(Boolean).length,
        },
      };
    }
    default:
      throw new Error(`Unsupported file format: .${ext}`);
  }
}
