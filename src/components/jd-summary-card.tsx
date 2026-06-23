"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { JDSummary as JDSummaryType } from "@/lib/types/match";

interface JDSummaryCardProps {
  summary: JDSummaryType;
}

export function JDSummaryCard({ summary }: JDSummaryCardProps) {
  const stats = [
    { label: "Required skills", value: summary.requiredSkillCount },
    { label: "Preferred skills", value: summary.preferredSkillCount },
    ...(summary.yearsOfExperience
      ? [{ label: "Experience", value: summary.yearsOfExperience }]
      : []),
    {
      label: "Education required",
      value: summary.educationRequired ? "Yes" : "No",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="surface-mist border-b border-chalk">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>{summary.jobTitle || "Job description"}</span>
          {summary.seniorityLevel && (
            <span className="rounded-full bg-lavender-wash px-3 py-0.5 text-xs font-medium text-iris">
              {summary.seniorityLevel}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-chalk bg-paper p-4"
            >
              <p className="eyebrow">{s.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-carbon">
                {s.value}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-pencil">{summary.summary}</p>
      </CardContent>
    </Card>
  );
}
