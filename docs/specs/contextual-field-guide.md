# Contextual field guide and worked project

## Intent

Glen requested a richer example, more field-guide examples, and relevant guide suggestions beside plan and architecture inputs. He then requested a fork or branch. This work uses `feat/contextual-field-guide` in the existing repository. The live app stays unchanged until publication is authorised.

## Acceptance

1. The optional fictional support-assistant project has a coherent outcome, at least four concrete needs and rules, accountable role placeholders, source authority, component contracts and process steps, evaluation cases, and lifecycle decisions. All sample evidence and approvals remain unclaimed. Existing blank projects and saved projects keep their behaviour and schema.
2. At least twelve concise worked cases cover project outcomes, acceptance, source scope, request contracts, permissions, retrieval, generation, sensitive data, retries, cancellation, service promises and release decisions. Each gives a situation, design decision, failure case and evidence to collect. They appear on relevant field-guide topics. All organisations, targets and cases are explicitly illustrative.
3. Plan inputs offer relevant field-guide topics for outcomes, needs, acceptance, rules and sources. Architecture offers help for capability choices, component kinds/descriptions, data classification, process steps and connections. Each suggestion gives its reason and an example. Typed terms can refine the field-specific suggestions; an empty or unrelated input still receives curated context suggestions. At most three topics appear per input.
4. Help is an explicit disclosure beside the input. A reader can open the full topic in a dialog, explore related topics, and close it without losing edits, the current step, selected component or keyboard focus. Reading help never adds checks or changes project data. The existing explicit field-guide action remains the way to add evidence prompts.
5. Suggestions use bundled content and local deterministic matching. They make no model or network calls and send no project text elsewhere. Unknown contexts or topic IDs fail without crashing. Suggested content is advice, not a declaration of completeness or an automatic architecture change.
6. Desktop and mobile tests cover relevant suggestions, richer examples, read-and-return, data persistence, unchanged blank projects, and schema/export validity. Normal lint, complexity, format, unit, type/build and browser checks pass. A fresh peer reviews the complete diff before commit.

## Scope and choices

Use the existing schema and catalogue identifiers. Keep new worked cases in a separate topic-linked content file. Reuse the field-guide topic view inside a dialog with an initial topic, and keep the project editor mounted. Curated field context plus explicit lexical signals is sufficient for the first version. A remote model, embeddings, automatic project edits, a new backend, user-submitted guide publishing, another full project template, and changes to existing import/storage are outside this slice. No library upgrade or vendor-specific recommendation is required.

## Validation

Write failing content/fixture and suggestion tests before implementation. Write browser cases before UI changes. Run `npm run check` and `npm run test:e2e`. Inspect a desktop and mobile screenshot. Retain failing-test output and the final review record. Use the existing nested-repository push checkpoint: push the reviewed feature branch, then ask before opening a PR; no merge or deployment in this task.

## Review record

Drafted 2026-10-09T11:21:04Z. Scope accepted by the read-only Codex peer `docs_install_inspect` at 2026-10-09T11:21:52Z. This is a same-model review; a distinct model identifier is not exposed. Matching reads only the current input, uses fixed cues, preserves a curated context suggestion, de-duplicates IDs and resolves ties consistently. Unknown context returns no suggestions.

## Feedback from the branch preview

2026-10-09T11:32:36Z — Glen found the worked cases too abstract. Each case must now show concrete starting facts, the actual input, the expected result, a wrong result, and a check that distinguishes them. Advice about how to design examples does not satisfy this requirement. Expand the case format with `input` and `expected`, render those before the explanation, and replace generic decision/failure/evidence prose with specific values and steps. Keep the policies and data explicitly fictional. Context suggestions must also show a concrete result. Add cases for chunking, classification/precision/recall and mutation checks so every suggested topic has an example.

## Full content review and reference lifecycle

2026-10-09T11:50:55Z — Glen extended the request to all content and asked for the states, people and work that make a dataset trustworthy. Review all 116 field-guide topics and 561 planning/UI items. Preserve useful definitions and add actual inputs, outputs, failures and checks where examples were missing. The integrated catalogue has 70 worked cases. Keep advisory project examples usable without an AI implementation. Record initial findings and their resolutions in `docs/content-review.json`.

The golden-dataset guide follows fictional case G-12 through scope, candidate capture, independent labels, dispute, adjudication, validation, freeze and revision. Each state names the responsible role, collaborator, action, before/after record, handover, gate and blocker. Preserve both reviewers’ labels. Treat the exposed case as regression data and reserve unseen cases separately. Frozen reference data does not imply measured model performance or release approval. A policy change opens a draft version and preserves the previous reference. The interactive guide is teaching content, not a dataset editor.

Peer `docs_install_inspect` accepted the expanded content direction and reviewed all 31 core and 21 advanced cases, planning revisions and their arithmetic. Corrections included question-aware cache keys, explicit client-to-service timeouts, fictional capacity measurements, and a concrete visitor-booking scope change. Final integration review accepted the revision recorded below.

## Final review and validation

2026-10-09T11:54:16Z — Read-only Codex peer `docs_install_inspect` accepted the complete integration. This was same-model peer review through OpenAI; the collaboration tool did not expose a distinct model identifier. Reviewed source SHA-256: `10cd0396092fbc4aa4e57804153f9352e7beef2bb0d7e4041738bb579ecbd073`. The digest covers the 35 changed files except this spec, sorted by relative path, with path bytes, NUL, content bytes and NUL per file.

The reviewer checked the full UI, content, fixture, tests and spec. Resolved findings: include the question in exact cache keys; distinguish client-to-service timeout from an unresolved answer; label invented hosting timings; name the scope-change work; align the privacy outcome enum and the policy need with their linked checks. The reviewer reran focused tests and independently checked statistical arithmetic. No blocking findings remain.

`npm run check` passed formatting, lint, complexity, 79 unit tests, strict TypeScript and production build. `npm run test:e2e` passed 36 desktop/mobile tests. The normal commit hook repeats both gates. Screenshots confirmed readable before/after records on both viewport sizes. A browser regression reproduced the screenshot defect with contrast 1.0088 before the scoped text-colour fix; it now requires at least 4.5 in the dialog and Evaluation view. Long JSON values wrap without horizontal dialog overflow.

This expanded review exceeds the original slice size because Glen explicitly requested all content after trying the branch. It changes no project schema, persistence mechanism or backend. The branch remains a preview; publication requires the nested-repository PR checkpoint.
