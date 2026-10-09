import { lazy, Suspense, useState } from "react";
import { createPortal } from "react-dom";
import { conceptById } from "../content/catalogue";
import examples from "../content/worked-examples";
import { suggestTopics } from "../content/suggestions";
import { Modal } from "./Controls";
import "./GuideHelp.css";

const Learn = lazy(() => import("./Learn"));

export default function GuideHelp({
  context,
  label,
  value = "",
}: {
  context: string;
  label: string;
  value?: string;
}) {
  const [topic, setTopic] = useState<string | null>(null);
  const suggestions = suggestTopics(context, value);
  if (!suggestions.length) return null;
  return (
    <details className="guide-help">
      <summary>Field guide: {label}</summary>
      <p className="guide-help-intro">
        Related to this input. These suggestions help you explore a decision;
        they do not change your project.
      </p>
      {suggestions.map((suggestion) => {
        const concept = conceptById.get(suggestion.id)!;
        const example = examples.find((item) =>
          item.topics.includes(concept.id),
        );
        return (
          <article key={concept.id}>
            <h3>{concept.title}</h3>
            <p className="guide-help-reason">{suggestion.reason}</p>
            <p>{concept.summary}</p>
            {example && (
              <details className="guide-help-example">
                <summary>Example: {example.title}</summary>
                <p>{example.situation}</p>
                <p>
                  <strong>Input:</strong> {example.input}
                </p>
                <p>
                  <strong>Expected result:</strong> {example.expected}
                </p>
              </details>
            )}
            <button type="button" onClick={() => setTopic(concept.id)}>
              Read {concept.title}
            </button>
          </article>
        );
      })}
      {topic &&
        createPortal(
          <Modal
            title="Field guide"
            className="field-guide-dialog"
            onClose={() => setTopic(null)}
          >
            <p className="muted">
              Your draft stays in place while you explore. Close this guide to
              return to {label.toLowerCase()}.
            </p>
            <Suspense fallback={<p>Opening the field guide…</p>}>
              <Learn initialConcept={topic} />
            </Suspense>
          </Modal>,
          document.body,
        )}
    </details>
  );
}
