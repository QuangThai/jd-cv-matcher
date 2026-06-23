export function PageFooter() {
  return (
    <footer className="mt-auto border-t border-chalk bg-paper">
      <div className="page-container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <div>
          <p className="text-lg font-semibold text-carbon">Atlas Match</p>
          <p className="mt-1 text-sm text-pencil">
            Evidence-first screening — verify results against original documents
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-fog">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-mint-whisper text-[10px] font-bold text-success">
              ✓
            </span>
            Document-grounded
          </span>
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-lavender-wash text-[10px] font-bold text-iris">
              #
            </span>
            Ranked scores
          </span>
        </div>
      </div>
    </footer>
  );
}
