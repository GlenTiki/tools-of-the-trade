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
          Download the plan so the next person can see what to deliver, which
          decisions are settled and what still needs an answer. The project JSON
          file can be reopened in this app. The brief is a readable text
          document. Candidate cases are draft examples to check before using
          them as tests.
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
          hint="An assumption is something you rely on but have not confirmed. Write one per line and say who can check it."
        />
      </Panel>
      <Panel title={`${gaps.length} open design or evidence questions`}>
        <p className="muted">
          These questions point to empty fields and missing links. A complete
          form still needs review by the person responsible for the work. If no
          software components are recorded, this app has not assessed the
          software design.
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
          This optional command-line tool runs on your computer and needs
          Node.js and an existing Claude Code login. Run the commands below in a
          terminal. It sends the selected specification file to Claude and
          returns a draft project.
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
          The website does not hold your model login. The converter disables
          Claude’s tools and external tool connections (MCP). Add{" "}
          <code>--prompt-only</code> to read what it would send without calling
          the model.
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
