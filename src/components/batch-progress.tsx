"use client";

type CVStatusData = {
  fileId: string;
  name: string;
  status: "queued" | "extracting" | "analyzing" | "done" | "error";
  error?: string;
};

type BatchProgressProps = {
  statuses: CVStatusData[];
  phase: string;
  onCancel?: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  extracting: "Extracting text",
  analyzing: "Analyzing",
  done: "Complete",
  error: "Error",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-whisper text-[10px] font-bold text-success">
        ✓
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush-whisper text-[10px] font-bold text-destructive">
        !
      </span>
    );
  }
  if (status === "analyzing" || status === "extracting") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="size-3.5 animate-spin rounded-full border-2 border-signal-blue border-r-transparent" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist text-[10px] font-medium text-fog">
      ·
    </span>
  );
}

export function BatchProgress({ statuses, phase, onCancel }: BatchProgressProps) {
  const doneCount = statuses.filter((s) => s.status === "done" || s.status === "error").length;
  const total = statuses.length;

  return (
    <div className="animate-fade-in space-y-4 rounded-xl border border-chalk bg-paper p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-ink">Processing CVs</h3>
          <p className="mt-0.5 text-xs text-pencil">
            {phase} · {doneCount}/{total} complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-mist">
            <div
              className="score-bar h-full rounded-full bg-signal-blue transition-all duration-500"
              style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-pencil transition-colors hover:text-destructive"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[300px] space-y-1 overflow-y-auto">
        {statuses.map((cv) => (
          <div
            key={cv.fileId}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              cv.status === "error"
                ? "bg-blush-whisper/50"
                : cv.status === "done"
                  ? "bg-mint-whisper/50"
                  : "bg-mist/50"
            }`}
          >
            <StatusIcon status={cv.status} />
            <span className="min-w-0 flex-1 truncate">{cv.name}</span>
            <span className="shrink-0 text-xs text-fog">
              {STATUS_LABELS[cv.status] ?? cv.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
