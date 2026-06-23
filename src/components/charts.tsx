"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import type { ScoreBreakdown, CandidateAnalysis } from "@/lib/types/match";

type Props = {
  analysis: CandidateAnalysis;
};

const CATEGORIES = [
  { key: "requiredSkills", label: "Skills" },
  { key: "relevantExperience", label: "Experience" },
  { key: "toolsAndPlatforms", label: "Tools" },
  { key: "seniorityAndYears", label: "Seniority" },
  { key: "domainKnowledge", label: "Domain" },
  { key: "educationAndCertifications", label: "Education" },
  { key: "softSkillsAndLanguages", label: "Soft Skills" },
] as const;

/** Horizontal bar chart showing one candidate's score breakdown */
export function ScoreBreakdownChart({ analysis }: Props) {
  const data = useMemo(
    () =>
      CATEGORIES.map(({ key, label }) => ({
        category: label,
        score: analysis.scoreBreakdown[key] ?? 0,
      })),
    [analysis]
  );

  return (
    <div className="w-full animate-fade-in">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Score Breakdown — {analysis.candidateName ?? "Unknown"}
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11 }}
            width={70}
          />
          <Tooltip
            formatter={(value: unknown) => [`${value}/100`, "Score"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="score"
            radius={[0, 4, 4, 0]}
            maxBarSize={16}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Radar chart comparing multiple candidates across all score dimensions */
type RadarProps = {
  analyses: CandidateAnalysis[];
};

export function RadarComparisonChart({ analyses }: RadarProps) {
  const data = useMemo(() => {
    if (analyses.length === 0) return [];
    return CATEGORIES.map(({ key, label }) => {
      const entry: Record<string, string | number> = { category: label };
      for (const a of analyses) {
        entry[a.candidateName ?? a.candidateId] = a.scoreBreakdown[key] ?? 0;
      }
      return entry;
    });
  }, [analyses]);

  const colors = [
    "hsl(var(--primary))",
    "hsl(142, 76%, 36%)",
    "hsl(38, 92%, 50%)",
    "hsl(262, 83%, 58%)",
    "hsl(0, 72%, 51%)",
  ];

  if (analyses.length === 0) return null;

  return (
    <div className="w-full animate-fade-in">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Candidate Comparison — Radar
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          {analyses.map((a, i) => (
            <Radar
              key={a.candidateId}
              name={a.candidateName ?? a.candidateId}
              dataKey={a.candidateName ?? a.candidateId}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Bar chart showing score distribution across all candidates (total scores) */
type DistributionProps = {
  analyses: CandidateAnalysis[];
};

export function ScoreDistributionChart({ analyses }: DistributionProps) {
  const data = useMemo(
    () =>
      analyses.map((a) => ({
        name: a.candidateName ?? a.candidateId,
        score: a.scoreBreakdown.total,
      })),
    [analyses]
  );

  if (analyses.length === 0) return null;

  return (
    <div className="w-full animate-fade-in">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Overall Score Comparison
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: unknown) => [`${value}/100`, "Score"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="score"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Empty chart placeholder shown when no data */
export function ChartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-3xl mb-2">📊</span>
      <p className="text-sm font-medium">No chart data available</p>
      <p className="text-xs text-muted-foreground mt-1">
        Run an analysis to see visualizations.
      </p>
    </div>
  );
}
