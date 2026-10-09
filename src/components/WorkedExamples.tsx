import examples from "../content/worked-examples";

export default function WorkedExamples({ topic }: { topic: string }) {
  const matches = examples.filter((example) => example.topics.includes(topic));
  if (!matches.length) return null;
  return (
    <section className="learn-panel worked-examples">
      <h2>Worked examples</h2>
      <p className="muted">
        Fictional policies and sample data. Each case shows the input, expected
        result and a failure you can test.
      </p>
      {matches.map((example) => (
        <article key={example.id}>
          <h3>{example.title}</h3>
          <p>{example.situation}</p>
          <dl>
            <dt>Input</dt>
            <dd className="worked-case-input">{example.input}</dd>
            <dt>Expected result</dt>
            <dd className="worked-case-result">{example.expected}</dd>
            <dt>Why this result</dt>
            <dd>{example.decision}</dd>
            <dt>A failing result</dt>
            <dd>{example.failure}</dd>
            <dt>How to check it</dt>
            <dd>{example.evidence}</dd>
          </dl>
        </article>
      ))}
    </section>
  );
}
