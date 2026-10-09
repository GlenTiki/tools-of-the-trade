import GuideHelp from "./GuideHelp";
import type { Project, Need, Rule, Source } from "../domain";
import { newId } from "../workspace/files";
import { removeNeed, removeRule } from "../workspace/editing";
import { Empty, Field, Panel, Select } from "./Controls";

export interface EditorProps {
  project: Project;
  update: (project: Project) => void;
}

export function OutcomeForm({ project, update }: EditorProps) {
  const set = (key: keyof Project, value: string) =>
    update({ ...project, [key]: value });
  return (
    <Panel title="What should improve for someone?">
      <div className="form-grid">
        <Field
          label="Project name"
          value={project.title}
          onChange={(v) => set("title", v)}
          placeholder="Client service improvement"
        />
        <Field
          label="Who is this for?"
          value={project.audience}
          onChange={(v) => set("audience", v)}
          placeholder="Staff and clients who need a clear service response"
        />
      </div>
      <Field
        help={
          <GuideHelp
            context="outcome"
            label="Intended outcome"
            value={project.objective}
          />
        }
        label="The outcome we want"
        multiline
        value={project.objective}
        onChange={(v) => set("objective", v)}
        placeholder="Help staff route requests to an accountable owner and reduce avoidable rework."
      />
      <div className="form-grid">
        <Field
          help={
            <GuideHelp
              context="success"
              label="Current baseline"
              value={project.baseline}
            />
          }
          label="What happens today?"
          placeholder="Fictional example: In a walkthrough of 10 urgent requests, 3 had no accountable owner. Historical request volumes are still unknown."
          multiline
          value={project.baseline}
          onChange={(v) => set("baseline", v)}
          hint="Describe the current task and its cost. Leave measurements unknown until you collect them."
        />
        <Field
          help={
            <GuideHelp
              context="success"
              label="Success criteria"
              value={project.successMeasure}
            />
          }
          label="How would we recognise success?"
          placeholder="Fictional example: The service owner can name an accountable responder for all 10 urgent walkthrough cases; any unassigned urgent case rejects the proposal."
          multiline
          value={project.successMeasure}
          onChange={(v) => set("successMeasure", v)}
          hint="Describe a measurable user benefit and the errors you cannot accept."
        />
      </div>
      <Field
        label="Who owns this outcome?"
        value={project.outcomeOwner}
        onChange={(v) => set("outcomeOwner", v)}
        placeholder="A named business owner or a role to confirm"
      />
    </Panel>
  );
}

function NeedCard({
  need,
  change,
  remove,
}: {
  need: Need;
  change: (need: Need) => void;
  remove: () => void;
}) {
  const set = (key: keyof Need, value: string) =>
    change({ ...need, [key]: value });
  return (
    <article className="record">
      <div className="section-heading">
        <h3>{need.task || "A user task"}</h3>
        <button className="text-button" onClick={remove}>
          Remove need
        </button>
      </div>
      <div className="form-grid">
        <Field
          label="Who needs this?"
          value={need.actor}
          onChange={(v) => set("actor", v)}
          placeholder="Service coordinator"
        />
        <Field
          help={
            <GuideHelp context="need" label="User task" value={need.task} />
          }
          label="What do they need to do?"
          value={need.task}
          onChange={(v) => set("task", v)}
          placeholder="Find the person responsible for an unusual request"
        />
      </div>
      <Field
        label="Why does this matter?"
        value={need.outcome}
        onChange={(v) => set("outcome", v)}
      />
      <Field
        help={
          <GuideHelp
            context="acceptance"
            label="Acceptance examples"
            value={need.acceptance}
          />
        }
        label="A result they would accept"
        placeholder="Fictional example: Q-17: the public entrance is locked. Expected: the coordinator assigns Facilities as accountable owner and shows its contact route."
        multiline
        value={need.acceptance}
        onChange={(v) => set("acceptance", v)}
        hint="Give a concrete example: question, context and expected answer or action."
      />
      <Field
        label="Who can confirm this need?"
        value={need.owner}
        onChange={(v) => set("owner", v)}
      />
    </article>
  );
}

export function NeedsForm({ project, update }: EditorProps) {
  const add = () =>
    update({
      ...project,
      needs: [
        ...project.needs,
        {
          id: newId("need"),
          actor: "",
          task: "",
          outcome: "",
          acceptance: "",
          owner: "",
        },
      ],
    });
  return (
    <Panel
      title="Make the work concrete"
      aside={<button onClick={add}>Add a user need</button>}
    >
      <p className="muted">
        Describe a task before choosing a model or a platform. Someone with real
        experience should check the example.
      </p>
      {project.needs.length === 0 && (
        <Empty>Start with one user and one task. More detail can follow.</Empty>
      )}
      {project.needs.map((need) => (
        <NeedCard
          key={need.id}
          need={need}
          change={(next) =>
            update({
              ...project,
              needs: project.needs.map((n) => (n.id === next.id ? next : n)),
            })
          }
          remove={() => update(removeNeed(project, need.id))}
        />
      ))}
    </Panel>
  );
}

function RuleCard({
  rule,
  change,
  remove,
}: {
  rule: Rule;
  change: (rule: Rule) => void;
  remove: () => void;
}) {
  const set = (key: keyof Rule, value: string) =>
    change({ ...rule, [key]: value });
  return (
    <details className="record" open>
      <summary>{rule.name || "A business rule"}</summary>
      <Field
        label="Rule name"
        value={rule.name}
        onChange={(v) => set("name", v)}
        placeholder="Confirm ownership before making a commitment"
      />
      <div className="form-grid">
        <Field
          label="When this is true…"
          placeholder="Fictional example: The request is urgent and a coordinator proposes changing its owner."
          multiline
          value={rule.when}
          onChange={(v) => set("when", v)}
        />
        <Field
          help={
            <GuideHelp
              context="rule"
              label="Required behaviour"
              value={rule.then}
            />
          }
          label="The system must…"
          placeholder="Fictional example: Keep the current owner until the duty lead approves reassignment."
          multiline
          value={rule.then}
          onChange={(v) => set("then", v)}
        />
      </div>
      <Field
        help={
          <GuideHelp
            context="rule"
            label="Exceptions"
            value={rule.exceptions}
          />
        }
        label="Exceptions or missing information"
        placeholder="Fictional example: If no duty lead is available, retain Facilities as owner and escalate to the service manager."
        value={rule.exceptions}
        onChange={(v) => set("exceptions", v)}
        hint="Say when to ask a person, refuse, or choose a different path."
      />
      <div className="form-grid">
        <Field
          help={
            <GuideHelp
              context="acceptance"
              label="Passing example"
              value={rule.examplePass}
            />
          }
          label="An example that should pass"
          placeholder="Fictional example: Urgent Q-17 stays with Facilities while duty-lead approval is pending."
          multiline
          value={rule.examplePass}
          onChange={(v) => set("examplePass", v)}
        />
        <Field
          help={
            <GuideHelp
              context="acceptance"
              label="Failing example"
              value={rule.exampleFail}
            />
          }
          label="An example that should fail"
          placeholder="Fictional example: A coordinator moves urgent Q-17 to Security without the duty lead’s approval."
          multiline
          value={rule.exampleFail}
          onChange={(v) => set("exampleFail", v)}
        />
        <Field
          label="Where does this rule come from?"
          value={rule.source}
          onChange={(v) => set("source", v)}
        />
        <Field
          label="Who can confirm it?"
          value={rule.owner}
          onChange={(v) => set("owner", v)}
        />
      </div>
      <div className="form-grid">
        <Select
          label="Has the owner confirmed it?"
          value={rule.status}
          onChange={(v) => set("status", v)}
          options={[
            {
              value: "unconfirmed",
              label: "Unconfirmed — needs a conversation",
            },
            { value: "confirmed", label: "Confirmed by the owner" },
          ]}
        />
        <button className="text-button align-end" onClick={remove}>
          Remove rule
        </button>
      </div>
    </details>
  );
}

function SourceCard({
  source,
  change,
  remove,
}: {
  source: Source;
  change: (source: Source) => void;
  remove: () => void;
}) {
  const set = (key: keyof Source, value: string) =>
    change({ ...source, [key]: value });
  return (
    <details className="record">
      <summary>{source.name || "A document or data source"}</summary>
      <div className="form-grid">
        <Field
          label="Source name"
          value={source.name}
          onChange={(v) => set("name", v)}
        />
        <Field
          label="Division (optional unless routing applies)"
          value={source.division}
          onChange={(v) => set("division", v)}
        />
        <Field
          label="Product or scope (optional unless routing applies)"
          value={source.product}
          onChange={(v) => set("product", v)}
        />
        <Field
          label="Source owner"
          value={source.owner}
          onChange={(v) => set("owner", v)}
        />
        <Field
          help={
            <GuideHelp
              context="source"
              label="Source authority"
              value={source.authority}
            />
          }
          label="Authority when sources disagree"
          placeholder="Fictional example: Approved bulletin B7 supersedes procedure P3 section 4; otherwise refer the conflict to the service owner."
          value={source.authority}
          onChange={(v) => set("authority", v)}
        />
        <Field
          help={
            <GuideHelp
              context="source"
              label="Source revisions"
              value={source.updateCadence}
            />
          }
          label="How often does it change?"
          value={source.updateCadence}
          onChange={(v) => set("updateCadence", v)}
        />
      </div>
      <Field
        help={
          <GuideHelp
            context="source"
            label="Permitted use"
            value={source.allowedUse}
          />
        }
        label="Who may use it, and for what?"
        placeholder="Fictional example: Staff may consult the public ownership guide; named case records stay in the client repository and cannot enter the public demo."
        multiline
        value={source.allowedUse}
        onChange={(v) => set("allowedUse", v)}
      />
      <button className="text-button" onClick={remove}>
        Remove source
      </button>
    </details>
  );
}

export function RulesForm({ project, update }: EditorProps) {
  const addRule = () =>
    update({
      ...project,
      rules: [
        ...project.rules,
        {
          id: newId("rule"),
          name: "",
          when: "",
          then: "",
          exceptions: "",
          source: "",
          owner: "",
          status: "unconfirmed",
          examplePass: "",
          exampleFail: "",
        },
      ],
    });
  const addSource = () =>
    update({
      ...project,
      sources: [
        ...project.sources,
        {
          id: newId("source"),
          name: "",
          division: "",
          product: "",
          authority: "",
          updateCadence: "",
          allowedUse: "",
          owner: "",
        },
      ],
    });
  return (
    <>
      <Panel
        title="Turn experience into explicit rules"
        aside={<button onClick={addRule}>Add a business rule</button>}
      >
        <p className="muted">
          A dataset rarely tells the whole story. Capture the rule an
          experienced colleague uses when two answers look plausible.
        </p>
        {project.rules.length === 0 && (
          <Empty>Capture one rule with a passing and failing example.</Empty>
        )}
        {project.rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            change={(next) =>
              update({
                ...project,
                rules: project.rules.map((r) => (r.id === next.id ? next : r)),
              })
            }
            remove={() => update(removeRule(project, rule.id))}
          />
        ))}
      </Panel>
      <Panel
        title="Know which sources to trust"
        aside={<button onClick={addSource}>Add a source</button>}
      >
        {project.sources.length === 0 && (
          <Empty>
            List documents, databases or people the system relies on.
          </Empty>
        )}
        {project.sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            change={(next) =>
              update({
                ...project,
                sources: project.sources.map((s) =>
                  s.id === next.id ? next : s,
                ),
              })
            }
            remove={() =>
              update({
                ...project,
                sources: project.sources.filter((s) => s.id !== source.id),
              })
            }
          />
        ))}
      </Panel>
    </>
  );
}
