"use client";

type Props = {
  questions: string[];
  onSelect: (question: string) => void;
  disabled: boolean;
  label?: string;
};

export function SuggestedQuestions({
  questions,
  onSelect,
  disabled,
  label,
}: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-chalk bg-paper px-4 py-4 sm:px-5">
      <p className="eyebrow">{label ?? "Try asking"}</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(q)}
            disabled={disabled}
            className="inline-flex max-w-full items-center rounded-full border border-chalk bg-lavender-wash/40 px-4 py-2 text-left text-xs font-medium text-ink transition-colors hover:border-ash hover:bg-lavender-wash disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="line-clamp-2">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
