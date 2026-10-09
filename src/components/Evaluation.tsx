import GoldenDataset from "./GoldenDataset";
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
        placeholder="Fictional example: Every urgent walkthrough request has an accountable owner."
        value={check.title}
        onChange={(v) => set("title", v)}
      />
      <div className="form-grid">
        <Field
          label="Method"
          placeholder="Fictional example: Give coordinator Q-17 (locked entrance); ask who owns it using service map v1; record their answer."
          multiline
          value={check.method}
          onChange={(v) => set("method", v)}
          hint="Write the steps the reviewer will follow. For example, give a coordinator a request, ask which team owns it, and compare the answer with the agreed service map."
        />
        <Field
          label="Test cases or review material"
          placeholder="Fictional example: Service map v1; Q-17 locked entrance → Facilities; Q-18 room booking → booking coordinator."
          multiline
          value={check.dataset}
          onChange={(v) => set("dataset", v)}
          hint="Name the documents or examples to review, their versions and the people or tasks they represent. A held-out dataset is a set of cases reserved for testing and not used to train or tune the model."
        />
        <Field
          label="Measure or review criterion"
          value={check.metric}
          onChange={(v) => set("metric", v)}
          placeholder="Fictional example: Count urgent cases with a named accountable responder / all urgent cases reviewed."
        />
        <Field
          label="Expected result or acceptance threshold"
          hint="State what counts as success. A threshold is a cut-off, such as all 10 urgent requests having a named owner. Agree it before you see the result."
          value={check.expected}
          onChange={(v) => set("expected", v)}
          placeholder="Fictional example: Proposed: all 10 urgent walkthrough cases have an owner; any unassigned urgent case rejects the map. Client service owner must confirm."
        />
        <Field
          label="Evidence owner"
          hint="Name the person who will collect the results and make them available for review."
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
        placeholder="Fictional example: Walkthrough W1, service map v1: 9/10 cases assigned; Q-17 unassigned. Client service owner records failed criterion and requests revision."
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
            A check compares what happened with what you expected. Start with a
            user task or rule, then write the steps, expected result and
            reviewer.
          </p>
        </div>
        <button
          onClick={() => setShowDataset(!showDataset)}
          aria-expanded={showDataset}
        >
          Optional: golden datasets for model evaluation
        </button>
      </div>
      {showDataset && <GoldenDataset />}
      <div className="notice">
        <strong>Plan first. Measure next.</strong> Suggested checks are drafts.
        Agree what should happen, who will check it and which examples they will
        use. Record what actually happened after the check.
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
                      .join(", ") ||
                      "No component linked to carry out this rule"}
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
