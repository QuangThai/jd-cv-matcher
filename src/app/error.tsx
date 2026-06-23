"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        An unexpected error occurred while loading this page.
        {error.digest && (
          <span className="mt-1 block text-xs opacity-60">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        onClick={reset}
      >
        Try Again
      </button>
    </div>
  );
}
