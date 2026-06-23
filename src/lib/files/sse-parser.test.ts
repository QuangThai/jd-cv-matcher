import { describe, it, expect } from "vitest";
import { parseBatchSSE, type BatchSSEEvent } from "@/lib/files/sse-parser";

function createMockReader(
  chunks: string[]
): ReadableStreamDefaultReader<Uint8Array> {
  let index = 0;
  const encoder = new TextEncoder();
  return {
    read: async () => {
      if (index >= chunks.length) return { done: true as const, value: undefined as any };
      return { done: false as const, value: encoder.encode(chunks[index++]) };
    },
    cancel: async () => {},
    releaseLock: () => {},
    closed: Promise.resolve(undefined),
  } as ReadableStreamDefaultReader<Uint8Array>;
}

describe("parseBatchSSE", () => {
  it("parses a single data event", async () => {
    const reader = createMockReader(["data: {\"type\":\"phase\",\"phase\":\"Processing...\"}\n\n"]);
    const events: BatchSSEEvent[] = [];
    for await (const event of parseBatchSSE(reader)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "phase", phase: "Processing..." });
  });

  it("parses multiple events", async () => {
    const reader = createMockReader([
      "data: {\"type\":\"phase\",\"phase\":\"Processing...\"}\n\n" +
      "data: {\"type\":\"cv-status\",\"fileId\":\"cv-0\",\"name\":\"a.pdf\",\"status\":\"queued\",\"index\":0}\n\n" +
      "data: {\"type\":\"cv-status\",\"fileId\":\"cv-0\",\"name\":\"a.pdf\",\"status\":\"done\",\"index\":0}\n\n",
    ]);
    const events: BatchSSEEvent[] = [];
    for await (const event of parseBatchSSE(reader)) {
      events.push(event);
    }
    expect(events).toHaveLength(3);
  });

  it("stops on [DONE] marker", async () => {
    const reader = createMockReader([
      "data: {\"type\":\"phase\",\"phase\":\"Done\"}\n\n" +
      "data: [DONE]\n\n" +
      "data: {\"type\":\"phase\",\"phase\":\"Should not appear\"}\n\n",
    ]);
    const events: BatchSSEEvent[] = [];
    for await (const event of parseBatchSSE(reader)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
  });

  it("handles chunked streaming (partial lines)", async () => {
    const reader = createMockReader([
      "data: {\"type\":\"pha",
      "se\",\"phase\":\"Stream",
      "ing...\"}\n\n",
    ]);
    const events: BatchSSEEvent[] = [];
    for await (const event of parseBatchSSE(reader)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
    expect((events[0] as any).phase).toBe("Streaming...");
  });

  it("skips non-data lines", async () => {
    const reader = createMockReader([
      ":comment\n" +
      "event: custom\n" +
      "data: {\"type\":\"phase\",\"phase\":\"Working\"}\n\n",
    ]);
    const events: BatchSSEEvent[] = [];
    for await (const event of parseBatchSSE(reader)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
  });

  it("skips malformed JSON gracefully", async () => {
    const reader = createMockReader([
      "data: {not-json}\n\n" +
      "data: {\"type\":\"phase\",\"phase\":\"OK\"}\n\n",
    ]);
    const events: BatchSSEEvent[] = [];
    for await (const event of parseBatchSSE(reader)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
  });

  it("parses all batch event types", async () => {
    const events: BatchSSEEvent[] = [
      { type: "phase", phase: "Start" },
      { type: "cv-status", fileId: "cv-0", name: "a.pdf", status: "done", index: 0 },
      { type: "error", message: "Something went wrong" },
    ];
    const chunks = events.map((e) => `data: ${JSON.stringify(e)}\n\n`);
    const reader = createMockReader(chunks);
    const parsed: BatchSSEEvent[] = [];
    for await (const ev of parseBatchSSE(reader)) {
      parsed.push(ev);
    }
    expect(parsed).toHaveLength(events.length);
  });
});
