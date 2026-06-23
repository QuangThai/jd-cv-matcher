"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { MatchScoreBadge } from "./match-score-badge";
import { ScoreBreakdownChart } from "./charts";
import type { CandidateAnalysis } from "@/lib/types/match";

interface CandidateAnalysisCardProps {
  analysis: CandidateAnalysis;
  rank?: number;
}

export function CandidateAnalysisCard({
  analysis,
  rank,
}: CandidateAnalysisCardProps) {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3">
          {rank && (
            <span className="flex h-7 w-7 items-center justify-center rounded border border-chalk bg-lavender-wash text-sm font-semibold text-iris">
              {rank}
            </span>
          )}
          <span>{analysis.candidateName || "Unnamed Candidate"}</span>
          <MatchScoreBadge score={analysis.scoreBreakdown.total} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7 pt-5">
        {/* Score Breakdown */}
        <section>
          <h4 className="eyebrow mb-3">
            Score breakdown
          </h4>
          <div className="space-y-2.5">
            {[
              { label: "Required Skills", value: analysis.scoreBreakdown.requiredSkills, color: "bg-signal-blue" },
              { label: "Experience", value: analysis.scoreBreakdown.relevantExperience, color: "bg-deep-signal" },
              { label: "Tools & Platforms", value: analysis.scoreBreakdown.toolsAndPlatforms, color: "bg-iris" },
              { label: "Education & Certs", value: analysis.scoreBreakdown.educationAndCertifications, color: "bg-midnight" },
              { label: "Soft Skills", value: analysis.scoreBreakdown.softSkillsAndLanguages, color: "bg-fog" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-36 text-sm text-pencil">{item.label}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`score-bar h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-sm font-medium tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Matched */}
        {analysis.matchedRequirements.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-semibold text-success">
              Matched Requirements
            </h4>
            <ul className="space-y-1.5">
              {analysis.matchedRequirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-success/60">•</span>
                  <div>
                    <span className="font-medium">{r.requirement}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">({r.priority})</span>
                    <p className="text-muted-foreground">{r.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Partial */}
        {analysis.partiallyMatchedRequirements.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-medium text-warning">
              Partially matched
            </h4>
            <ul className="space-y-1.5">
              {analysis.partiallyMatchedRequirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-warning/60">•</span>
                  <div>
                    <span className="font-medium">{r.requirement}</span>
                    <p className="text-muted-foreground">{r.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Missing */}
        {analysis.missingRequirements.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-medium text-destructive">
              Missing requirements
            </h4>
            <ul className="space-y-1.5">
              {analysis.missingRequirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-destructive/60">•</span>
                  <div>
                    <span className="font-medium">{r.requirement}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">({r.priority})</span>
                    <p className="italic text-muted-foreground/70">{r.evidenceStatus}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Concerns */}
        {analysis.weaknessesOrConcerns.length > 0 && (
          <section>
            <h4 className="mb-2 text-sm font-medium text-warning">
              Concerns
            </h4>
            <ul className="space-y-1.5">
              {analysis.weaknessesOrConcerns.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-pencil">
                  <span className="mt-0.5 text-warning">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Score Breakdown Chart */}
        <ScoreBreakdownChart analysis={analysis} />

        {/* Summary */}
        <div className="rounded-lg border border-chalk bg-mist p-4">
          <p className="eyebrow">Recruiter summary</p>
          <p className="mt-1.5 text-sm leading-relaxed text-pencil">
            {analysis.recruiterSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
