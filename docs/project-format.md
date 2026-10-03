# Portable project format

The application uses a versioned, inert JSON document. `schemaVersion: 1` identifies the project schema in `src/domain/schema.ts`. `parseProject` checks the UTF-8 size, schema, unique identifiers, references and component containment cycles before the UI opens a document.

The maximum file size is 1 MiB. Individual prose fields allow 20,000 characters, and each record collection allows 500 items. Timestamps use UTC with seconds and a `Z` suffix. A failed edit preserves the previous valid project. Imports do not evaluate code, load plugins or fetch references.

## Trace the design

| Record    | Purpose                                                           | Connections                                                     |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| Need      | Actor, task, outcome and acceptance example                       | Components and checks refer to need IDs                         |
| Rule      | Condition, required result, exceptions, authority and examples    | Components, process steps and checks refer to rule IDs          |
| Source    | Product/division scope, authority, update cadence and allowed use | Architecture suggestions create matching source components      |
| Component | Responsibility, fields and process steps                          | `parentId` defines containment; connections define interactions |
| Check     | Method, dataset, metric, expectation, owner and evidence          | Need, rule and component IDs                                    |
| Decision  | Lifecycle, owner, state, evidence and template answers            | `templateId` selects the structured checkpoint                  |

New blank projects start with empty nodes, edges and checks. The seven tutorial positions, four lifecycle values and schema version remain unchanged. Existing project files are not migrated. Check fields named `dataset` and `metric` may describe ordinary review material and criteria; they do not require model evaluation.

Containment is different from deployment. Retrieval, model calls and routing can be internal parts of one service. The starter adds storage or asynchronous workers only when the selected requirements call for them. Suggestions preserve existing edited components and checks. Removing a capability choice does not silently delete design work.

## Library example

```ts
import {
  createProject,
  mergeArchitecture,
  deriveChecks,
  parseProject,
  implementationBrief,
} from "./src/domain";

const draft = createProject();
draft.objective = "Help an adviser find the applicable product procedure.";
draft.choices.longRunning = true;
Object.assign(draft, mergeArchitecture(draft));
draft.checks = deriveChecks(draft);
const validated = parseProject(JSON.stringify(draft));
const brief = implementationBrief(validated);
```

The brief contains unresolved questions as well as proposed implementation work. Suggested checks have no invented numerical threshold, owner or evidence. A generated design is a proposal that needs review.

## Earlier field-guide plans

`importProjectFile` also accepts the earlier `{version: 1, selected, platform, notes}` format. It converts concept requirements into project checks, preserves note text and evidence status, and retains the old platform choice as historical context. Unknown concept IDs, statuses or fields fail validation. The UI always previews the conversion before replacing the current project.

Arbitrary Structurizr, BPMN, Mermaid or executable workflow files are not accepted as project JSON. The local Claude companion can interpret a selected text specification into this schema, with explicit human review afterward. This is a conversion, not a guarantee of lossless language translation.
