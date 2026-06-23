/** Decorative product preview — DESIGN.md Resume Preview Card pattern */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none" aria-hidden>
      {/* Floating skill chips */}
      <div className="absolute -top-3 right-4 z-10 rotate-2 rounded-full border border-chalk bg-paper px-3 py-1.5 text-xs font-medium text-iris">
        React · TypeScript
      </div>
      <div className="absolute -bottom-2 left-2 z-10 -rotate-1 rounded-full border border-chalk bg-paper px-3 py-1.5 text-xs font-medium text-signal-blue">
        5 yrs experience
      </div>

      {/* Main preview card */}
      <div className="rotate-1 rounded-lg border border-chalk bg-paper p-5 transition-transform duration-500 hover:rotate-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-2.5 w-28 rounded bg-carbon/80" />
            <div className="h-2 w-20 rounded bg-fog/40" />
          </div>
          <div className="rounded-full bg-mint-whisper px-2.5 py-1 text-xs font-semibold text-success">
            87 ATS
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="h-2 w-full rounded bg-mist" />
          <div className="h-2 w-11/12 rounded bg-mist" />
          <div className="h-2 w-4/5 rounded bg-mist" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded border border-chalk bg-lavender-wash/50 p-3">
            <p className="eyebrow mb-1">Skills match</p>
            <p className="text-2xl font-semibold tabular-nums text-signal-blue">92</p>
          </div>
          <div className="rounded border border-chalk bg-mint-whisper/50 p-3">
            <p className="eyebrow mb-1">Experience</p>
            <p className="text-2xl font-semibold tabular-nums text-success">78</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Node.js", "AWS", "Agile"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-medium text-pencil"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
