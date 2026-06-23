"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type {
  CandidateEvidenceGraph,
  EvidenceGraphEdge,
  EvidenceGraphNode,
} from "@/lib/types/match";

const EDGE_COLORS: Record<string, string> = {
  MATCHED: "stroke-success",
  PARTIALLY_MATCHED: "stroke-warning",
  NOT_FOUND: "stroke-destructive/40",
  DISCUSSED: "stroke-muted-foreground/40",
  SUPPORTED_BY: "stroke-blue-400",
};

const EDGE_LABELS: Record<string, string> = {
  MATCHED: "✓ Matched",
  PARTIALLY_MATCHED: "~ Partial",
  NOT_FOUND: "✕ Not Found",
  DISCUSSED: "? Discussed",
};

function GraphEdge({
  edge,
  index,
  total,
}: {
  edge: EvidenceGraphEdge;
  index: number;
  total: number;
}) {
  const y = 40 + index * 28;
  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        edge.type === "NOT_FOUND" ? "opacity-50" : ""
      }`}
    >
      <span
        className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
          edge.type === "MATCHED"
            ? "bg-success/10 text-success"
            : edge.type === "PARTIALLY_MATCHED"
              ? "bg-warning/10 text-warning"
              : edge.type === "NOT_FOUND"
                ? "bg-destructive/10 text-destructive/70"
                : "bg-muted text-muted-foreground"
        }`}
      >
        {EDGE_LABELS[edge.type] || edge.type}
      </span>
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground">{edge.from.replace("jd-", "")}</span>
        <span className="mx-1">→</span>
        <span>{edge.to.startsWith("cv-") ? edge.to.replace("cv-", "") : "Candidate"}</span>
      </span>
      <span
        className={`ml-auto text-xs ${
          edge.confidence === "high"
            ? "text-success/70"
            : edge.confidence === "medium"
              ? "text-warning/70"
              : "text-muted-foreground/50"
        }`}
      >
        {edge.confidence}
      </span>
    </div>
  );
}

function EdgeLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {Object.entries(EDGE_LABELS).map(([type, label]) => (
        <span key={type} className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              type === "MATCHED"
                ? "bg-success"
                : type === "PARTIALLY_MATCHED"
                  ? "bg-warning"
                  : type === "NOT_FOUND"
                    ? "bg-destructive/40"
                    : "bg-muted-foreground/40"
            }`}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

export function EvidenceGraphViewer({
  graph,
}: {
  graph: CandidateEvidenceGraph;
}) {
  const [showAll, setShowAll] = useState(false);

  // Group edges
  const matchedEdges = graph.edges.filter((e) => e.type === "MATCHED");
  const partialEdges = graph.edges.filter((e) => e.type === "PARTIALLY_MATCHED");
  const notFoundEdges = graph.edges.filter((e) => e.type === "NOT_FOUND");
  const discussedEdges = graph.edges.filter((e) => e.type === "DISCUSSED");

  const visibleEdges = showAll
    ? graph.edges
    : [...matchedEdges, ...partialEdges, ...discussedEdges].slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔗</span>
          <span>Evidence Graph</span>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-normal text-secondary-foreground">
            {graph.edges.length} relationships
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Legend */}
        <EdgeLegend />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 text-center text-sm">
          {[
            { label: "Matched", value: matchedEdges.length, color: "text-success" },
            { label: "Partial", value: partialEdges.length, color: "text-warning" },
            { label: "Not found", value: notFoundEdges.length, color: "text-destructive/70" },
            { label: "Score", value: `${graph.scoreBreakdown.total}`, color: "text-primary font-bold" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-secondary/50 p-3">
              <p className={`text-lg font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Edge list */}
        <div className="space-y-1">
          {visibleEdges.map((edge, i) => (
            <GraphEdge key={i} edge={edge} index={i} total={visibleEdges.length} />
          ))}
        </div>

        {graph.edges.length > 20 && (
          <button
            className="w-full rounded-lg border border-dashed py-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? "Show fewer"
              : `Show all ${graph.edges.length} relationships`}
          </button>
        )}

        {/* Summary */}
        <div className="rounded-lg bg-secondary/30 p-3 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              {graph.jdRequirementNodes.length}
            </span>{" "}
            JD requirements ×{" "}
            <span className="font-medium text-foreground">
              {graph.cvEvidenceNodes.length}
            </span>{" "}
            CV evidence points.
          </p>
          <p className="mt-1">
            <span className="font-medium text-success">{matchedEdges.length} matched</span>
            {partialEdges.length > 0 && (
              <>
                , <span className="font-medium text-warning">{partialEdges.length} partial</span>
              </>
            )}
            {notFoundEdges.length > 0 && (
              <>
                , <span className="font-medium text-destructive/70">{notFoundEdges.length} missing</span>
              </>
            )}
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
