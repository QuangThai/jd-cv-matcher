"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PageFooter } from "@/components/page-footer";
import { Button } from "@/components/ui";
import type { MatchReport } from "@/lib/types/match";

const DB_FEATURES_DISABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_DISABLE_DB_FEATURES === "true";

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

  if (DB_FEATURES_DISABLED) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-chalk bg-mist">
              <svg className="size-7 text-fog" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-medium text-carbon">Comparison unavailable</h1>
            <p className="mt-3 text-sm text-pencil">
              Saved analysis comparison is disabled in this environment.
            </p>
            <Link href="/" className="mt-8 inline-block">
              <Button>Back to analysis</Button>
            </Link>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status !== "authenticated" || ids.length < 2) {
      if (status === "authenticated" && ids.length < 2) {
        setError("Select at least two analyses to compare.");
        setLoading(false);
      }
      return;
    }

    Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/analyses/${id}`);
        if (!res.ok) throw new Error(`Failed to load analysis ${id}`);
        const data = await res.json();
        return { id, title: data.title ?? "Untitled", report: data.report } as LoadedAnalysis;
      })
    )
      .then(setAnalyses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, ids, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-sm text-pencil">
          <div className="size-4 animate-spin rounded-full border-2 border-signal-blue border-r-transparent" />
          Loading comparison...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Link href="/history" className="mt-4 text-sm text-signal-blue hover:underline">
            ← Back to history
          </Link>
        </main>
        <PageFooter />
      </div>
    );
  }

  if (analyses.length < 2) return null;

  // Build comparison table
  const allCandidates = analyses.flatMap((a) =>
    a.report.candidateOverview.map((c) => ({ ...c, analysisTitle: a.title }))
  );
  const scoreKeys: ScoreKeys[] = [
    "requiredSkills",
    "relevantExperience",
    "toolsAndPlatforms",
    "seniorityAndYears",
    "domainKnowledge",
    "educationAndCertifications",
    "softSkillsAndLanguages",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AppHeader />

      <main className="flex-1 py-10 sm:py-14">
        <div className="page-container mx-auto max-w-7xl space-y-8">
          <div className="section-band surface-mist sm:px-8">
            <Link
              href="/history"
              className="text-sm text-pencil transition-colors hover:text-signal-blue"
            >
              ← Back to history
            </Link>
            <h1 className="mt-3 text-2xl font-medium text-carbon sm:text-3xl">
              Compare analyses
            </h1>
            <p className="mt-2 text-sm text-pencil">
              {analyses.map((a) => a.title).join(" vs ")}
            </p>
          </div>

          {/* Score comparison table */}
          <div className="overflow-x-auto rounded-xl border border-chalk">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-chalk bg-mist">
                  <th className="px-4 py-3 text-left font-medium text-ink">Candidate</th>
                  <th className="px-4 py-3 text-left font-medium text-ink">Analysis</th>
                  <th className="px-4 py-3 text-right font-medium text-ink">Overall</th>
                  {scoreKeys.map((key) => (
                    <th key={key} className="px-4 py-3 text-right font-medium text-ink">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allCandidates.map((c, i) => {
                  const analysis = analyses.find((a) => a.title === c.analysisTitle);
                  const breakdown = analysis?.report.candidateAnalyses.find(
                    (ca) => ca.candidateId === c.candidateId
                  )?.scoreBreakdown;
                  return (
                    <tr key={`${c.analysisTitle}-${c.candidateId}`} className={i < allCandidates.length - 1 ? "border-b border-chalk" : ""}>
                      <td className="px-4 py-3 font-medium text-ink">{c.candidateName ?? `Candidate ${c.candidateId}`}</td>
                      <td className="px-4 py-3 text-pencil">{c.analysisTitle}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-signal-blue">{c.matchScore}</td>
                      {scoreKeys.map((key) => (
                        <td key={key} className="px-4 py-3 text-right tabular-nums text-pencil">
                          {breakdown?.[key] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
