# US-004 Ask Atlas — AI Chat Over Analysis Results

## Status

planned

## Lane

normal

## Product Contract

After viewing analysis results, users can ask natural-language questions about the report and get contextual, evidence-backed answers streamed in real-time. The chat is session-only — no persistence across page reloads. Questions are answered using the full analysis context (JD summary, candidate profiles, score breakdowns, evidence graph) combined with OpenAI.

## Relevant Product Docs

- `docs/product/architecture.md`
- `docs/product/overview.md`
- `docs/product/scoring.md`

## Acceptance Criteria

- AC1: Chat panel appears alongside or below analysis results.
- AC2: User types a question and receives a streaming text response (SSE).
- AC3: System prompt includes the current analysis context (JD + all candidates + scores).
- AC4: Suggested questions appear as quick-action chips for common queries.
- AC5: Conversation history within the session is preserved (message list).
- AC6: Markdown in responses is rendered (bold, lists, code blocks).
- AC7: Error state shown on API failure with retry option.
- AC8: Loading indicator (typing animation) during response generation.
- AC9: Empty state shown when no analysis results are loaded.
- AC10: Follow-up suggestions appear after each assistant response.

## Design Notes

- **API**: `POST /api/chat`
  - Request: `{ message: string, report: Report }` 
  - Response: SSE stream of text chunks
  - Uses `gpt-4o-mini` for cost-effective chat
- **System prompt**: Injects JD summary, all candidate analyses, ranking, and final recommendation as context. Instructs the model to answer using only provided evidence (no hallucination).
- **Components**:
  - `ChatPanel` — main container with header, messages, input, suggestions
  - `ChatMessage` — single message bubble (user or assistant)
  - `ChatInput` — textarea + send button
  - `SuggestedQuestions` — predefined chips + dynamic follow-ups
- **State**: React state holding message array (`{ role, content }[]`)
- **Streaming**: Uses `ReadableStream` via Fetch API, reads chunks incrementally
- **Styling**: Matches existing Tailwind design system, slides in below results on desktop

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Chat system prompt builder, message formatting, suggestion generator |
| Integration | POST /api/chat with mocked OpenAI, SSE stream parsing |
| E2E | Playwright test: open chat, send message, verify streaming response renders |
| Platform | — |
| Release | — |

## Harness Delta

None.

## Evidence

To be added after implementation.
