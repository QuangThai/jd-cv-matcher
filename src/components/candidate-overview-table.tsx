"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { MatchScoreBadge, MatchLevelBadge, RecommendationBadge } from "./match-score-badge";
import type { CandidateOverview } from "@/lib/types/match";

interface CandidateOverviewTableProps {
  candidates: CandidateOverview[];
}

export function CandidateOverviewTable({
  candidates,
}: CandidateOverviewTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="text-left">
                <th className="pr-4">Name</th>
                <th className="pr-4">Score</th>
                <th className="pr-4">Match level</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.candidateId}>
                  <td className="pr-4 font-medium text-ink">
                    {c.candidateName || "Unnamed Candidate"}
                  </td>
                  <td className="pr-4">
                    <MatchScoreBadge score={c.matchScore} />
                  </td>
                  <td className="pr-4">
                    <MatchLevelBadge level={c.matchLevel} />
                  </td>
                  <td>
                    <RecommendationBadge recommendation={c.recommendation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
