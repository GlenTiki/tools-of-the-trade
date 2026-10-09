import { useId, useState } from "react";
import lifecycle from "../content/golden-lifecycle.json";
import "./GoldenDataset.css";

export default function GoldenDataset() {
  const [selected, select] = useState(lifecycle.stages[0].id);
  const panelId = useId();
  const stage = lifecycle.stages.find((item) => item.id === selected)!;
  return (
    <section
      className="dataset-walkthrough"
      aria-label="Golden dataset lifecycle"
    >
      <h2>{lifecycle.title}</h2>
      <p>{lifecycle.introduction}</p>
      <details className="dataset-case" open>
        <summary>Follow case G-12</summary>
        <p>
          <strong>Policy and review rules:</strong> {lifecycle.policy}
        </p>
        <p>
          <strong>Question:</strong> {lifecycle.question}
        </p>
      </details>
      <p>Choose a state to see who does the work and how the record changes.</p>
      <ol className="dataset-states" aria-label="Dataset states">
        {lifecycle.stages.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={selected === item.id}
              aria-controls={panelId}
              onClick={() => select(item.id)}
            >
              <span>{index + 1}.</span> {item.title}
            </button>
          </li>
        ))}
      </ol>
      <article id={panelId} className="dataset-stage" aria-label={stage.title}>
        <p className="eyebrow">
          State {lifecycle.stages.indexOf(stage) + 1} of{" "}
          {lifecycle.stages.length}
        </p>
        <h3>{stage.title}</h3>
        <p className="dataset-owner">
          <strong>Responsible:</strong> {stage.owner}
        </p>
        <p>
          <strong>Works with:</strong> {stage.collaborator}
        </p>
        <p>
          <strong>What they do:</strong> {stage.action}
        </p>
        <div className="dataset-records">
          <div>
            <h4>Before this work</h4>
            <pre>{stage.before}</pre>
          </div>
          <div>
            <h4>After this work</h4>
            <pre className="dataset-after">{stage.after}</pre>
          </div>
        </div>
        <dl>
          <dt>What they hand over</dt>
          <dd>{stage.artifact}</dd>
          <dt>What permits the next state</dt>
          <dd>{stage.gate}</dd>
          <dt>What stops it moving forward</dt>
          <dd>{stage.blocked}</dd>
        </dl>
        <nav className="dataset-transitions" aria-label="Possible next states">
          {stage.next.map((id) => (
            <button type="button" key={id} onClick={() => select(id)}>
              Next: {lifecycle.stages.find((item) => item.id === id)!.title}
            </button>
          ))}
        </nav>
      </article>
    </section>
  );
}
