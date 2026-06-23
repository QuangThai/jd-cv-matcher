"use client";

import { useState } from "react";
import type { MatchReport } from "@/lib/types/match";

type Props = {
  report: MatchReport;
};

/** Opens a print-friendly version of the report in a new window */
function buildPrintHtml(report: MatchReport): string {
  const { jdSummary, candidateOverview, candidateAnalyses, candidateRanking, finalRecommendation } = report;

  const scoreColor = (score: number) => {
    if (score >= 85) return "#16a34a";
    if (score >= 70) return "#2563eb";
    if (score >= 50) return "#d97706";
    return "#dc2626";
  };

  const renderScoreBar = (score: number) => `
    <div class="score-bar-bg">
      <div class="score-bar-fill" style="width:${score}%;background:${scoreColor(score)}"></div>
    </div>
    <span class="score-value">${score}/100</span>
  `;

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Atlas Match Report — ${jdSummary.jobTitle ?? "Job Analysis"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; line-height: 1.5; color: #1a1a2e; padding: 40px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 16px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 14px; font-weight: 600; margin-top: 16px; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 11px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #64748b; }
    .score-bar-bg { display: inline-block; width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; vertical-align: middle; }
    .score-bar-fill { height: 100%; border-radius: 4px; }
    .score-value { margin-left: 8px; font-weight: 600; font-size: 11px; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; margin: 2px; }
    .tag-green { background: #dcfce7; color: #166534; }
    .tag-blue { background: #dbeafe; color: #1e40af; }
    .tag-amber { background: #fef3c7; color: #92400e; }
    .tag-red { background: #fee2e2; color: #991b1b; }
    .section { margin-top: 20px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .card h3 { margin-top: 0; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; align-items: center; }
    .breakdown-label { font-size: 11px; color: #64748b; }
    .rec-header { font-size: 13px; font-weight: 700; color: #16a34a; margin-top: 20px; }
    .rec-text { font-size: 12px; margin-top: 4px; color: #475569; }
    @media print {
      body { padding: 0.5in; }
      @page { margin: 0.5in; }
    }
  </style>
</head>
<body>
  <h1>Atlas Match Report</h1>
  <div class="meta">
    <strong>${jdSummary.jobTitle ?? "N/A"}</strong>
    ${jdSummary.seniorityLevel ? ` · ${jdSummary.seniorityLevel}` : ""}
    ${jdSummary.yearsOfExperience ? ` · ${jdSummary.yearsOfExperience}+ years` : ""}
  </div>
  <p style="margin-bottom:16px;color:#475569;">${jdSummary.summary}</p>

  <h2>Candidate Overview</h2>
  <table>
    <tr><th>Rank</th><th>Name</th><th>Score</th><th>Level</th><th>Recommendation</th></tr>`;

  for (const r of candidateRanking) {
    const co = candidateOverview.find((c) => c.candidateId === r.candidateId);
    html += `<tr>
      <td>#${r.rank}</td>
      <td><strong>${r.candidateName ?? "Unknown"}</strong></td>
      <td>${renderScoreBar(r.matchScore)}</td>
      <td><span class="tag tag-blue">${r.matchLevel}</span></td>
      <td><span class="tag ${r.recommendation === "Strongly Recommend" || r.recommendation === "Recommend" ? "tag-green" : "tag-amber"}">${r.recommendation}</span></td>
    </tr>`;
  }

  html += `</table>`;

  for (const ca of candidateAnalyses) {
    const name = ca.candidateName ?? "Unknown";
    const rank = candidateRanking.find((r) => r.candidateId === ca.candidateId);
    html += `
    <div class="card">
      <h3>#${rank?.rank ?? "?"} ${name}</h3>
      <div class="breakdown-grid" style="margin-bottom:12px;">
        <span class="breakdown-label">Skills</span><span>${renderScoreBar(ca.scoreBreakdown.requiredSkills)}</span>
        <span class="breakdown-label">Experience</span><span>${renderScoreBar(ca.scoreBreakdown.relevantExperience)}</span>
        <span class="breakdown-label">Tools</span><span>${renderScoreBar(ca.scoreBreakdown.toolsAndPlatforms)}</span>
        <span class="breakdown-label">Seniority</span><span>${renderScoreBar(ca.scoreBreakdown.seniorityAndYears)}</span>
        <span class="breakdown-label">Domain</span><span>${renderScoreBar(ca.scoreBreakdown.domainKnowledge)}</span>
        <span class="breakdown-label">Education</span><span>${renderScoreBar(ca.scoreBreakdown.educationAndCertifications)}</span>
        <span class="breakdown-label">Soft Skills</span><span>${renderScoreBar(ca.scoreBreakdown.softSkillsAndLanguages)}</span>
        <span class="breakdown-label" style="font-weight:700;border-top:1px solid #e2e8f0;padding-top:4px;"><strong>Total</strong></span>
        <span style="border-top:1px solid #e2e8f0;padding-top:4px;"><strong>${renderScoreBar(ca.scoreBreakdown.total)}</strong></span>
      </div>
      <p style="font-size:11px;color:#475569;">${ca.recruiterSummary}</p>
    </div>`;
  }

  html += `
  <div class="rec-header">🏆 Final Recommendation</div>
  <div class="card">
    <p><strong>Top Candidate:</strong> ${finalRecommendation.topCandidateName ?? "N/A"} (Score: ${finalRecommendation.topCandidateScore}/100)</p>
    <p style="margin-top:8px;color:#475569;font-size:12px;">${finalRecommendation.explanation}</p>
    <p style="margin-top:8px;color:#475569;font-size:12px;"><strong>Hiring Advice:</strong> ${finalRecommendation.hiringAdvice}</p>
  </div>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;">
    Generated by Atlas Match — evidence-first candidate screening
  </div>
</body></html>`;

  return html;
}

export function PdfExportButton({ report }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    try {
      const html = buildPrintHtml(report);
      const win = window.open("", "_blank");
      if (!win) {
        alert("Please allow pop-ups to export the report.");
        return;
      }
      win.document.write(html);
      win.document.close();
      // Print triggers after fonts render
      setTimeout(() => {
        win.focus();
        win.print();
        setLoading(false);
      }, 500);
    } catch {
      setLoading(false);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium
                 hover:bg-muted/50 transition-colors disabled:opacity-50"
    >
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {loading ? "Preparing PDF..." : "Export PDF"}
    </button>
  );
}
