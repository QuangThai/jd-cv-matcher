# 0004 Browser Print for PDF Export

Date: 2026-06-23

## Status

Accepted

## Context

Phase 6 (PDF Export + Charts) needed a way for users to export analysis reports as PDF files. Requirements:
- Must include charts (recharts SVG-based visualizations)
- Works in the browser without server-side rendering
- Simple, reliable, no external API calls
- Print-friendly output that respects OS print dialog settings
- Maintains visual fidelity of the analysis report

## Decision

Use **`window.print()`** with a print-specific CSS stylesheet instead of a programmatic PDF generation library.

- A `PdfExportButton` component toggles a `print-visible` class and calls `window.print()`.
- Print styles hide non-essential UI (buttons, inputs, chat panel) and optimize the layout for paper.
- Charts (SVG-based recharts) render natively in the print dialog.
- The browser's native Print to PDF feature handles the actual PDF generation.

This approach avoids adding a server-side PDF dependency (puppeteer, wkhtmltopdf) or a client-side library (html2canvas + jsPDF).

## Alternatives Considered

1. **html2canvas + jsPDF**: Renders the DOM to a canvas, then to PDF. Common approach but has known issues with:
   - SVG/chart rendering (often produces blurry or broken charts)
   - CSS properties not supported by html2canvas (gradients, backdrop-filter)
   - Multi-page content splitting
   
2. **Server-side Puppeteer/Playwright**: Full control over PDF output, but:
   - Requires a server or serverless function with a headless browser
   - Adds ~300MB+ to deployment size
   - Overkill for a client-side export feature

3. **@react-pdf/renderer** or **react-pdf**: Build PDF with React components. Clean but:
   - Separate component tree — must duplicate the report layout
   - No direct chart support — would need to recreate charts in PDF primitives

4. **Browser Print (this decision)**: Simple, reliable, leverages the browser's built-in PDF engine.

## Consequences

Positive:
- Zero additional dependencies — works with only CSS.
- Charts render perfectly (browser's own SVG renderer).
- Print dialog gives users control over page size, margins, orientation.
- Works offline (no server call).
- Easy to maintain — just CSS changes.

Tradeoffs:
- `window.print()` opens the browser's print dialog — not a one-click download.
- No server-side PDF generation (can't email or batch-generate PDFs).
- Print CSS must be carefully maintained for cross-browser consistency.
- Header/footer from browser print settings may appear (can't control them).

## Follow-Up

- Consider adding a one-click download option using the Print to PDF saved-path feature (Chromium-only).
- Add `@media print` styles for the entire app to ensure all pages print well.
- If server-side PDF becomes necessary, evaluate Playwright's PDF API.
