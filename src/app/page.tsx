"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { HeroPreview } from "@/components/hero-preview";
import { FeatureTiles } from "@/components/feature-tiles";
import { PageFooter } from "@/components/page-footer";
import { JDInput } from "@/components/jd-input";
import { CVMultiUpload } from "@/components/cv-multi-upload";
import { AnalysisSubmitButton } from "@/components/analysis-submit-button";
import { AnalysisProgress } from "@/components/analysis-progress";
import { AnalysisResultsView } from "@/components/analysis-results-view";
import { ErrorBoundary } from "@/components/error-boundary";
import { SkeletonResults } from "@/components/skeleton";
import { BatchProgress } from "@/components/batch-progress";
import { parseBatchSSE } from "@/lib/files/sse-parser";
import { Button } from "@/components/ui";
import type { MatchReport } from "@/lib/types/match";

function StepIcon({ step, active }: { step: string; active?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded text-sm font-medium ${
        active
          ? "border-2 border-signal-blue bg-lavender-wash text-signal-blue"
          : "border border-chalk bg-paper text-fog"
      }`}
      aria-hidden
    >
      {step}
    </span>
  );
}

function EmptyState() {
  const steps = [
    {
      step: "1",
      title: "Add a job description",
      desc: "Paste text or upload PDF, DOCX, or TXT",
      active: true,
    },
    {
      step: "2",
      title: "Upload candidate CVs",
      desc: "One file or many — batch upload supported",
    },
    {
      step: "3",
      title: "Review evidence-based results",
      desc: "Ranked scores, snippets, and hiring guidance",
    },
  ];

  return (
    <section className="animate-fade-in space-y-16">
      {/* Hero — two-column per DESIGN.md */}
      <div className="section-band surface-mist sm:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow mb-4">Evidence-first screening</p>
            <h1 className="max-w-xl text-balance">
              Match candidates to roles with{" "}
              <span className="text-signal-blue">clear evidence</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-pencil">
              Upload a job description and CVs. Atlas scores fit from document
              content — not guesswork — so you can shortlist with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="stat-counter">
                <span className="stat-counter-value">7</span>
                <span className="stat-counter-label">score dimensions</span>
              </div>
              <div className="hidden h-8 w-px bg-chalk sm:block" aria-hidden />
              <p className="text-sm text-pencil">
                PDF · DOCX · TXT supported
              </p>
            </div>
          </div>
          <HeroPreview />
        </div>
      </div>

      {/* Feature tiles — 4-up pattern */}
      <div>
        <p className="eyebrow mb-6">What you get</p>
        <FeatureTiles />
      </div>

      {/* Step list card */}
      <div>
        <p className="eyebrow mb-4">How it works</p>
        <div className="overflow-hidden rounded-xl border border-ash bg-paper">
          {steps.map((item, i) => (
            <div
              key={item.step}
              className={`flex items-start gap-4 px-5 py-5 transition-colors ${
                item.active
                  ? "border-l-2 border-l-signal-blue bg-lavender-wash/30"
                  : "border-l-2 border-l-transparent"
              } ${i < steps.length - 1 ? "border-b border-chalk" : ""}`}
            >
              <StepIcon step={item.step} active={item.active} />
              <div className="flex-1">
                <p
                  className={`font-medium ${item.active ? "text-signal-blue" : "text-ink"}`}
                >
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-pencil">{item.desc}</p>
              </div>
              <svg
                className="mt-1 size-4 shrink-0 text-haze"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ErrorAlert({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="animate-scale-in rounded-lg border border-chalk bg-blush-whisper p-5 text-sm"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-semibold text-destructive"
          aria-hidden
        >
          !
        </span>
        <div className="flex-1">
          <p className="font-medium text-destructive">Something went wrong</p>
          <p className="mt-1 text-pencil">{message}</p>
          <p className="mt-1 text-xs text-fog">
            Supported: PDF, DOCX, TXT · Max 10 MB per file
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-pencil underline hover:text-ink"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [phase, setPhase] = useState("");
  const [report, setReport] = useState<MatchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [batchStatuses, setBatchStatuses] = useState<
    {
      fileId: string;
      name: string;
      status: "queued" | "extracting" | "analyzing" | "done" | "error";
      error?: string;
    }[]
  >([]);
  const [batchPhase, setBatchPhase] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!report || !saveTitle.trim()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: saveTitle.trim(), report }),
      });
      if (res.status === 401) {
        setSaveError("Please sign in to save analyses.");
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveDialog(false);
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!jdText?.trim() && !jdFile) {
      setError("Please provide a Job Description. Paste text or upload a file.");
      return;
    }
    if (cvFiles.length === 0) {
      setError("Please upload at least one CV file.");
      return;
    }

    setError(null);
    setReport(null);
    setIsAnalyzing(true);
    setPhase("Validating files...");

    try {
      const formData = new FormData();
      if (jdText?.trim()) formData.append("jdText", jdText);
      if (jdFile) formData.append("jdFile", jdFile);
      cvFiles.forEach((cv) => formData.append("cvFiles", cv));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120_000);

      setPhase("Extracting text from documents...");
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ error: `Server error (${response.status})` }));
        throw new Error(err.error || "Analysis failed");
      }

      setPhase("Building results...");
      const data = await response.json();
      if (!data.report) throw new Error("Invalid response: missing report");
      setReport(data.report);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Analysis timed out. Try fewer or smaller files.");
      } else {
        setError(err instanceof Error ? err.message : "Unexpected error");
      }
    } finally {
      setIsAnalyzing(false);
      setPhase("");
    }
  }, [jdText, jdFile, cvFiles]);

  const abortRef = useRef<AbortController | null>(null);

  const handleBatchAnalyze = useCallback(async () => {
    if (!jdText?.trim() && !jdFile) {
      setError("Please provide a Job Description.");
      return;
    }
    if (cvFiles.length === 0) {
      setError("Please upload at least one CV file.");
      return;
    }

    setError(null);
    setReport(null);
    setIsAnalyzing(true);
    setBatchPhase("Preparing...");
    setBatchStatuses(
      cvFiles.map((f, i) => ({
        fileId: `cv-${i}`,
        name: f.name,
        status: "queued" as const,
      }))
    );

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const formData = new FormData();
      if (jdText?.trim()) formData.append("jdText", jdText);
      if (jdFile) formData.append("jdFile", jdFile);
      cvFiles.forEach((cv) => formData.append("cvFiles", cv));

      const res = await fetch("/api/analyze/batch", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          text.includes("error")
            ? JSON.parse(text.split("\n")[0]?.slice(6) || "{}")?.message ||
                `Server error (${res.status})`
            : `Server error (${res.status})`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      for await (const event of parseBatchSSE(reader)) {
        switch (event.type) {
          case "phase":
            setBatchPhase(event.phase);
            break;
          case "cv-status":
            setBatchStatuses((prev) =>
              prev.map((s) =>
                s.fileId === event.fileId
                  ? { ...s, status: event.status, error: event.error }
                  : s
              )
            );
            break;
          case "cv-result":
            break;
          case "complete":
            setReport(event.report);
            break;
          case "error":
            setError(event.message);
            break;
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Batch processing cancelled.");
      } else {
        setError(err instanceof Error ? err.message : "Batch processing failed");
      }
    } finally {
      setIsAnalyzing(false);
      setBatchPhase("");
      abortRef.current = null;
    }
  }, [jdText, jdFile, cvFiles]);

  const canAnalyze = useMemo(
    () => (!!jdText?.trim() || !!jdFile) && cvFiles.length > 0,
    [jdText, jdFile, cvFiles]
  );

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-paper">
        <AppHeader />

        <main className="flex-1 py-10 sm:py-14">
          <div className="page-container">
            <div className="mx-auto max-w-5xl space-y-12">
              {!report && !isAnalyzing && !error && <EmptyState />}

              {error && (
                <ErrorAlert message={error} onDismiss={() => setError(null)} />
              )}

              {!report && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <JDInput
                    onJDTextChange={setJdText}
                    onJDFileChange={setJdFile}
                  />
                  <CVMultiUpload onCVFilesChange={setCvFiles} />
                </div>
              )}

              {!report && !isAnalyzing && (
                <div className="flex flex-col items-center gap-3">
                  <AnalysisSubmitButton
                    onClick={
                      cvFiles.length > 5 ? handleBatchAnalyze : handleAnalyze
                    }
                    disabled={!canAnalyze}
                    isAnalyzing={false}
                  />
                  {cvFiles.length > 5 && (
                    <p className="text-xs text-fog">
                      {cvFiles.length} CVs — batch mode with live progress
                    </p>
                  )}
                </div>
              )}

              {isAnalyzing && (
                <div className="flex justify-center">
                  {batchStatuses.length > 0 ? (
                    <div className="w-full max-w-lg">
                      <BatchProgress
                        statuses={batchStatuses}
                        phase={batchPhase}
                        onCancel={() => abortRef.current?.abort()}
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-md space-y-4">
                      <AnalysisProgress
                        isAnalyzing
                        phase={phase}
                        files={cvFiles.map((f) => f.name)}
                      />
                      <div className="pointer-events-none opacity-20">
                        <SkeletonResults />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {report && (
                <AnalysisResultsView
                  report={report}
                  session={session}
                  onNewAnalysis={() => {
                    setReport(null);
                    setError(null);
                  }}
                  showSaveDialog={showSaveDialog}
                  setShowSaveDialog={setShowSaveDialog}
                  saveTitle={saveTitle}
                  setSaveTitle={setSaveTitle}
                  saveError={saveError}
                  saveSuccess={saveSuccess}
                  isSaving={isSaving}
                  onSave={handleSave}
                  onOpenSaveDialog={() => {
                    setSaveTitle(
                      `Analysis: ${report.jdSummary.jobTitle ?? "Untitled"} — ${new Date().toLocaleDateString()}`
                    );
                    setSaveSuccess(false);
                    setShowSaveDialog(true);
                  }}
                />
              )}
            </div>
          </div>
        </main>

        <PageFooter />
      </div>
    </ErrorBoundary>
  );
}
