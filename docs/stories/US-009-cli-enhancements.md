# US-009 CLI Enhancements

## Status

planned

## Lane

normal

## Product Contract

CLI supports JSON and HTML output formats, batch processing of multiple CVs via `--cv-dir`, and configuration via a `.atlas-match.json` config file.

## Relevant Product Docs

- `docs/product/architecture.md`

## Acceptance Criteria

- AC1: `--format json` outputs structured JSON report to stdout or file.
- AC2: `--format html` generates a standalone HTML report file.
- AC3: `--cv-dir <path>` processes all CV files in a directory.
- AC4: `--config <path>` loads CLI options from a JSON/YAML config file.
- AC5: CLI shows progress during batch processing.
- AC6: All existing output formats still work (markdown default).

## Design Notes

- **JSON format**: Full MatchReport as JSON, suitable for CI pipelines.
- **HTML format**: Self-contained HTML with embedded CSS (reuses print report template).
- **Config file**: `.atlas-match.json` with fields: jd, cv, cvDir, format, output, concurrency.
- **Progress**: Console progress bar for batch CV processing.

## Harness Delta

None.
