import { useState } from "react";
import { deriveChecks, type Check } from "../domain";
import { newId } from "../workspace/files";
import { Empty, Field, LinksPicker, Panel, Select } from "./Controls";
import type { EditorProps } from "./ProjectForms";

function CheckEditor({
  check,
  project,
  change,
  remove,
}: EditorProps & {
  check: Check;
  change: (check: Check) => void;
  remove: () => void;
}) {
  const set = (key: keyof Check, value: string | string[]) =>
    change({ ...check, [key]: value });
  return (
    <details className="record">
      <summary>
        <span>{check.title || "Untitled evaluation"}</span>
        <span className={`badge ${check.status}`}>{check.status}</span>
      </summary>
      <Field
        label="What claim does this check test?"
        value={check.title}
        onChange={(v) => set("title", v)}
      />
      <div className="form-grid">
        <Field
          label="Method"
          multiline
          value={check.method}
          onChange={(v) => set("method", v)}
          hint="For example: client walkthrough, options review, reconciliation or a software test."
        />
        <Field
          label="Test cases or review material"
          multiline
          value={check.dataset}
          onChange={(v) => set("dataset", v)}
          hint="Identify the reviewed material, its version and relevant groups. A model evaluation may also need a held-out dataset."
        />
        <Field
          label="Measure or review criterion"
          value={check.metric}
          onChange={(v) => set("metric", v)}
          placeholder="Options address each agreed constraint; record exceptions"
        />
        <Field
          label="Expected result or acceptance threshold"
          value={check.expected}
          onChange={(v) => set("expected", v)}
          placeholder="Agree with the outcome owner before evaluating"
        />
        <Field
          label="Evidence owner"
          value={check.owner}
          onChange={(v) => set("owner", v)}
        />
        <Select
          label="Evidence status"
          value={check.status}
          onChange={(v) => set("status", v)}
          options={[
            {
              value: "unresolved",
              label: "Unresolved — still an open question",
            },
            { value: "defined", label: "Defined — ready to run" },
            {
              value: "evidenced",
              label: "Evidence recorded — review the result",
            },
            { value: "excluded", label: "Excluded — explain why below" },
          ]}
        />
      </div>
      <Field
        label="Evidence, observed result or exclusion reason"
        multiline
        value={check.evidence}
        onChange={(v) => set("evidence", v)}
        hint="Record the run, version, sample size, failures and reviewer. A status alone is not evidence."
      />
      <div className="form-grid">
        <LinksPicker
          title="User needs"
          values={check.needIds}
          onChange={(v) => set("needIds", v)}
          options={project.needs.map((n) => ({
            id: n.id,
            label: n.task || "Untitled need",
          }))}
        />
        <LinksPicker
          title="Business rules"
          values={check.ruleIds}
          onChange={(v) => set("ruleIds", v)}
          options={project.rules.map((r) => ({
            id: r.id,
            label: r.name || "Untitled rule",
          }))}
        />
        <LinksPicker
          title="System components"
          values={check.componentIds}
          onChange={(v) => set("componentIds", v)}
          options={project.nodes.map((n) => ({ id: n.id, label: n.label }))}
        />
      </div>
      <button className="text-button" onClick={remove}>
        Remove check
      </button>
    </details>
  );
}

function DatasetGuide() {
  return (
    <Panel title="Build a golden dataset people can defend">
      <p>
        A golden dataset is a reviewed set of examples with expected results. It
        needs provenance and a maintenance owner.
      </p>
      <ol className="teaching-list">
        <li>
          <strong>Collect the work.</strong> Start with real task types, allowed
          data and documented consent. Include ambiguous cases and failures.
        </li>
        <li>
          <strong>Define what good means.</strong> Write the expected result and
          the rule behind it. Use subject experts; record disagreements.
        </li>
        <li>
          <strong>Separate development from proof.</strong> Keep a held-out set
          outside prompt optimization and training. Split related records
          together to prevent leakage.
        </li>
        <li>
          <strong>Cover the important slices.</strong> Include each division,
          product, source version, language, permission boundary and uncommon
          high-cost error.
        </li>
        <li>
          <strong>Measure uncertainty.</strong> Record the denominator and
          intervals. A few successful examples do not establish a low failure
          rate.
        </li>
        <li>
          <strong>Version and maintain.</strong> Record rule changes, review
          dates and production incidents. Preserve old failures for regression
          tests.
        </li>
      </ol>
      <details>
        <summary>A candidate case, ready for expert review</summary>
        <pre>
          {JSON.stringify(
            {
              id: "division-routing-001",
              input: {
                question: "Which terms apply?",
                division: "Business",
                product: "Standard",
              },
              expected: {
                sourceDivision: "Business",
                onMissingCurrentSource: "ask-for-review",
              },
              ruleId: "correct-division",
              split: "unassigned",
              provenance: "Fictional draft; requires expert review",
              reviewedBy: null,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </Panel>
  );
}

export default function Evaluation({ project, update }: EditorProps) {
  const [showDataset, setShowDataset] = useState(false);
  const add = () =>
    update({
      ...project,
      checks: [
        ...project.checks,
        {
          id: newId("check"),
          title: "",
          method: "",
          dataset: "",
          metric: "",
          expected: "",
          owner: "",
          status: "unresolved",
          evidence: "",
          needIds: [],
          ruleIds: [],
          componentIds: [],
        },
      ],
    });
  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Evaluation plan</p>
          <h1>What evidence would change your mind?</h1>
          <p>
            Test user outcomes, business rules and the components that enforce
            them.
          </p>
        </div>
        <button
          onClick={() => setShowDataset(!showDataset)}
          aria-expanded={showDataset}
        >
          Optional: golden datasets for model evaluation
        </button>
      </div>
      {showDataset && <DatasetGuide />}
      <div className="notice">
        <strong>Plan first. Measure next.</strong> Suggested checks are drafts.
        Agree the expected result, owner and review material before marking
        evidence.
      </div>
      <Panel
        title={`${project.checks.length} checks in this plan`}
        aside={
          <div className="button-row">
            <button
              onClick={() =>
                update({ ...project, checks: deriveChecks(project) })
              }
            >
              Suggest missing checks
            </button>
            <button className="primary" onClick={add}>
              Add a check
            </button>
          </div>
        }
      >
        {project.checks.length === 0 && (
          <Empty>
            Add needs and rules, then suggest checks. You can also define a
            check directly.
          </Empty>
        )}
        {project.checks.map((check) => (
          <CheckEditor
            key={check.id}
            check={check}
            project={project}
            update={update}
            change={(next) =>
              update({
                ...project,
                checks: project.checks.map((c) =>
                  c.id === next.id ? next : c,
                ),
              })
            }
            remove={() =>
              update({
                ...project,
                checks: project.checks.filter((c) => c.id !== check.id),
              })
            }
          />
        ))}
      </Panel>
      <Panel title="Follow a rule through the design">
        {project.rules.length === 0 ? (
          <Empty>
            Your rules will appear here with their components and checks.
          </Empty>
        ) : (
          <div className="trace-list">
            {project.rules.map((rule) => (
              <article key={rule.id}>
                <h3>{rule.name || "Untitled rule"}</h3>
                <div className="trace-flow">
                  <span>{rule.status}</span>
                  <span aria-hidden>→</span>
                  <span>
                    {project.nodes
                      .filter(
                        (n) =>
                          n.ruleIds.includes(rule.id) ||
                          n.steps.some((s) => s.ruleIds.includes(rule.id)),
                      )
                      .map((n) => n.label)
                      .join(", ") || "No implementation linked"}
                  </span>
                  <span aria-hidden>→</span>
                  <span>
                    {project.checks
                      .filter((c) => c.ruleIds.includes(rule.id))
                      .map(
                        (c) => `${c.title || "Untitled check"} (${c.status})`,
                      )
                      .join("; ") || "No check linked"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
