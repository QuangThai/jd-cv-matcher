"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
};

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  );
}

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
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

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-chalk bg-mist/30 p-4 sm:p-5">
      <div className="flex items-end gap-3 rounded-xl border border-chalk bg-paper p-3 transition-[border-color] duration-150 focus-within:border-signal-blue">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask about the analysis results..."}
          disabled={disabled}
          rows={1}
          className={cn(
            "chat-textarea min-h-[44px] max-h-[120px] flex-1 resize-none border-0 bg-transparent shadow-none",
            "px-2 py-2.5 text-sm leading-relaxed text-ink placeholder:text-fog",
            "outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
            "bg-signal-blue text-paper hover:bg-deep-signal",
            "outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/25 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
            "disabled:cursor-not-allowed disabled:bg-ash disabled:text-fog",
            "active:scale-95 disabled:active:scale-100"
          )}
        >
          <SendIcon className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-fog">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
