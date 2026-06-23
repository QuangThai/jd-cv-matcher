"use client";

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  files?: string[];
  phase?: string;
}

export function AnalysisProgress({
  isAnalyzing,
  files = [],
  phase,
}: AnalysisProgressProps) {
  if (!isAnalyzing) return null;

  return (
    <div className="rounded-lg border border-chalk bg-paper p-6">
      <div className="flex items-center gap-3">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-signal-blue border-t-transparent"
          aria-hidden
        />
        <div>
          <p className="font-medium text-ink">Analyzing</p>
          {phase && <p className="text-sm text-pencil">{phase}</p>}
        </div>
      </div>
      {files.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-pencil"
            >
              <svg
                className="size-3.5 shrink-0 text-fog"
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
              <span className="truncate">{file}</span>
              <span className="text-xs text-success">Done</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
