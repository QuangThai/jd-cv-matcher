"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage as ChatMessageComp } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestedQuestions } from "./suggested-questions";
import { getSuggestedQuestions, type ChatMessage } from "@/lib/llm/chat";
import type { MatchReport } from "@/lib/types/match";

type Props = {
  report: MatchReport | null;
};

export function ChatPanel({ report }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (report && isOpen) {
      setSuggestedQuestions(getSuggestedQuestions(report));
    }
  }, [report, isOpen]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!report || isStreaming) return;

      const userMsg: ChatMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");
      setError(null);
      setSuggestedQuestions([]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            report,
            history: messages,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();

            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setError(parsed.error);
                break;
              }
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }

        if (fullContent) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullContent },
          ]);
          setSuggestedQuestions([
            "Tell me more details",
            "What should I focus on?",
            "Summarize the key differences",
          ]);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to get response";
        setError(errMsg);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [report, messages, isStreaming]
  );

  if (!report) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-chalk bg-paper">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-mist/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-chalk bg-lavender-wash">
            <svg className="size-4 text-iris" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <div className="text-left">
            <span className="font-medium text-ink">Ask Atlas</span>
            {messages.length > 0 && (
              <span className="ml-2 text-xs text-fog">
                {messages.filter((m) => m.role === "user").length} questions
              </span>
            )}
          </div>
        </div>
        <svg
          className={`size-4 text-fog transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="flex flex-col border-t border-chalk">
          <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !isStreaming && !error && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-chalk bg-lavender-wash">
                  <svg className="size-5 text-iris" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink">
                  Ask anything about these results
                </p>
                <p className="mt-1 max-w-xs text-xs text-pencil">
                  Compare candidates, understand scores, find red flags — answers
                  are grounded in your analysis data.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessageComp
                key={i}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
              />
            ))}

            {isStreaming && streamingContent && (
              <ChatMessageComp role="assistant" content={streamingContent} />
            )}

            {isStreaming && !streamingContent && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-pencil">
                <div className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-fog [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-fog [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-fog" />
                </div>
                <span>Atlas is thinking...</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-chalk bg-blush-whisper px-4 py-3 text-sm">
                <p className="eyebrow mb-1 text-destructive">Error</p>
                <p className="text-pencil">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-2 text-xs font-medium text-destructive hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!isStreaming && suggestedQuestions.length > 0 && (
            <SuggestedQuestions
              questions={suggestedQuestions}
              onSelect={sendMessage}
              disabled={isStreaming}
            />
          )}

          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      )}
    </div>
  );
}
