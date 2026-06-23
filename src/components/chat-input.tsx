"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
};

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-border/40 bg-background p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Ask about the analysis results..."}
        disabled={disabled}
        rows={1}
        className={cn(
          "min-h-[40px] max-h-[120px] w-full resize-none rounded-xl border border-border/60",
          "bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors"
        )}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className={cn(
          "shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 active:scale-[0.97]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          "flex items-center gap-1.5"
        )}
      >
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
        Send
      </button>
    </div>
  );
}
