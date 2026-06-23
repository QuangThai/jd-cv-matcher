"use client";

type Props = {
  questions: string[];
  onSelect: (question: string) => void;
  disabled: boolean;
  label?: string;
};

export function SuggestedQuestions({ questions, onSelect, disabled, label }: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-2 px-3 pt-2">
      <p className="text-xs font-medium text-muted-foreground/70">
        {label ?? "Try asking:"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            disabled={disabled}
            className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 
                       px-3 py-1 text-xs font-medium text-muted-foreground 
                       hover:bg-muted/60 hover:text-foreground 
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
