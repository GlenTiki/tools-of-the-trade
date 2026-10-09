import { useState } from "react";
import guidance from "../content/design-guidance.json";
import type { Decision } from "../domain";
import { newId } from "../workspace/files";
import { Empty, Field, Panel, Select } from "./Controls";
import type { EditorProps } from "./ProjectForms";

const lifecycleOptions = [
  { value: "design", label: "Discover and design" },
  { value: "implementation", label: "Plan and deliver" },
  { value: "release", label: "Accept and hand over" },
  { value: "operation", label: "Operate and review" },
];

function DecisionEditor({
  decision,
  change,
  remove,
}: {
  decision: Decision;
  change: (decision: Decision) => void;
  remove: () => void;
}) {
  const template = guidance.checkpoints.find(
    (t) => t.id === decision.templateId,
  );
  const unmatched = Object.entries(decision.answers ?? {}).filter(
    ([id]) => !template?.questions.some((question) => question.id === id),
  );
  const set = (key: keyof Decision, value: string) =>
    change({ ...decision, [key]: value });
  return (
    <details className="record" open={decision.status === "open"}>
      <summary>
        <span>{decision.title || "Untitled decision"}</span>
        <span className={`badge ${decision.status}`}>{decision.status}</span>
      </summary>
      {template && <p className="muted">{template.purpose}</p>}
      <div className="form-grid">
        <Field
          label="Decision title"
          value={decision.title}
          onChange={(v) => set("title", v)}
        />
        <Field
          label="Accountable owner"
          value={decision.owner}
          onChange={(v) => set("owner", v)}
        />
        <Select
          label="Lifecycle"
          value={decision.lifecycle}
          onChange={(v) => set("lifecycle", v)}
          options={lifecycleOptions}
        />
        <Select
          label="Decision status"
          value={decision.status}
          onChange={(v) => set("status", v)}
          options={[
            { value: "open", label: "Open — still needs a decision" },
            {
              value: "accepted",
              label: "Accepted — record owner and evidence",
            },
            { value: "revisit", label: "Revisit — assumptions have changed" },
          ]}
        />
      </div>
      {template?.questions.map((q) => (
        <Field
          key={q.id}
          label={q.label}
          hint={q.hint}
          placeholder={q.example}
          multiline
          value={decision.answers?.[q.id] ?? ""}
          onChange={(value) =>
            change({
              ...decision,
              answers: { ...decision.answers, [q.id]: value },
            })
          }
        />
      ))}
      {unmatched.map(([id, answer]) => (
        <Field
          key={id}
          label={`Saved answer: ${id}`}
          value={answer}
          multiline
          hint="This retained field is not in the current template. Its original meaning is unchanged."
          onChange={(value) =>
            change({
              ...decision,
              answers: { ...decision.answers, [id]: value },
            })
          }
        />
      ))}
      <Field
        label="Decision and unresolved questions"
        multiline
        value={decision.notes}
        onChange={(v) => set("notes", v)}
      />
      <Field
        label="Evidence and review record"
        placeholder="Fictional example: Client service owner reviewed service map v1 against Q-17/Q-18; Q-17 remained unassigned, so acceptance is pending. Reopen after ownership is added."
        multiline
        value={decision.evidence}
        onChange={(v) => set("evidence", v)}
        hint="Record who reviewed what, when, and the conditions that would reopen this decision."
      />
      {template && (
        <p className="muted">Take away: {template.outputs.join(" ")}</p>
      )}
      <button className="text-button" onClick={remove}>
        Remove decision
      </button>
    </details>
  );
}

export default function Delivery({ project, update }: EditorProps) {
  const [lifecycle, setLifecycle] = useState("design");
  const [topics, setTopics] = useState("core");
  function add(templateId?: string) {
    const template = guidance.checkpoints.find((t) => t.id === templateId);
    const decision: Decision = {
      id: newId("decision"),
      title: template?.title ?? "",
      lifecycle: (template?.lifecycle ?? lifecycle) as Decision["lifecycle"],
      owner: "",
      status: "open",
      notes: "",
      evidence: "",
      ...(template ? { templateId: template.id, answers: {} } : {}),
    };
    update({ ...project, decisions: [...project.decisions, decision] });
  }
  return (
    <div className="stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Delivery & operations</p>
          <h1>Plan the engagement and its next decision.</h1>
          <p>
            Start with the client mandate, phases and responsibilities. Select
            specialist topics only when they apply. One person can hold several
            responsibilities. Record why a checkpoint is not applicable instead
            of inventing work.
          </p>
        </div>
      </div>
      <div className="segmented" aria-label="Lifecycle stage">
        {lifecycleOptions.map((o) => (
          <button
            key={o.value}
            aria-pressed={lifecycle === o.value}
            onClick={() => setLifecycle(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <Select
        label="Checkpoint topics"
        value={topics}
        onChange={setTopics}
        options={[
          { value: "core", label: "Core engagement checkpoints" },
          { value: "specialist", label: "Optional specialist topics" },
        ]}
      />
      <div className="template-grid">
        {guidance.checkpoints
          .filter((t) => t.lifecycle === lifecycle && t.group === topics)
          .map((template) => (
            <article className="template-card" key={template.id}>
              <span className="eyebrow">
                {template.roles
                  .map(
                    (id) => guidance.profiles.find((r) => r.id === id)?.title,
                  )
                  .join(" + ")}
              </span>
              <h2>{template.title}</h2>
              <p>{template.purpose}</p>
              <p className="small muted">{template.applicability}</p>
              <button onClick={() => add(template.id)}>
                Use this checkpoint
              </button>
            </article>
          ))}
      </div>
      <Panel
        title="Decisions and review records"
        aside={<button onClick={() => add()}>Add a decision</button>}
      >
        <p className="muted">
          All saved records remain below, across phases and topics. These
          records live in your project file. An accepted status is a record of
          your decision, not an identity-verified approval.
        </p>
        {project.decisions.length === 0 && (
          <Empty>
            Choose a relevant checkpoint above or add your own decision.
          </Empty>
        )}
        {project.decisions.map((decision) => (
          <DecisionEditor
            key={decision.id}
            decision={decision}
            change={(next) =>
              update({
                ...project,
                decisions: project.decisions.map((d) =>
                  d.id === next.id ? next : d,
                ),
              })
            }
            remove={() =>
              update({
                ...project,
                decisions: project.decisions.filter(
                  (d) => d.id !== decision.id,
                ),
              })
            }
          />
        ))}
      </Panel>
      <Panel title="Close the feedback loop">
        <p>
          Compare the observed result with the client mandate. Record
          limitations, lessons and the next owner. Advice can close with an
          accepted deliverable; a live service also needs monitoring and
          response ownership.
        </p>
        <p className="muted">
          This workspace records your plan and evidence links. Connect your
          chosen monitoring and incident tools during implementation.
        </p>
      </Panel>
    </div>
  );
}
