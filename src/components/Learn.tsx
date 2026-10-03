import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  conceptById,
  concepts,
  journeys,
  platforms,
  requirements,
} from "../content/catalogue";
import type { Concept } from "../content/catalogue";
import { confusion, cosine, parseVector, wilson } from "../domain/calculators";
import "./Learn.css";

type LearnProps = { onUseConcept?: (id: string) => void };
type Navigate = (id: string) => void;
type View = { kind: "topics" | "journeys"; id: string };
const areas = concepts.filter((concept) => concept.parent === "home");
const requirementById = new Map(
  requirements.map((requirement) => [requirement.id, requirement]),
);

function ancestors(concept: Concept): Concept[] {
  const path = [concept];
  let parent = concept.parent;
  while (parent) {
    const next = conceptById.get(parent);
    if (!next) break;
    path.unshift(next);
    parent = next.parent;
  }
  return path;
}

function findConcepts(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/);
  return concepts.filter((concept) => {
    const text = [
      concept.title,
      concept.summary,
      concept.detail,
      concept.formula,
      ...(concept.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export default function Learn({ onUseConcept }: LearnProps) {
  const [view, setView] = useState<View>({ kind: "topics", id: "home" });
  const [history, setHistory] = useState<View[]>([]);
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [technical, setTechnical] = useState(false);
  const heading = useRef<HTMLDivElement>(null);
  function visit(next: View) {
    setHistory((previous) => [...previous, view]);
    setView(next);
    setQuery("");
    heading.current?.focus();
  }
  function back() {
    const previous = history.at(-1);
    if (!previous) return;
    setView(previous);
    setHistory((items) => items.slice(0, -1));
    setQuery("");
    heading.current?.focus();
  }
  const navigate: Navigate = (id) => visit({ kind: "topics", id });
  return (
    <section
      className="learn-shell"
      aria-label="Tools of the Trade field guide"
    >
      <div className="learn-toolbar">
        <div className="learn-view-switch" aria-label="Field guide views">
          <button
            type="button"
            aria-pressed={view.kind === "topics"}
            onClick={() => navigate("home")}
          >
            <BookOpen size={16} /> Field guide
          </button>
          <button
            type="button"
            aria-pressed={view.kind === "journeys"}
            onClick={() => visit({ kind: "journeys", id: "" })}
          >
            Learning journeys
          </button>
        </div>
        <label className="learn-search">
          <Search size={17} aria-hidden="true" />
          <span className="learn-sr-only">Search the field guide</span>
          <input
            type="search"
            placeholder="Search concepts, tools, methods…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="learn-platform-select">
          Platform
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
          >
            <option value="all">All platforms</option>
            {platforms.platforms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="learn-layout">
        <aside className="learn-navigation" aria-label="Knowledge areas">
          <p className="learn-eyebrow">Explore the system</p>
          <button
            type="button"
            className={view.id === "home" ? "is-active" : ""}
            onClick={() => navigate("home")}
          >
            Overview <span>111</span>
          </button>
          {areas.map((area, index) => (
            <button
              type="button"
              key={area.id}
              className={areaContains(view.id, area.id) ? "is-active" : ""}
              onClick={() => navigate(area.id)}
            >
              <span className="learn-area-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              {area.title}
            </button>
          ))}
          <p className="learn-navigation-note">
            Follow a request through the system. At each boundary, ask what
            evidence would show it works.
          </p>
          <label className="learn-technical">
            <input
              type="checkbox"
              checked={technical}
              onChange={(event) => setTechnical(event.target.checked)}
            />{" "}
            Show technical contracts
          </label>
        </aside>
        <div className="learn-content" ref={heading} tabIndex={-1}>
          {history.length > 0 && (
            <button type="button" className="learn-back" onClick={back}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <LearnContent
            query={query}
            view={view}
            platform={platform}
            technical={technical}
            navigate={navigate}
            onJourney={(id) => visit({ kind: "journeys", id })}
            onUseConcept={onUseConcept}
          />
        </div>
      </div>
    </section>
  );
}

function areaContains(id: string, area: string) {
  const concept = conceptById.get(id);
  return concept ? ancestors(concept).some((item) => item.id === area) : false;
}

type ContentProps = LearnProps & {
  query: string;
  view: View;
  platform: string;
  technical: boolean;
  navigate: Navigate;
  onJourney: Navigate;
};
function LearnContent(props: ContentProps) {
  if (props.query.trim())
    return <SearchResults query={props.query} navigate={props.navigate} />;
  if (props.view.kind === "journeys")
    return (
      <Journeys
        id={props.view.id}
        navigate={props.navigate}
        onJourney={props.onJourney}
      />
    );
  if (props.view.id === "home")
    return (
      <Overview
        navigate={props.navigate}
        onJourney={props.onJourney}
        platform={props.platform}
      />
    );
  const concept = conceptById.get(props.view.id);
  if (!concept)
    return <p>This topic could not be found. Choose an area to continue.</p>;
  return (
    <Topic
      key={concept.id}
      concept={concept}
      navigate={props.navigate}
      technical={props.technical}
      platform={props.platform}
      onUseConcept={props.onUseConcept}
    />
  );
}

function Overview({
  navigate,
  onJourney,
  platform,
}: {
  navigate: Navigate;
  onJourney: Navigate;
  platform: string;
}) {
  return (
    <>
      <div className="learn-hero">
        <div>
          <p className="learn-eyebrow">The Brightbeam field guide</p>
          <h1>
            Understand the parts.
            <br />
            Design with evidence.
          </h1>
          <p>
            Explore how intelligent products work, from your first API to the
            tests and decisions that earn trust.
          </p>
          <button
            type="button"
            className="learn-primary"
            onClick={() => onJourney("first-api")}
          >
            Take your first journey <ArrowRight size={17} />
          </button>
        </div>
        <div
          className="learn-request-map"
          aria-label="Follow a request through the system"
        >
          <p className="learn-eyebrow">Follow a request</p>
          <button type="button" onClick={() => navigate("api")}>
            Your application API
          </button>
          <span aria-hidden="true">↓</span>
          <div>
            <button type="button" onClick={() => navigate("search")}>
              Find evidence
            </button>
            <ArrowRight size={18} aria-hidden="true" />
            <button type="button" onClick={() => navigate("generation")}>
              Generate an answer
            </button>
          </div>
          <span aria-hidden="true">↓</span>
          <button type="button" onClick={() => navigate("evaluation")}>
            Measure the result
          </button>
          <p>Tools, permissions and operations support every step.</p>
        </div>
      </div>
      <div className="learn-section-heading">
        <h2>Choose an area</h2>
        <span>
          {areas.length} areas · {concepts.length} topics
        </span>
      </div>
      <Cards items={areas} navigate={navigate} />
      <div className="learn-callout">
        <strong>Start with the decision you need to make.</strong>
        <p>
          You do not need to read everything. Use a journey, explore a
          component, then bring its evaluation questions into your project.
        </p>
      </div>
      <PlatformLens platform={platform} area="home" />
    </>
  );
}

function Cards({ items, navigate }: { items: Concept[]; navigate: Navigate }) {
  return (
    <div className="learn-cards">
      {items.map((concept) => (
        <button
          type="button"
          key={concept.id}
          className="learn-card"
          onClick={() => navigate(concept.id)}
        >
          <span className="learn-eyebrow">{concept.type}</span>
          <h3>{concept.title}</h3>
          <p>{concept.summary}</p>
          <span className="learn-card-link">
            Explore <ArrowRight size={16} />
          </span>
        </button>
      ))}
    </div>
  );
}

function SearchResults({
  query,
  navigate,
}: {
  query: string;
  navigate: Navigate;
}) {
  const matches = findConcepts(query);
  return (
    <>
      <p className="learn-eyebrow">Search the field guide</p>
      <h1>
        {matches.length} {matches.length === 1 ? "result" : "results"}
      </h1>
      <p className="learn-lede" role="status">
        For “{query}”. Search includes explanations, formulas and alternative
        names.
      </p>
      {matches.length ? (
        <Cards items={matches} navigate={navigate} />
      ) : (
        <div className="learn-callout">
          <strong>Try a broader term.</strong>
          <p>For example: search, dataset, agent, cosine or confidence.</p>
        </div>
      )}
    </>
  );
}

function Journeys({
  id,
  navigate,
  onJourney,
}: {
  id: string;
  navigate: Navigate;
  onJourney: Navigate;
}) {
  const journey = journeys.find((item) => item.id === id);
  if (!journey)
    return (
      <>
        <p className="learn-eyebrow">Learn by following a real task</p>
        <h1>Choose your learning journey</h1>
        <p className="learn-lede">
          Each path connects the concepts, decisions and evidence you need for
          an engineering task.
        </p>
        <div className="learn-cards">
          {journeys.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className="learn-card"
              onClick={() => onJourney(item.id)}
            >
              <span className="learn-eyebrow">
                Journey {index + 1} · {item.steps.length} steps
              </span>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <span className="learn-audience">{item.audience}</span>
              <span className="learn-card-link">
                Start journey <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </>
    );
  return (
    <>
      <p className="learn-eyebrow">{journey.audience}</p>
      <h1>{journey.title}</h1>
      <p className="learn-lede">{journey.summary}</p>
      <ol className="learn-journey">
        {journey.steps.map((step, index) => (
          <li key={step.node}>
            <span className="learn-step-number">{index + 1}</span>
            <div>
              <h2>{conceptById.get(step.node)?.title}</h2>
              <p>{step.task}</p>
              <button
                type="button"
                className="learn-link"
                onClick={() => navigate(step.node)}
              >
                Explore this step <ArrowRight size={16} />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div className="learn-callout">
        <strong>Turn the lesson into a project decision.</strong>
        <p>
          For each step, capture an example of success, an example of failure
          and who can judge the difference.
        </p>
      </div>
    </>
  );
}

type TopicProps = LearnProps & {
  concept: Concept;
  navigate: Navigate;
  technical: boolean;
  platform: string;
};
function Topic({
  concept,
  navigate,
  technical,
  platform,
  onUseConcept,
}: TopicProps) {
  const path = ancestors(concept);
  const children = concepts.filter((item) => item.parent === concept.id);
  return (
    <>
      <nav className="learn-breadcrumb" aria-label="Topic breadcrumb">
        {path.map((item, index) => (
          <span key={item.id}>
            {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
            {item.id === concept.id ? (
              <span aria-current="page">{item.title}</span>
            ) : (
              <button type="button" onClick={() => navigate(item.id)}>
                {item.id === "home" ? "Overview" : item.title}
              </button>
            )}
          </span>
        ))}
      </nav>
      <div className="learn-topic-heading">
        <div>
          <p className="learn-eyebrow">{concept.type}</p>
          <h1>{concept.title}</h1>
          <p className="learn-lede">{concept.summary}</p>
        </div>
        {onUseConcept && (
          <button
            type="button"
            className="learn-primary"
            onClick={() => onUseConcept(concept.id)}
          >
            Use in my project <ArrowRight size={16} />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <section className="learn-children">
          <div className="learn-section-heading">
            <h2>Inside this area</h2>
            <span>{children.length} topics</span>
          </div>
          <Cards items={children} navigate={navigate} />
        </section>
      )}
      <div className="learn-detail-layout">
        <div>
          <section className="learn-panel">
            <h2>How it works</h2>
            {concept.detail.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {concept.formula && (
              <div className="learn-formula">{concept.formula}</div>
            )}
            <Calculator concept={concept.id} />
            <details className="learn-contract" open={technical}>
              <summary>Inputs, outputs and the component contract</summary>
              <div>
                <BulletList title="Inputs" items={concept.inputs} />
                <BulletList title="Outputs" items={concept.outputs} />
              </div>
            </details>
          </section>
          <FailureNotes failures={concept.failures} />
          <CodeExamples concept={concept} />
          <PlatformLens platform={platform} area={path[1]?.id ?? "home"} />
        </div>
        <aside className="learn-detail-side">
          <Evidence concept={concept} />
          <TopicSources concept={concept} />
          <Related concept={concept} navigate={navigate} />
        </aside>
      </div>
    </>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function FailureNotes({ failures }: { failures: string[] }) {
  if (!failures.length) return null;
  return (
    <section className="learn-panel learn-failures">
      <h2>What can go wrong</h2>
      <ul>
        {failures.map((failure) => (
          <li key={failure}>{failure}</li>
        ))}
      </ul>
    </section>
  );
}

function Evidence({ concept }: { concept: Concept }) {
  const checks = concept.requirements
    .map((id) => requirementById.get(id))
    .filter((item) => item !== undefined);
  if (!checks.length) return null;
  return (
    <section className="learn-panel learn-evidence">
      <p className="learn-eyebrow">Build your evidence</p>
      <h2>What to evaluate</h2>
      {checks.map((check) => (
        <details key={check.id}>
          <summary>{check.title}</summary>
          <p>{check.why}</p>
          <dl>
            <dt>Dataset</dt>
            <dd>{check.dataset}</dd>
            <dt>Measure</dt>
            <dd>{check.metric}</dd>
            <dt>Evidence</dt>
            <dd>{check.evidence}</dd>
            <dt>Decision to make</dt>
            <dd>{check.decision}</dd>
          </dl>
        </details>
      ))}
    </section>
  );
}

function TopicSources({ concept }: { concept: Concept }) {
  if (!concept.sources.length) return null;
  return (
    <section className="learn-panel">
      <h2>Go to the source</h2>
      <ul className="learn-source-list">
        {concept.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
              <ArrowUpRight size={14} aria-label="opens in a new tab" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Related({
  concept,
  navigate,
}: {
  concept: Concept;
  navigate: Navigate;
}) {
  if (!concept.related.length) return null;
  return (
    <section className="learn-panel">
      <h2>Connected concepts</h2>
      <div className="learn-related">
        {concept.related.map((relation) => (
          <button
            type="button"
            key={`${relation.id}-${relation.relation}`}
            onClick={() => navigate(relation.id)}
          >
            <span>{relation.relation}</span>
            {conceptById.get(relation.id)?.title}
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );
}

function CodeExamples({ concept }: { concept: Concept }) {
  if (!concept.code?.length) return null;
  return (
    <section className="learn-panel">
      <h2>See it in code</h2>
      {concept.code.map((example, index) => (
        <CodeExample key={index} example={example} />
      ))}
      <p className="learn-caption">
        Examples run only when you copy and execute them. Illustrative examples
        need your configuration and validation.
      </p>
    </section>
  );
}

function CodeExample({
  example,
}: {
  example: NonNullable<Concept["code"]>[number];
}) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(example.text);
      setMessage("Copied");
    } catch {
      setMessage("Select the code below to copy it manually.");
    }
  }
  return (
    <div className="learn-code">
      <div className="learn-code-heading">
        <span>
          {example.language} · {example.status.replaceAll("-", " ")}
        </span>
        <button type="button" onClick={() => void copy()}>
          Copy code
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{example.text}</code>
      </pre>
      <p role="status" className="learn-caption">
        {message}
      </p>
      {example.source && (
        <p className="learn-caption">Source: {example.source}</p>
      )}
    </div>
  );
}

const platformKinds: Record<string, string[]> = {
  api: ["gateway_model_access"],
  data: ["retrieval"],
  search: ["retrieval"],
  generation: ["gateway_model_access"],
  agents: ["orchestration"],
  evaluation: ["evaluation_observability"],
  operations: ["evaluation_observability"],
  hosting: ["custom_training_hosting"],
  adaptation: ["custom_training_hosting"],
};

function PlatformLens({ platform, area }: { platform: string; area: string }) {
  const selected = platforms.platforms.find((item) => item.id === platform);
  if (!selected) return null;
  const capabilities = selected.capabilities.filter(
    (capability) =>
      area === "home" || platformKinds[area]?.includes(capability.kind),
  );
  return (
    <section className="learn-panel learn-platform-lens">
      <p className="learn-eyebrow">Platform perspective</p>
      <h2>{selected.label}</h2>
      <p>
        Implementation options for this part of the system. Your evidence
        requirements stay the same.
      </p>
      {capabilities.map((capability) => (
        <div className="learn-platform-card" key={capability.kind}>
          <h3>{capability.products.join(" · ")}</h3>
          <p>{capability.role}</p>
          {"limit" in capability && (
            <p className="learn-caption">{capability.limit}</p>
          )}
          <div className="learn-documentation-links">
            {capability.sources.map((url, index) => (
              <a href={url} key={url} target="_blank" rel="noreferrer">
                Documentation {index + 1}
                <ArrowUpRight size={14} aria-label="opens in a new tab" />
              </a>
            ))}
          </div>
        </div>
      ))}
      <p className="learn-caption">
        Documentation checked{" "}
        {new Date(platforms.checked_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        . Check the linked product documentation for current regions, account
        access and preview status.
      </p>
    </section>
  );
}

function Calculator({ concept }: { concept: string }) {
  if (["p-embedding", "x-semantic-similarity"].includes(concept))
    return <CosineCalculator />;
  if (["x-wilson", "confidence"].includes(concept)) return <WilsonCalculator />;
  if (concept === "x-precision-recall") return <ConfusionCalculator />;
  return null;
}

function CosineCalculator() {
  const [a, setA] = useState("1, 2, 0");
  const [b, setB] = useState("2, 3, 1");
  const x = parseVector(a);
  const y = parseVector(b);
  const result = x && y ? cosine(x, y) : null;
  return (
    <section className="learn-calculator">
      <h3>Try cosine similarity</h3>
      <div className="learn-calc-fields">
        <label>
          Vector A
          <input value={a} onChange={(event) => setA(event.target.value)} />
        </label>
        <label>
          Vector B
          <input value={b} onChange={(event) => setB(event.target.value)} />
        </label>
      </div>
      <output aria-live="polite">
        {result === null
          ? "Enter two nonzero vectors with the same number of finite values."
          : `Cosine similarity: ${result.toFixed(4)}`}
      </output>
      <p className="learn-caption">
        Separate values with commas or spaces. Cosine compares vector
        directions. It does not establish factual truth or entailment.
      </p>
    </section>
  );
}

function numberInput(value: string) {
  return value.trim() ? Number(value) : NaN;
}
function percent(value: number | null) {
  return value === null ? "Undefined" : `${(value * 100).toFixed(1)}%`;
}

function WilsonCalculator() {
  const [successes, setSuccesses] = useState("16");
  const [total, setTotal] = useState("20");
  const result = wilson(numberInput(successes), numberInput(total));
  return (
    <section className="learn-calculator">
      <h3>Explore a 95% Wilson interval</h3>
      <div className="learn-calc-fields">
        <CountInput
          label="Successful cases"
          value={successes}
          onChange={setSuccesses}
        />
        <CountInput label="Total cases" value={total} onChange={setTotal} />
      </div>
      <output aria-live="polite">
        {result
          ? `${percent(result[0])} to ${percent(result[1])}`
          : "Enter whole counts, with successes between zero and a positive total."}
      </output>
      <p className="learn-caption">
        Uses z = 1.96 for independent binomial trials. Repeated outputs from one
        question are not independent questions. An interval does not correct an
        unrepresentative dataset.
      </p>
    </section>
  );
}

function CountInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ConfusionCalculator() {
  const [values, setValues] = useState(["8", "4", "2", "6"]);
  const result = confusion(
    numberInput(values[0]),
    numberInput(values[1]),
    numberInput(values[2]),
    numberInput(values[3]),
  );
  const labels = [
    "True positives",
    "False positives",
    "False negatives",
    "True negatives",
  ];
  return (
    <section className="learn-calculator">
      <h3>Try a confusion matrix</h3>
      <div className="learn-calc-fields">
        {labels.map((label, index) => (
          <CountInput
            key={label}
            label={label}
            value={values[index]}
            onChange={(value) =>
              setValues((previous) =>
                previous.map((old, i) => (i === index ? value : old)),
              )
            }
          />
        ))}
      </div>
      <output aria-live="polite">
        {result ? (
          <span className="learn-metrics">
            {Object.entries(result).map(([name, value]) => (
              <span key={name}>
                {name === "f1" ? "F1" : name}
                <strong>{percent(value)}</strong>
              </span>
            ))}
          </span>
        ) : (
          "Enter nonnegative whole counts within the safe integer range."
        )}
      </output>
      <p className="learn-caption">
        First define the positive class. A rate with no denominator stays
        undefined. Review errors by user group and task as well as the overall
        average.
      </p>
    </section>
  );
}
