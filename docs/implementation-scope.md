# Tools of the Trade: guided design and delivery workspace

Status: authorised in direct chat. Glen waived repeated spec review and requested a usable React application in a standalone repository hosted on GitHub Pages.

## Intent

Teach people to connect user needs to business rules, system components, evaluation evidence and operating decisions. Serve directors, delivery managers, business analysts, domain experts, designers, engineers, junior engineers, QA, DevOps, SRE and finance. Each role contributes to one versioned project rather than an isolated document.

## First complete experience

A guided tutorial uses a fictional product-support assistant. A blank project follows the same steps: outcome, needs, rules and sources, architecture, evaluation, delivery and agent handoff. Role selection explains what to contribute and what a chosen collaborator should challenge. The existing 111-topic field guide, journeys, platform views and calculators remain available in React.

The visual editor uses React Flow. Engineers can add, connect and reposition components, inspect data structures and internal processes, and link needs and rules. A deterministic starting architecture uses one service and adds persistence or asynchronous workers only when selected requirements justify them. It is editable and never a claim that an architecture has been validated.

Templates capture source authority, division/product routing, exceptions, human approval, quality acceptance, release decisions, incidents and financial assumptions. Unknowns remain visible. Checks trace to needs, rules and components. Evidence status records a person's assessment; form completion is not production readiness.

## Portable model and agent boundary

A reusable TypeScript domain library owns a versioned JSON project format, validation, architecture derivation, checks and implementation handoff. Import is size-bounded, validated and previewed before replacement. Export includes the project and a readable implementation brief with acceptance cases and unresolved decisions. Project content stays in the browser unless the user downloads or explicitly submits it elsewhere.

GitHub Pages hosts only static assets. A local companion command can send a chosen formal specification to an existing Claude Code login and request schema-constrained project JSON. It disables tools, MCP and project customisations, validates the result and never implements or deploys it automatically. The browser imports the resulting file. No API credentials appear in the website.

## Acceptance

- An unfamiliar nontechnical user can complete a guided evaluation-plan journey with examples and reversible navigation.
- Each named role has a concrete contribution and collaborator handoff; all distinct role pairs have an intelligible shared review.
- A business rule can be followed to its implementation component, test and evidence owner.
- Multiple product sources and division routing are modeled explicitly.
- Engineers can edit nodes, edges, fields and process steps with keyboard alternatives to pointer gestures.
- Project save, recovery, import, export and schema validation preserve user work.
- Automated checks cover invalid graphs, business-rule traceability, migration, generation and browser workflows.
- The static production build works under the GitHub Pages repository path with no backend or secret dependencies.
- A synthetic formal spec completes the Claude Code conversion path without tools or repository access.

## Deliberate boundaries

This edition provides local project files and role-based collaboration guidance. Concurrent multi-user editing, identity-backed approvals, production telemetry ingestion and autonomous deployment require separately implemented services. Evidence and release approval are explicit human decisions. No generated scaffold promises maximum accuracy; its tests, held-out evaluation and operational feedback define the evidence needed for the particular task.

## Alternatives

Use React Flow for an editable domain graph; use C4 to inform architectural levels, EventStorming to inform discovery, DMN to inform rule tables and statecharts to inform lifecycle behavior. Existing workflow platforms remain potential implementation targets. Do not install an execution platform merely to draw a graph. Imported designs are inert data, never scripts or plugins to execute.
