"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { FinalRecommendation } from "@/lib/types/match";

interface FinalRecommendationCardProps {
  recommendation: FinalRecommendation;
}

export function FinalRecommendationCard({
  recommendation,
}: FinalRecommendationCardProps) {
  return (
    <Card className="border-signal-blue/20 surface-lavender">
      <CardHeader>
        <p className="eyebrow mb-1">Hiring decision</p>
        <CardTitle>Final recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {recommendation.topCandidateName && (
          <div className="flex items-center gap-4 rounded-xl border border-chalk bg-paper p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-signal-blue text-xl font-semibold tabular-nums text-paper">
              {recommendation.topCandidateScore}
            </div>
            <div>
              <p className="font-medium text-carbon">
                Top candidate: {recommendation.topCandidateName}
              </p>
              <p className="mt-0.5 text-sm text-pencil">
                Score {recommendation.topCandidateScore}/100 —{" "}
                {recommendation.totalCandidates} candidate
                {recommendation.totalCandidates > 1 ? "s" : ""} analyzed
              </p>
            </div>
          </div>
        )}

        <p className="text-sm leading-relaxed text-pencil">
          {recommendation.explanation}
        </p>

        <div className="rounded-xl border border-chalk bg-paper p-5">
          <p className="eyebrow">Hiring advice</p>
          <p className="mt-2 text-sm leading-relaxed text-pencil">
            {recommendation.hiringAdvice}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
