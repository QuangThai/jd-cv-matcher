"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PageFooter } from "@/components/page-footer";
import { Button } from "@/components/ui";

type AnalysisItem = {
  id: string;
  title: string;
  jobTitle: string | null;
  candidateCount: number;
  topScore: number;
  matchLevel: string | null;
  createdAt: string;
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(query ? { q: query } : {}),
      });
      const res = await fetch(`/api/analyses?${params}`);
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch analyses");
      const data = await res.json();
      setAnalyses(data.analyses);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, query, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalyses();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, fetchAnalyses, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this analysis?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-2 text-sm text-pencil">
          <div className="size-4 animate-spin rounded-full border-2 border-signal-blue border-r-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AppHeader />

      <main className="flex-1 py-10 sm:py-14">
        <div className="page-container mx-auto max-w-4xl space-y-8">
          {/* Page header band */}
          <div className="section-band surface-mist sm:px-8">
            <Link
              href="/"
              className="text-sm text-pencil transition-colors hover:text-signal-blue"
            >
              ← Back to analysis
            </Link>
            <h1 className="mt-3 text-2xl font-medium text-carbon sm:text-3xl">
              Analysis history
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div className="stat-counter">
                <span className="stat-counter-value">{total}</span>
                <span className="stat-counter-label">
                  saved {total === 1 ? "analysis" : "analyses"}
                </span>
              </div>
              {session?.user && (
                <p className="text-sm text-pencil">
                  {session.user.name ?? session.user.email}
                </p>
              )}
            </div>
          </div>

          <label className="block">
            <span className="sr-only">Search analyses by title</span>
            <div className="flex items-center gap-3 rounded border border-chalk bg-paper px-4 py-2.5">
              <svg
                className="size-4 shrink-0 text-fog"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title..."
                className="search-input min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-ink placeholder:text-fog shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-lg border border-chalk bg-blush-whisper px-4 py-3 text-sm text-destructive">
              {error}
              <button
                type="button"
                onClick={fetchAnalyses}
                className="ml-2 underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-mist"
                />
              ))}
            </div>
          )}

          {!loading && !error && analyses.length === 0 && (
            <div className="flex flex-col items-center rounded-xl border border-chalk bg-paper py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-chalk bg-mist">
                <svg
                  className="size-6 text-iris"
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
              <h2 className="text-lg font-medium text-carbon">
                {query ? "No matching analyses" : "No saved analyses yet"}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-pencil">
                {query
                  ? "Try a different search term."
                  : "Run an analysis and save it to see it here."}
              </p>
              {!query && (
                <Link href="/" className="mt-6">
                  <Button>Run analysis</Button>
                </Link>
              )}
            </div>
          )}

          {!loading && analyses.length > 0 && (
            <div className="space-y-3">
              {analyses.map((a) => (
                <div
                  key={a.id}
                  className="group rounded-xl border border-chalk bg-paper p-5 transition-colors hover:border-ash"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/history/${a.id}`} className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-ink group-hover:text-signal-blue">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-xs text-pencil">
                        {a.jobTitle ?? "No job title"} · {a.candidateCount}{" "}
                        {a.candidateCount === 1 ? "candidate" : "candidates"} ·{" "}
                        {new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {/* Score bar preview */}
                      <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-mist">
                        <div
                          className="score-bar h-full rounded-full bg-signal-blue"
                          style={{ width: `${a.topScore}%` }}
                        />
                      </div>
                    </Link>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-semibold tabular-nums text-signal-blue">
                          {a.topScore}
                        </p>
                        <p className="text-xs text-fog">
                          {a.matchLevel ?? "N/A"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        disabled={deleting === a.id}
                        className="text-xs text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:underline disabled:opacity-40"
                      >
                        {deleting === a.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-2 text-sm text-pencil">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
