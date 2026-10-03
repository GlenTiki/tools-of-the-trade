import { lazy, Suspense, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Compass, Users } from "lucide-react";
import guidance from "../content/design-guidance.json";
import {
  OutcomeForm,
  NeedsForm,
  RulesForm,
  type EditorProps,
} from "./ProjectForms";
import { Select } from "./Controls";
import Evaluation from "./Evaluation";
import Delivery from "./Delivery";
import Handoff from "./Handoff";

const Architecture = lazy(() => import("./Architecture"));

function RoleGuide({
  role,
  setRole,
}: {
  role: string;
  setRole: (role: string) => void;
}) {
  const [partner, setPartner] = useState("engineer");
  const profile =
    guidance.profiles.find((p) => p.id === role) ?? guidance.profiles[0];
  const pair = guidance.collaborations.find(
    (c) =>
      c.roles.includes(role) && c.roles.includes(partner) && role !== partner,
  );
  return (
    <details className="role-guide">
      <summary>
        <Users size={18} aria-hidden />
        Your role & your collaborators
      </summary>
      <p className="muted">
        Choose your current responsibility. The same person may act as PM,
        technical lead and reviewer at different points.
      </p>
      <div className="form-grid">
        <Select
          label="I am contributing as…"
          value={role}
          onChange={setRole}
          options={guidance.profiles.map((p) => ({
            value: p.id,
            label: p.title,
          }))}
        />
        <Select
          label="I am working with…"
          value={partner}
          onChange={setPartner}
          options={guidance.profiles.map((p) => ({
            value: p.id,
            label: p.title,
          }))}
        />
      </div>
      <h3>
        {profile.title}: {profile.summary}
      </h3>
      <p>{profile.contribution}</p>
      <ul>
        {profile.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <p>
        <strong>Your contribution:</strong> {profile.artifact}
      </p>
      <p className="muted">
        Pay particular attention to:{" "}
        {profile.steps
          .map((id) => guidance.tutorial.find((s) => s.id === id)?.title)
          .join(" → ")}
        .
      </p>
      {pair ? (
        <div className="collaboration">
          <strong>{pair.title}</strong>
          <p>{pair.question}</p>
          <p>
            <strong>Create together:</strong> {pair.artifact}
          </p>
        </div>
      ) : (
        <div className="collaboration">
          <strong>Review with a peer</strong>
          <ul>
            {profile.reviewQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </details>
  );
}

function StepBody({ step, ...props }: EditorProps & { step: number }) {
  const views: ReactNode[] = [
    <OutcomeForm {...props} />,
    <NeedsForm {...props} />,
    <RulesForm {...props} />,
    <Suspense fallback={<p>Loading the architecture editor…</p>}>
      <Architecture {...props} />
    </Suspense>,
    <Evaluation {...props} />,
    <Delivery {...props} />,
    <Handoff {...props} />,
  ];
  return views[step];
}

export default function Guide({
  project,
  update,
  onExample,
}: EditorProps & { onExample: () => void }) {
  const role =
    guidance.profiles.find((profile) => profile.id === project.roles[0])?.id ??
    "pm";
  const current = Math.min(project.tutorialStep, guidance.tutorial.length - 1);
  const step = guidance.tutorial[current];
  function go(index: number) {
    update({ ...project, tutorialStep: index });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <div className="guide">
      <aside className="guide-rail">
        <p className="eyebrow">
          <Compass size={15} aria-hidden /> Your guided plan
        </p>
        <h2>From client mandate to useful outcomes.</h2>
        <p className="muted">
          Seven connected conversations about the engagement. Revisit or skip
          stages to suit the work; advisory delivery need not include software.
        </p>
        <a href="#delivery">Open engagement checkpoints</a>
        <ol className="step-list">
          {guidance.tutorial.map((item, i) => (
            <li key={item.id}>
              <button
                aria-current={current === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                <span className="step-number">{i + 1}</span>
                <span>{item.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <button className="example-button" onClick={onExample}>
          Explore a specialist AI example
        </button>
        <p className="small muted">
          Optional: a fictional AI support assistant. Its routing and model
          choices do not apply to every engagement.
        </p>
      </aside>
      <div className="guide-body">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Step {current + 1} of 7 · Engagement plan</p>
            <h1>{step.title}</h1>
            <p>{step.lesson}</p>
          </div>
        </div>
        <div className="lesson">
          <div>
            <span className="eyebrow">The question to answer</span>
            <strong>{step.prompt}</strong>
          </div>
          <details>
            <summary>Show a worked example</summary>
            <p>{step.example}</p>
            <p>
              <strong>Useful progress:</strong> {step.doneWhen}
            </p>
          </details>
        </div>
        <RoleGuide
          role={role}
          setRole={(value) =>
            update({
              ...project,
              roles: [value, ...project.roles.filter((r) => r !== value)],
            })
          }
        />
        <StepBody step={current} project={project} update={update} />
        <div className="step-actions">
          <button disabled={current === 0} onClick={() => go(current - 1)}>
            <ArrowLeft size={16} aria-hidden /> Previous step
          </button>
          <p className="small muted">
            Drafts and unknowns are welcome. You can return to any step.
          </p>
          {current < guidance.tutorial.length - 1 && (
            <button className="primary" onClick={() => go(current + 1)}>
              Next: {guidance.tutorial[current + 1].title}{" "}
              <ArrowRight size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
