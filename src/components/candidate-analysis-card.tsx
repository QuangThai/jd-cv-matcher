"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui";
import { MatchScoreBadge } from "./match-score-badge";
import { ScoreBreakdownChart } from "./charts";
import type { CandidateAnalysis, RequirementMatch, MissingRequirement } from "@/lib/types/match";
import { cn } from "@/lib/utils/cn";

interface CandidateAnalysisCardProps {
  analysis: CandidateAnalysis;
  rank?: number;
  defaultExpanded?: boolean;
}

function RequirementList({
  title,
  items,
  tone,
  variant = "match",
}: {
  title: string;
  items: RequirementMatch[] | MissingRequirement[];
  tone: "success" | "warning" | "destructive";
  variant?: "match" | "missing";
}) {
  if (items.length === 0) return null;

  const toneClasses = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <section className="rounded-xl border border-chalk bg-paper p-5">
      <h4 className={cn("mb-3 text-sm font-medium", toneClasses[tone])}>
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((r, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                tone === "success" && "bg-success",
                tone === "warning" && "bg-warning",
                tone === "destructive" && "bg-destructive"
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <span className="font-medium text-ink">{r.requirement}</span>
              <span className="ml-2 text-xs text-fog">({r.priority})</span>
              {variant === "match" && "explanation" in r && (
                <p className="mt-1 leading-relaxed text-pencil">{r.explanation}</p>
              )}
              {variant === "missing" && "evidenceStatus" in r && (
                <p className="mt-1 text-xs italic text-fog">{r.evidenceStatus}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CandidateAnalysisCard({
  analysis,
  rank,
  defaultExpanded = false,
}: CandidateAnalysisCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const scoreItems = [
    { label: "Required skills", value: analysis.scoreBreakdown.requiredSkills, color: "bg-signal-blue" },
    { label: "Experience", value: analysis.scoreBreakdown.relevantExperience, color: "bg-deep-signal" },
    { label: "Tools & platforms", value: analysis.scoreBreakdown.toolsAndPlatforms, color: "bg-iris" },
    { label: "Education & certs", value: analysis.scoreBreakdown.educationAndCertifications, color: "bg-midnight" },
    { label: "Soft skills", value: analysis.scoreBreakdown.softSkillsAndLanguages, color: "bg-fog" },
  ];

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-mist/40"
        aria-expanded={expanded}
      >
        {rank && (
          <span
            className={cn(
              "rank-badge mt-0.5",
              rank === 1 ? "rank-badge-1" : "rank-badge-n"
            )}
          >
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <CardTitle className="flex flex-wrap items-center gap-3 text-base sm:text-lg">
            <span>{analysis.candidateName || "Unnamed candidate"}</span>
            <MatchScoreBadge score={analysis.scoreBreakdown.total} />
          </CardTitle>
          <p className="mt-1.5 line-clamp-2 text-sm text-pencil">
            {analysis.recruiterSummary}
          </p>
        </div>
        <svg
          className={cn(
            "mt-1 size-5 shrink-0 text-fog transition-transform",
            expanded && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <CardContent className="space-y-6 border-t border-chalk pt-6">
          <section className="rounded-xl border border-chalk bg-mist/40 p-5">
            <h4 className="eyebrow mb-4">Score breakdown</h4>
            <div className="space-y-3">
              {scoreItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 text-sm text-pencil sm:w-36">
                    {item.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-paper">
                      <div
                        className={cn("score-bar h-2 rounded-full", item.color)}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-ink">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <RequirementList
              title="Matched requirements"
              items={analysis.matchedRequirements}
              tone="success"
            />
            <RequirementList
              title="Partially matched"
              items={analysis.partiallyMatchedRequirements}
              tone="warning"
            />
            <RequirementList
              title="Missing requirements"
              items={analysis.missingRequirements}
              tone="destructive"
              variant="missing"
            />
          </div>

          {analysis.weaknessesOrConcerns.length > 0 && (
            <section className="rounded-xl border border-chalk bg-blush-whisper/30 p-5">
              <h4 className="mb-3 text-sm font-medium text-warning">Concerns</h4>
              <ul className="space-y-2">
                {analysis.weaknessesOrConcerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-pencil">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-chalk bg-paper p-5">
            <ScoreBreakdownChart analysis={analysis} />
          </section>

          <div className="rounded-xl border border-chalk bg-lavender-wash/30 p-5">
            <p className="eyebrow">Recruiter summary</p>
            <p className="mt-2 text-sm leading-relaxed text-pencil">
              {analysis.recruiterSummary}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
