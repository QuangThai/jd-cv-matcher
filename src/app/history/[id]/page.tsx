"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PageFooter } from "@/components/page-footer";
import { AnalysisResultsView } from "@/components/analysis-results-view";
import type { MatchReport } from "@/lib/types/match";
import { Button } from "@/components/ui";

const DB_FEATURES_DISABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_DISABLE_DB_FEATURES === "true";

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [report, setReport] = useState<MatchReport | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (DB_FEATURES_DISABLED) return;
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status !== "authenticated" || !id) return;

    setLoading(true);
    fetch(`/api/analyses/${id}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/auth/signin");
          return null;
        }
        if (res.status === 404) {
          setError("Analysis not found");
          return null;
        }
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setTitle(data.title);
          setReport(data.report);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, id, router]);

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
            <h1 className="text-2xl font-medium text-carbon">Saved analyses unavailable</h1>
            <p className="mt-3 text-sm text-pencil">
              Analysis history is disabled in this environment.
              Your current session results are still available.
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

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-sm text-pencil">
          <div className="size-4 animate-spin rounded-full border-2 border-signal-blue border-r-transparent" />
          Loading analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-chalk bg-mist">
            <svg
              className="size-6 text-fog"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-carbon">Analysis not found</h1>
          <p className="text-sm text-pencil">{error}</p>
          <Link
            href="/history"
            className="text-sm text-signal-blue hover:underline"
          >
            ← Back to history
          </Link>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AppHeader />

      <main className="flex-1 py-10 sm:py-14">
        <div className="page-container mx-auto max-w-5xl">
          <AnalysisResultsView
            report={report}
            session={session}
            pageTitle={title}
            backLabel="History"
            hideSaveActions
            onNewAnalysis={() => router.push("/history")}
          />
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
