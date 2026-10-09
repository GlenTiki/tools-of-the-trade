# Content clarity for people new to a role

## Intent

Glen asked for each piece of content to be reviewed for inexperienced profiles. Treat the reader as competent but new to the role, project discipline or technical topic. Continue on `feat/contextual-field-guide`; keep the local preview available.

## Acceptance

1. Review every field-guide topic, worked case, dataset lifecycle state, role profile, tutorial, checkpoint question, collaboration prompt, requirement, journey, platform description, sample project and visible UI instruction. Record retained and revised items with their source and a specific reason.
2. Explain necessary unfamiliar terms where a reader first needs them. Give the purpose before the mechanism. Introduce the people, records and notation needed to follow an example. Name who acts, what they produce and how someone checks it. Do not assume a novice knows terms such as rubric, adjudication, holdout, regression or acceptance criteria.
3. Keep advanced concepts accurate and useful to experienced readers. Preserve exact outputs, formulas, identifiers, contractual distinctions, numerical examples and technical qualifications. Explain terms rather than replacing precise concepts with misleading simplifications.
4. Keep clear content unchanged. Use concise contextual explanations instead of repeated generic beginner introductions. General planning must remain useful without software or AI. Explain acronyms and role responsibilities without labelling readers as incapable.
5. Preserve application schemas, stored project compatibility, identifiers, links and interactive behaviour. Content changes appear in the existing preview. No new service, API, account or publication is in scope.
6. Run the existing formatting, lint, complexity, type/build, unit and desktop/mobile checks. Review rendered content and obtain independent review of each author's changes. Record coverage and remaining limits honestly; no claim of testing comprehension with real users.

## Choices and limits

Edit the teaching content directly. A separate beginner mode or a global glossary would add navigation before the reader gets help and does not fix unclear sentences. Keep the technical term and explain it locally when it remains useful. Automated word or sentence counts cannot establish comprehension, so use an item-by-item editorial review and preserve the existing semantic tests. Content-only edits need no tests that merely repeat their wording; update selectors only when visible labels deliberately change.

## Review record

2026-10-09T12:12:02Z — Root drafted the specification. Read-only peers `field_guide_review`, `docs_showcase_author` and `docs_install_inspect` accepted the bounded criteria before drafting topic, example and planning revisions. They write drafts outside the checkout; root integrates changes and handles UI copy. The reviewers are same-model Codex peers; no distinct model review is claimed. Final review and validation are recorded below.

## Coverage and results

The review covers all 116 field-guide topics, 70 worked examples, eight lifecycle states and 263 planning records. Planning includes 11 role profiles, seven tutorials, 21 checkpoints and their questions, 55 role pairs, 11 requirements, four journeys and four platforms. The source review also covers 396 sample-project literals and 644 UI/generated-text fragments in their complete components. These fragment counts include identifiers and retained labels; they are not counts of distinct lessons.

The [item-by-item ledger](../reviews/beginner-content.jsonl) records the baseline, retained and revised items, findings and hashes of the reviewed files. Git contains the exact prose differences. The review revised 115 topic records, 67 worked cases, 670 planning values and 33 sample-source strings. Clear items remain unchanged. No new beginner mode, glossary navigation or project schema was needed.

Definitions now appear before unfamiliar terms are required. Role pairs name the writer and decision owner. Examples explain their notation and expected result. The dataset guide explains labels, review rules, disagreement resolution and test groups. Form hints define ownership, baselines and acceptance thresholds. Select options explain their meanings while retaining stored enum values. Missing-field messages name the actual form fields.

## Independent review

2026-10-09T12:31:07Z — Same-model Codex peers reviewed each other’s work; no author approved their own part. The collaboration interface does not expose a distinct underlying model identifier. `docs_install_inspect` accepted all topic revisions. `field_guide_review` accepted the planning, examples, lifecycle and source replacements. `docs_showcase_author` accepted the UI, generated text and tests after correction. The review is editorial; it does not claim measured comprehension with real users.

Resolved findings include unexplained short-list vocabulary; context-specific owner/name labels; definitions for the displayed F1 and accuracy scores; the direction of a latency comparison; and receiver-side duplicate prevention. The review also restored the distinctions between read permission, policy applicability and a wrong-product source. Arithmetic was preserved and independently checked, including full bootstrap enumeration, power and reviewer-agreement calculations. Source URLs, numerical fixtures, formulas, code examples, identifiers and references remain unchanged except prose that explains their use.

## Validation

`npm run check` passed formatting, lint, complexity, 80 unit tests, strict TypeScript and the production build. `npm run test:e2e` passed all 36 desktop/mobile tests. A new regression check first failed on internal missing-field names, then on generic owner labels, and now verifies the exact labels for each form. Existing tests still verify saved answers, import/export, read-only help, dataset states and readable contrast. Visible-label selectors changed to match the reviewed wording; their behavioural assertions remain.

Desktop and mobile screenshots confirmed that the dataset records remain readable after the longer explanations. The local preview remains on the feature branch. Existing saved project text is preserved; revised sample values appear when a new example is loaded, which still requires the replacement confirmation. No PR, merge or publication is part of this request.
