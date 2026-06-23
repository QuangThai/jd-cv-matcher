# US-006 PDF Export + Charts

## Status

planned

## Lane

normal

## Product Contract

Users can visualize analysis results with interactive charts and export the full report as a PDF document. Charts include score breakdown per candidate (bar chart) and multi-candidate comparison (radar chart). PDF export captures the complete report including JD summary, scores, evidence, and recommendation.

## Relevant Product Docs

- `docs/product/architecture.md`
- `docs/product/scoring.md`

## Acceptance Criteria

- AC1: Score breakdown bar chart for each candidate (skills, experience, tools, seniority, domain, education, soft skills).
- AC2: Multi-candidate radar chart comparing overall scores across all dimensions.
- AC3: Chart component handles empty/loading states gracefully.
- AC4: PDF export button in results area.
- AC5: PDF includes JD summary, candidate table, ranking, score breakdowns, and final recommendation.
- AC6: PDF exports styled consistently with the app design.
- AC7: Chart responsive — works on mobile and desktop.
- AC8: Animated chart rendering on initial load.

## Design Notes

- **Charts**: recharts (React-native charting library for React)
- **PDF**: html2canvas + jsPDF for HTML-to-PDF (captures rendered components)
- **Components**:
  - `ScoreBreakdownChart` — horizontal bar chart per candidate
  - `RadarComparisonChart` — multi-candidate radar overlay
  - `PdfExportButton` — trigger export with loading state
- **API**: No new API endpoints — uses existing report data
- **Integration**: Charts shown in results area after analysis; export button in the results toolbar

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Chart data formatters, PDF content builder |
| Integration | — |
| E2E | Playwright: chart renders with mocked data, PDF export button clickable |
| Platform | — |
| Release | — |

## Harness Delta

None.
