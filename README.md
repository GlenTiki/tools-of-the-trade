# Tools of the Trade

A planning and learning workspace for specialist professional-services teams. Connect a client mandate to deliverables, design choices, evidence, commercial decisions and operating responsibilities. Explore software and AI topics when they apply.

**[Open the app](https://glentiki.github.io/tools-of-the-trade/)** · [Tool selection](docs/tool-selection.md) · [Project format](docs/project-format.md)

## Start with a real task

1. Open **Guided plan** and describe the user outcome.
2. Open **engagement checkpoints** to record client responsibilities, phases and acceptance. The fictional AI support example is optional.
3. Capture the needs, source authority, business rules and exceptions.
4. Use **Architecture** when software is in scope. New projects start without invented components; adding suggestions is explicit.
5. Use **Evaluation** for acceptance cases, review material, criteria and owners. Advisory work can use an options memo and client review; it does not need a model dataset.
6. Use **Delivery** checkpoints with the people who know the work.
7. Export the project and implementation brief from the final guided step.

The role guide covers directors, project managers and delivery leads, business analysts, domain experts, designers, technical leads and engineers, junior engineers, QA, DevOps, SRE and finance. Every pair has a collaboration question and a shared output. These are responsibilities; a small team can hold several. Stages may be revisited or skipped to match the engagement.

The nine core engagement checkpoints cover mandate, client working agreements, governance, phases, design/evidence, commercial change, acceptance/adoption, operation and benefits/closure. Twelve specialist templates remain available. Saved decisions stay visible across topic and phase selection. See [engagement scope](docs/engagement-planning.md).

The field guide includes connected topics, four learning journeys, Azure/AWS/GCP/Vercel perspectives, runnable Python examples and calculators for cosine similarity, Wilson intervals and classification metrics. Select a topic to add its evidence prompts to the project.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

```sh
npm run check
npx playwright install chromium
npm run test:e2e
npm run setup:hooks
```

`check` runs formatting, lint, complexity checks, unit tests, strict TypeScript and the production build. Browser tests exercise the build under `/tools-of-the-trade/` on desktop and a phone viewport. The optional local hook runs both checks before each commit. CI runs the same gates before GitHub Pages publication.

The Python examples use explicit dependencies and local test data:

```sh
uv run --no-project --with-requirements examples/requirements.txt python -m pytest examples
```

## Convert a formal specification with Claude Code

The companion uses an existing, authenticated local `claude` executable. Run `claude --help` to confirm that your version supports `--safe-mode`, `--strict-mcp-config` and `--json-schema`.

```sh
npm run spec:convert -- --input docs/example-system-spec.md --output project.json
```

Then choose **Import project** in the website. Import validates the graph and previews the project before replacing the current draft.

To inspect the complete prompt without contacting a model:

```sh
npm run spec:convert -- --input docs/example-system-spec.md --output conversion-prompt.txt --prompt-only
```

The command sends the selected specification to your configured Claude Code service. It runs in an empty temporary directory, disables tools, MCP, browser integration and project customizations, and validates the returned JSON. Generated rules and decisions remain unconfirmed. It does not implement or deploy the design. Output files are created with private permissions; an existing file is never overwritten.

## Privacy and data

Project content is stored in this browser's local storage. The app makes no model calls and has no analytics, account system or project backend. GitHub Pages serves public static files; standard hosting request logs are outside the app's control. Source links open the selected third-party site only when you follow them.

Export your project for backup or to share it. Import validates the file before replacement. Invalid cached data is preserved for download. If storage is unavailable, the app says so. Browser storage is not an encrypted document vault; use fictional or appropriately authorized content on shared devices.

Sharing a JSON file is a handoff, not simultaneous editing. The app records evidence links and human decisions; it does not authenticate approvals, ingest production telemetry, schedule work or deploy infrastructure. Field completion does not prove readiness. Runtime monitoring and notifications belong to the implementation you design.

## Reuse and hosting

The UI is React. `src/domain/index.ts` exports the typed project schema, graph validation, architecture suggestions, evaluation checks, gap analysis and implementation brief. It has no browser dependency. Copy or import those modules and the companion `src/content/design-guidance.json` into another TypeScript project with Zod installed. The guidance supplies the question labels in readable brief exports. The local Claude converter is a separate Node.js module and never enters the browser bundle.

`npm run build` creates `dist/`. Its relative asset paths and hash navigation work on GitHub Pages, another static host, or a local HTTP server. Direct `file://` use is not supported by JavaScript module loading; serve the folder over HTTP. Set the repository's Pages source to **GitHub Actions** and push `main` to deploy.

Code and original educational text use the MIT license. Brightbeam branding and third-party trademarks remain the property of their owners. This utility does not reproduce or relicense linked third-party documentation.
