# 0003 SSE Streaming for Atlas AI Chat

Date: 2026-06-23

## Status

Accepted

## Context

Phase 4 (Ask Atlas) needed a real-time AI chat experience where users could ask questions about their analysis results. Requirements:
- Stream OpenAI responses token-by-token to show progress
- Works behind a Next.js API route
- Must not require external infrastructure (no Redis, no WebSocket server)
- Compatible with Vercel/Edge deployment
- Client-side reconnection on network errors

## Decision

Use **Server-Sent Events (SSE)** via a Next.js App Router route handler that streams `ReadableStream`.

- The `POST /api/chat` route creates a `ReadableStream` and returns it with `Content-Type: text/event-stream`.
- The OpenAI `streamChatResponse` generator yields SSE-formatted chunks (`data: {...}\n\n`).
- The client `ChatPanel` reads the stream via `Response.body.getReader()` and parses SSE events.
- `AbortController` on the client cancels the stream and the OpenAI API call.

SSE was chosen over WebSocket because the data flow is unidirectional (server → client), and SSE works natively with HTTP without additional infrastructure.

## Alternatives Considered

1. **WebSocket**: Full-duplex, but requires a WebSocket server (``ws`` or Socket.IO). Adds infrastructure complexity. Overkill for chat where client only sends individual messages.

2. **Polling**: Simple to implement but wasteful — no way to get token-by-token streaming. Would send full responses only.

3. **Server-Sent Events (this decision)**: Native HTTP, works with any hosting, simple client API (`EventSource` or manual `ReadableStream` reader).

## Consequences

Positive:
- Zero additional infrastructure — works with any HTTP server.
- Token-by-token streaming for a responsive chat feel.
- Works with standard fetch API on the client.
- Easy to abort mid-stream via `AbortController`.
- Compatible with Vercel Edge Functions and serverless.

Tradeoffs:
- SSE is unidirectional (server → client only). Client messages are sent via separate HTTP requests.
- Browser `EventSource` doesn't support POST requests or custom headers. The custom `ReadableStream` reader approach was needed.
- SSE connections count toward serverless function duration limits.
- No built-in reconnection — the client handles it manually.

## Follow-Up

- Add automatic reconnection with exponential backoff.
- Consider Server-Sent Events + POST hybrid for production hosting with streaming limits.
- Add connection health monitoring.
