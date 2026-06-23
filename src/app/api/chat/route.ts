import { NextRequest } from "next/server";
import {
  buildChatSystemPrompt,
  buildChatMessages,
  streamChatResponse,
  formatSSEData,
  formatSSEEnd,
  formatSSEError,
  type ChatMessage,
} from "@/lib/llm/chat";
import type { MatchReport } from "@/lib/types/match";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, report, history } = body as {
      message: string;
      report: MatchReport;
      history?: ChatMessage[];
    };

    if (!message || !report) {
      return new Response(
        formatSSEError("Missing required fields: message and report"),
        {
          status: 400,
          headers: { "Content-Type": "text/event-stream" },
        }
      );
    }

    const systemPrompt = buildChatSystemPrompt(report);
    const messages = buildChatMessages(
      systemPrompt,
      history ?? [],
      message
    );

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatResponse(messages)) {
            controller.enqueue(new TextEncoder().encode(formatSSEData(chunk)));
          }
          controller.enqueue(new TextEncoder().encode(formatSSEEnd()));
        } catch (error) {
          const errMsg =
            error instanceof Error ? error.message : "Unknown error during chat streaming";
          console.error("Chat streaming error:", errMsg);
          controller.enqueue(
            new TextEncoder().encode(formatSSEError(errMsg))
          );
        } finally {
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
    const errMsg =
      error instanceof Error ? error.message : "Invalid request";
    return new Response(formatSSEError(errMsg), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
}
