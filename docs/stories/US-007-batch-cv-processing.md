# US-007 Batch CV Processing

## Status

planned

## Lane

normal

## Product Contract

Users can upload and process 10–50+ CV files in a single analysis. Server processes CVs in parallel batches with real-time SSE progress streaming. UI shows per-CV status (queued, extracting, analyzing, done, error).

## Relevant Product Docs

- `docs/product/architecture.md`

## Acceptance Criteria

- AC1: Upload supports 50+ CV files (client-side validation).
- AC2: SSE endpoint streams per-CV progress events.
- AC3: UI shows progress per CV: file name, status, timing.
- AC4: Processing uses concurrent batches (configurable concurrency).
- AC5: Results accumulate and render as each CV completes.
- AC6: Error in one CV does not block others.
- AC7: Abort/cancel stops processing.

## Design Notes

- **API**: New `POST /api/analyze/batch` with SSE response
- **UI**: CVMultiUpload updated for batch mode. Progress shows individual CV status.
- **Concurrency**: Process 3-5 CVs at a time using Promise pool.
- **Backend**: Reuses existing extract/analyze pipeline per CV.
- **State**: CV status tracked in memory with Map<fileId, {name, status, error?}>

## Harness Delta

None.
