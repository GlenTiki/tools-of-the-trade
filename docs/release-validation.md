# Release validation

Checked at 2026-10-03T00:53:11Z for the standalone React release.

The application passed 53 unit tests, strict TypeScript, ESLint with a complexity limit of 10, formatting and the production build. All 16 desktop and phone browser scenarios passed against the GitHub Pages subpath. The 11 runnable Python example tests passed in an isolated uv environment.

The browser scenarios cover the guided plan, collaboration roles, saved drafts, component fields and process steps, structured checkpoint answers, evidence edits, export, import confirmation, invalid graphs, escaped HTML, oversized edits, unavailable storage, corrupt-file recovery, legacy plan migration and navigation without horizontal overflow.

An independent source review found a false-success save path for edits beyond the schema limits. A failing regression reproduced it. The update and storage boundaries now validate before replacing valid data, and the UI explains a rejected edit. A diagram review also found invisible cross-level relationships; the canvas now projects them onto the visible container while preserving the original model endpoints.

Claude MCP returned **SHIP** for the reviewed persistence, validation, converter and deployment boundaries. The review was limited to the pasted sources; it was not a claim of a complete security audit. Its release confirmations were checked: the browser asks before replacement, the build creates `dist`, and the actual local Claude CLI completed a synthetic conversion. The conversion returned eight components, four unconfirmed rules and three unresolved checks with no claimed evidence. The CLI required JSON Schema draft-07; the dialect is now covered by a regression test.

The public-source audit found no private client data, credentials or local private paths. The website has no model-call or telemetry transport. Live collaboration, identity-backed approvals and production telemetry remain outside this static application.
