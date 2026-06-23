const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["pdf", "docx", "txt"];

export type FileValidationResult = {
  valid: boolean;
  error?: string;
  ext?: string;
  size?: number;
};

export function validateFile(
  file: { name: string; size: number } | { name: string; size: number }
): FileValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!ext || !ALLOWED_TYPES.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file format: .${ext}. Supported formats: PDF, DOCX, TXT`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed: 10 MB`,
      ext,
      size: file.size,
    };
  }

  return { valid: true, ext, size: file.size };
}

export function validateFiles(
  files: { name: string; size: number }[]
): FileValidationResult[] {
  return files.map(validateFile);
}

export const ALLOWED_EXTENSIONS = ALLOWED_TYPES;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE;
