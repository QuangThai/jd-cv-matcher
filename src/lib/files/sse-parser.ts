import type { MatchReport } from "@/lib/types/match";

/** Client-side parser for batch SSE events */
export async function* parseBatchSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<BatchSSEEvent> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;

      try {
        yield JSON.parse(data) as BatchSSEEvent;
      } catch {
        // skip malformed
      }
    }
  }
}

export type BatchSSEEvent =
  | { type: "jd-extracted" }
  | { type: "phase"; phase: string }
  | { type: "cv-status"; fileId: string; name: string; status: "queued" | "extracting" | "analyzing" | "done" | "error"; error?: string; index: number }
  | { type: "cv-result"; fileId: string; name: string; candidateName: string | null; matchScore: number; matchLevel: string | null; recommendation: string | null; report: MatchReport }
  | { type: "complete"; report: MatchReport }
  | { type: "error"; message: string };
