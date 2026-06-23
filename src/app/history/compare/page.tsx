import { Suspense } from "react";
import CompareClient from "./compare-client";

export const dynamic = "force-dynamic";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="flex items-center gap-2 text-sm text-pencil">
            <div className="size-4 animate-spin rounded-full border-2 border-signal-blue border-r-transparent" />
            Loading compare view...
          </div>
        </div>
      }
    >
      <CompareClient />
    </Suspense>
  );
}
