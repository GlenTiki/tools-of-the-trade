import { implementationBrief, projectGaps } from "../domain";
import { downloadFile } from "../workspace/files";
import { Field, Panel } from "./Controls";
import type { EditorProps } from "./ProjectForms";

export default function Handoff({ project, update }: EditorProps) {
  const gaps = projectGaps(project);
  const brief = implementationBrief(project);
  const cases = project.rules.map((rule) => ({
    ruleId: rule.id,
    name: rule.name,
    pass: rule.examplePass,
    fail: rule.exampleFail,
    owner: rule.owner,
    reviewStatus: rule.status,
    purpose:
      "Candidate acceptance cases; review against the agreed deliverable and its risks.",
  }));
  return (
    <div className="stack">
      <Panel title="A specification someone can act on">
        <p>
          Export the engagement decisions, deliverables and evidence together.
          Ask the next person to assess, decide or deliver the agreed scope. Use
          a coding agent only for an explicitly authorised software task.
        </p>
        <div className="button-row">
          <button
            className="primary"
            onClick={() =>
              downloadFile(
                "tools-of-the-trade-project.json",
                JSON.stringify(project, null, 2),
              )
            }
          >
            Download project JSON
          </button>
          <button
            onClick={() =>
              downloadFile("implementation-brief.md", brief, "text/markdown")
            }
          >
            Download implementation brief
          </button>
          <button
            onClick={() =>
              downloadFile(
                "candidate-acceptance-cases.json",
                JSON.stringify(cases, null, 2),
              )
            }
          >
            Download candidate cases
          </button>
          <button onClick={() => window.print()}>Print this plan</button>
        </div>
        <Field
          label="Assumptions to carry into the next phase"
          placeholder="Fictional example: The client coordinator can provide the request log; access is unconfirmed. Without it, request-volume claims remain unknown."
          multiline
          value={project.assumptions.join("\n")}
          onChange={(value) =>
            update({ ...project, assumptions: value.split("\n") })
          }
          hint="One assumption per line. Unknowns belong in the handoff, not in an agent's guess."
        />
      </Panel>
      <Panel title={`${gaps.length} open design or evidence questions`}>
        <p className="muted">
          This is a list of missing information, not a readiness score. A human
          still decides whether the evidence supports the intended use. An empty
          software graph means software design is not assessed; it does not
          establish architectural completeness.
        </p>
        <ul className="gap-list">
          {gaps.map((gap) => (
            <li key={gap.id}>
              <strong>{gap.title}</strong>
              <span>{gap.detail}</span>
            </li>
          ))}
        </ul>
        {gaps.length === 0 && (
          <p>
            The recorded fields are complete. Review the evidence and remaining
            risks with the accountable owner.
          </p>
        )}
      </Panel>
      <Panel title="Bring an existing specification into the map">
        <p>
          Use the local companion with your existing Claude Code login. It
          submits only the file you select and returns a draft for review.
        </p>
        <pre>
          <code>
            {
              "git clone https://github.com/GlenTiki/tools-of-the-trade.git\ncd tools-of-the-trade\nnpm ci\nnpm run spec:convert -- --input system-spec.md --output project.json"
            }
          </code>
        </pre>
        <p>
          Then use <strong>Import project</strong> in this app. Review the map
          before asking an agent to implement it.
        </p>
        <p className="muted">
          The website has no model credentials. The local converter disables
          tools and MCP. Add <code>--prompt-only</code> to inspect the prompt
          without a model call.
        </p>
        <a
          href="https://github.com/GlenTiki/tools-of-the-trade/blob/main/docs/tool-selection.md"
          target="_blank"
          rel="noreferrer"
        >
          Why these visual languages and tools?
        </a>
      </Panel>
      <details className="panel">
        <summary>Read the complete implementation brief</summary>
        <pre className="brief-preview">{brief}</pre>
      </details>
      <article className="print-plan">
        <h1>{project.title}</h1>
        <pre>{brief}</pre>
      </article>
    </div>
  );
}
