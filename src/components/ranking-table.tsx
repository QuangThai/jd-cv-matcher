"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { MatchScoreBadge, MatchLevelBadge, RecommendationBadge } from "./match-score-badge";
import type { CandidateRankingItem } from "@/lib/types/match";

interface RankingTableProps {
  ranking: CandidateRankingItem[];
}

export function RankingTable({ ranking }: RankingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="text-left">
                <th className="pr-2">Rank</th>
                <th className="pr-4">Name</th>
                <th className="pr-4">Score</th>
                <th className="pr-4">Level</th>
                <th className="pr-4">Recommendation</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((c) => (
                <tr key={c.candidateId}>
                  <td className="pr-2">
                    <span
                      className={`rank-badge ${c.rank === 1 ? "rank-badge-1" : "rank-badge-n"}`}
                    >
                      {c.rank}
                    </span>
                  </td>
                  <td className="pr-4 font-medium text-ink">
                    {c.candidateName || "Unnamed"}
                  </td>
                  <td className="pr-4">
                    <MatchScoreBadge score={c.matchScore} />
                  </td>
                  <td className="pr-4">
                    <MatchLevelBadge level={c.matchLevel} />
                  </td>
                  <td className="pr-4">
                    <RecommendationBadge recommendation={c.recommendation} />
                  </td>
                  <td className="text-pencil">{c.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
