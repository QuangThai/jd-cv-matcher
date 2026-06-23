"use client";

import { Badge } from "@/components/ui";
import type { MatchLevel, Recommendation } from "@/lib/types/match";

export function MatchScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 85
      ? "bg-mint-whisper text-success"
      : score >= 70
        ? "bg-lavender-wash text-signal-blue"
        : score >= 50
          ? "bg-blush-whisper text-warning"
          : "bg-blush-whisper text-destructive";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${tone}`}
    >
      {score}
      <span className="ml-0.5 text-[0.7em] font-normal opacity-70">/100</span>
    </span>
  );
}

export function MatchLevelBadge({ level }: { level: MatchLevel }) {
  const variant =
    level === "Excellent Match"
      ? "success"
      : level === "Good Match"
        ? "default"
        : level === "Partial Match"
          ? "warning"
          : "destructive";

  return (
    <Badge variant={variant as "success" | "default" | "warning" | "destructive"}>
      {level}
    </Badge>
  );
}

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const variant =
    recommendation === "Strongly Recommend"
      ? "success"
      : recommendation === "Recommend"
        ? "default"
        : recommendation === "Consider"
          ? "warning"
          : "destructive";

  return (
    <Badge variant={variant as "success" | "default" | "warning" | "destructive"}>
      {recommendation}
    </Badge>
  );
}
