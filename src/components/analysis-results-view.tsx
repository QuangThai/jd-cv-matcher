"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import { JDSummaryCard } from "@/components/jd-summary-card";
import { CandidateOverviewTable } from "@/components/candidate-overview-table";
import { RankingTable } from "@/components/ranking-table";
import { CandidateAnalysisCard } from "@/components/candidate-analysis-card";
import { FinalRecommendationCard } from "@/components/final-recommendation-card";
import { ChatPanel } from "@/components/chat-panel";
import { RadarComparisonChart, ScoreDistributionChart } from "@/components/charts";
import { PdfExportButton } from "@/components/pdf-export";
import { Button } from "@/components/ui";
import type { MatchReport } from "@/lib/types/match";
import { cn } from "@/lib/utils/cn";

type SectionId = "overview" | "rankings" | "details" | "charts" | "chat";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "rankings", label: "Rankings" },
  { id: "details", label: "Candidate details" },
  { id: "charts", label: "Charts" },
  { id: "chat", label: "Ask Atlas" },
];

type Props = {
  report: MatchReport;
  session: Session | null;
  onNewAnalysis: () => void;
  backLabel?: string;
  pageTitle?: string;
  hideSaveActions?: boolean;
  showSaveDialog?: boolean;
  setShowSaveDialog?: (open: boolean) => void;
  saveTitle?: string;
  setSaveTitle?: (title: string) => void;
  saveError?: string | null;
  saveSuccess?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onOpenSaveDialog?: () => void;
};

export function AnalysisResultsView({
  report,
  session,
  onNewAnalysis,
  backLabel = "New analysis",
  pageTitle,
  hideSaveActions = false,
  showSaveDialog = false,
  setShowSaveDialog,
  saveTitle = "",
  setSaveTitle,
  saveError,
  saveSuccess = false,
  isSaving = false,
  onSave,
  onOpenSaveDialog,
}: Props) {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const topScore = report.finalRecommendation.topCandidateScore;
  const candidateCount = report.candidateOverview.length;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Results header */}
      <div className="results-hero surface-mist rounded-2xl border border-chalk">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              className="mb-4 flex items-center gap-1.5 text-sm text-pencil transition-colors hover:text-signal-blue"
              onClick={onNewAnalysis}
            >
              <span aria-hidden>←</span>
              <span>{backLabel}</span>
            </button>
            <p className="eyebrow mb-2">
              {pageTitle ? "Saved analysis" : "Analysis complete"}
            </p>
            <h2 className="text-balance text-2xl font-medium text-carbon sm:text-3xl">
              {pageTitle ?? report.jdSummary.jobTitle ?? "Screening results"}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <div className="stat-counter">
                <span className="stat-counter-value">{topScore}</span>
                <span className="stat-counter-label">top score</span>
              </div>
              <div className="hidden h-8 w-px bg-chalk sm:block" aria-hidden />
              <p className="text-sm text-pencil">
                {candidateCount} candidate{candidateCount !== 1 ? "s" : ""}{" "}
                analyzed
              </p>
              {report.finalRecommendation.topCandidateName && (
                <>
                  <div className="hidden h-8 w-px bg-chalk md:block" aria-hidden />
                  <p className="text-sm text-pencil">
                    Leading:{" "}
                    <span className="font-medium text-ink">
                      {report.finalRecommendation.topCandidateName}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {!hideSaveActions && (
              <>
                {session?.user ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenSaveDialog}
                    >
                      Save
                    </Button>
                    <PdfExportButton report={report} />
                    <Link href="/history">
                      <Button variant="outline" size="sm">
                        History
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/auth/signin">
                    <Button size="sm">Sign in to save</Button>
                  </Link>
                )}
              </>
            )}
            {hideSaveActions && <PdfExportButton report={report} />}
          </div>
        </div>
      </div>

      {/* Section navigation */}
      <nav
        className="sticky top-16 z-40 -mx-1 flex gap-1 overflow-x-auto border-b border-chalk bg-paper/95 pb-px backdrop-blur-sm"
        aria-label="Analysis sections"
      >
        {SECTIONS.map((section) => {
          const hidden =
            section.id === "charts" && report.candidateAnalyses.length === 0;
          if (hidden) return null;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "border-signal-blue text-signal-blue"
                  : "border-transparent text-pencil hover:text-ink"
              )}
            >
              {section.label}
            </button>
          );
        })}
      </nav>

      {/* Section content */}
      <div className="min-h-[320px] space-y-6">
        {activeSection === "overview" && (
          <div className="space-y-6">
            <JDSummaryCard summary={report.jdSummary} />
            <CandidateOverviewTable candidates={report.candidateOverview} />
            <FinalRecommendationCard recommendation={report.finalRecommendation} />
          </div>
        )}

        {activeSection === "rankings" && (
          <RankingTable ranking={report.candidateRanking} />
        )}

        {activeSection === "details" && (
          <div className="space-y-5">
            {report.candidateAnalyses.map((analysis) => {
              const rank = report.candidateRanking.find(
                (r) => r.candidateId === analysis.candidateId
              );
              return (
                <CandidateAnalysisCard
                  key={analysis.candidateId}
                  analysis={analysis}
                  rank={rank?.rank}
                  defaultExpanded={rank?.rank === 1}
                />
              );
            })}
          </div>
        )}

        {activeSection === "charts" && report.candidateAnalyses.length > 0 && (
          <div className="analysis-section-card space-y-8">
            <div>
              <p className="eyebrow mb-2">Distribution</p>
              <h3 className="text-lg font-medium text-carbon">Score spread</h3>
            </div>
            <ScoreDistributionChart analyses={report.candidateAnalyses} />
            {report.candidateAnalyses.length > 1 && (
              <>
                <div className="border-t border-chalk pt-8">
                  <p className="eyebrow mb-2">Comparison</p>
                  <h3 className="text-lg font-medium text-carbon">
                    Multi-candidate radar
                  </h3>
                </div>
                <RadarComparisonChart analyses={report.candidateAnalyses} />
              </>
            )}
          </div>
        )}

        {activeSection === "chat" && (
          <ChatPanel report={report} defaultOpen />
        )}
      </div>

      {/* Save dialog */}
      {showSaveDialog && setShowSaveDialog && onSave && setSaveTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md space-y-5 rounded-xl border border-chalk bg-paper p-6">
            <h3 className="text-lg font-medium text-carbon">Save analysis</h3>
            {saveSuccess ? (
              <div className="rounded-lg border border-chalk bg-mint-whisper px-4 py-3 text-sm text-success">
                Saved successfully
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Name your analysis..."
                  className="input-field"
                  autoFocus
                />
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onSave}
                    disabled={isSaving || !saveTitle.trim()}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
