"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PageFooter } from "@/components/page-footer";
import type { MatchReport } from "@/lib/types/match";

type LoadedAnalysis = {
  id: string;
  title: string;
  report: MatchReport;
};

type ScoreKeys = Exclude<
  keyof import("@/lib/types/match").ScoreBreakdown,
  "explanation"
>;

export default function CompareClient() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  const [analyses, setAnalyses] = useState<LoadedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status !== "authenticated") return;

    if (ids.length < 2) {
      setError("Select at least two analyses to compare.");
      setLoading(false);
      return;
    }

    Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/analyses/${id}`);
        if (!res.ok) throw new Error(`Failed to load analysis ${id}`);
        return res.json();
      })
    )
      .then((data) => {
        setAnalyses(
          data.map((d: { id: string; title: string; report: string }) => ({
            id: d.id,
            title: d.title,
            report: typeof d.report === "string" ? JSON.parse(d.report) : d.report,
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, ids, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-sm text-pencil">
          <div className="size-4 animate-spin rounded-full border-2 border-signal-blue border-r-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-medium text-carbon">Compare error</h1>
          <p className="text-sm text-pencil">{error}</p>
          <Link href="/history" className="text-sm text-signal-blue hover:underline">
            ← Back to history
          </Link>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (analyses.length < 2) return null;

  const [a, b] = analyses;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AppHeader />

      <main className="flex-1 py-10 sm:py-14">
        <div className="page-container mx-auto max-w-6xl space-y-8">
          <div className="section-band surface-mist sm:px-8">
            <Link
              href="/history"
              className="text-sm text-pencil transition-colors hover:text-signal-blue"
            >
              ← History
            </Link>
            <h1 className="mt-3 text-2xl font-medium text-carbon">
              Compare analyses
            </h1>
            <p className="mt-1 text-sm text-pencil">
              Side-by-side view of two saved screenings
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[a, b].map((analysis) => (
              <div
                key={analysis.id}
                className="rounded-xl border border-chalk bg-paper p-6"
              >
                <h3 className="mb-4 truncate font-medium text-ink">{analysis.title}</h3>
                <div className="space-y-2 text-sm">
                  <ComparisonRow
                    label="Top score"
                    a={a.report.finalRecommendation.topCandidateScore}
                    b={b.report.finalRecommendation.topCandidateScore}
                    current={analysis.report.finalRecommendation.topCandidateScore}
                    higherIsBetter
                  />
                  <ComparisonRow
                    label="Job title"
                    a={a.report.jdSummary.jobTitle ?? "N/A"}
                    b={b.report.jdSummary.jobTitle ?? "N/A"}
                    current={analysis.report.jdSummary.jobTitle ?? "N/A"}
                  />
                  <ComparisonRow
                    label="Candidates"
                    a={a.report.candidateOverview.length}
                    b={b.report.candidateOverview.length}
                    current={analysis.report.candidateOverview.length}
                  />
                  <ComparisonRow
                    label="Top candidate"
                    a={a.report.finalRecommendation.topCandidateName ?? "N/A"}
                    b={b.report.finalRecommendation.topCandidateName ?? "N/A"}
                    current={analysis.report.finalRecommendation.topCandidateName ?? "N/A"}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-chalk bg-paper p-6">
            <h2 className="mb-4 font-medium text-carbon">Score breakdown comparison</h2>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pr-4">Category</th>
                    <th className="px-4 text-right">{a.title}</th>
                    <th className="px-4 text-right">{b.title}</th>
                    <th className="pl-4 text-right">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {renderScoreRow("Required skills", "requiredSkills", a, b)}
                  {renderScoreRow("Experience", "relevantExperience", a, b)}
                  {renderScoreRow("Tools & platforms", "toolsAndPlatforms", a, b)}
                  {renderScoreRow("Seniority", "seniorityAndYears", a, b)}
                  {renderScoreRow("Domain knowledge", "domainKnowledge", a, b)}
                  {renderScoreRow("Education", "educationAndCertifications", a, b)}
                  {renderScoreRow("Soft skills", "softSkillsAndLanguages", a, b)}
                </tbody>
                <tfoot>
                  {renderScoreRow("Total", "total", a, b, true)}
                </tfoot>
              </table>
            </div>
          </div>

          {a.report.candidateRanking.length > 0 && b.report.candidateRanking.length > 0 && (
            <div className="rounded-xl border border-chalk bg-paper p-6">
              <h2 className="mb-4 font-medium text-carbon">Top candidates</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[a, b].map((analysis) => (
                  <div key={analysis.id}>
                    <p className="eyebrow mb-3">{analysis.title}</p>
                    <div className="space-y-2">
                      {analysis.report.candidateRanking.slice(0, 3).map((c) => (
                        <div
                          key={c.candidateId}
                          className="flex items-center justify-between rounded-lg border border-chalk bg-mist/50 px-3 py-2 text-sm"
                        >
                          <span className="truncate text-ink">
                            {c.candidateName ?? "Unknown"}
                          </span>
                          <span className="font-semibold tabular-nums text-signal-blue">
                            {c.matchScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}

function ComparisonRow({
  label,
  a,
  b,
  current,
  higherIsBetter,
}: {
  label: string;
  a: string | number;
  b: string | number;
  current: string | number;
  higherIsBetter?: boolean;
}) {
  const isDiff =
    typeof a === "number" && typeof b === "number" && a !== b;
  const isBetter =
    typeof a === "number" && typeof b === "number" && higherIsBetter
      ? current === Math.max(a, b)
      : false;

  return (
    <div className="flex items-center justify-between border-b border-chalk py-2 last:border-0">
      <span className="text-pencil">{label}</span>
      <span
        className={
          isDiff && isBetter
            ? "font-medium text-success"
            : isDiff && !isBetter
              ? "text-warning"
              : "text-ink"
        }
      >
        {current}
        {isDiff && (isBetter ? " ↑" : " ↓")}
      </span>
    </div>
  );
}

function renderScoreRow(
  label: string,
  key: ScoreKeys,
  a: LoadedAnalysis,
  b: LoadedAnalysis,
  isTotal?: boolean
) {
  const aScore = a.report.candidateAnalyses[0]?.scoreBreakdown[key] ?? 0;
  const bScore = b.report.candidateAnalyses[0]?.scoreBreakdown[key] ?? 0;
  const diff = (aScore as number) - (bScore as number);

  return (
    <tr
      key={key}
      className={isTotal ? "border-t-2 border-chalk font-semibold" : ""}
    >
      <td className="pr-4 text-ink">{label}</td>
      <td className={`px-4 text-right tabular-nums ${diff > 0 ? "text-success" : ""}`}>
        {aScore}
      </td>
      <td className={`px-4 text-right tabular-nums ${diff < 0 ? "text-success" : ""}`}>
        {bScore}
      </td>
      <td
        className={`pl-4 text-right tabular-nums ${
          diff > 0 ? "text-success" : diff < 0 ? "text-warning" : "text-fog"
        }`}
      >
        {diff > 0 ? `+${diff}` : diff === 0 ? "—" : `${diff}`}
      </td>
    </tr>
  );
}
