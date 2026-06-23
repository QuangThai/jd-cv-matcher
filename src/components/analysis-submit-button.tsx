"use client";

import { Button } from "@/components/ui";

interface AnalysisSubmitButtonProps {
  onClick: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

export function AnalysisSubmitButton({
  onClick,
  disabled,
  isAnalyzing,
}: AnalysisSubmitButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="min-w-[220px]"
    >
      {isAnalyzing ? (
        <span className="flex items-center gap-2">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          Analyzing...
        </span>
      ) : (
        "Start analysis"
      )}
    </Button>
  );
}
