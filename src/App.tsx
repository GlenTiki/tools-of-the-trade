import { lazy, Suspense, useRef, useState, useSyncExternalStore } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Compass,
  Download,
  GitBranch,
  Layers,
  RotateCcw,
  Upload,
} from "lucide-react";
import { createProject, projectGaps, type Project } from "./domain";
import { conceptById } from "./content/catalogue";
import { addConceptToProject, importProjectFile } from "./workspace/guide-plan";
import { downloadFile } from "./workspace/files";
import { useProject } from "./workspace/useProject";
import Guide from "./components/Guide";
import Evaluation from "./components/Evaluation";
import Delivery from "./components/Delivery";
import { Modal } from "./components/Controls";
import "./styles.css";

const Learn = lazy(() => import("./components/Learn"));
const Architecture = lazy(() => import("./components/Architecture"));
const views = [
  { id: "guide", label: "Guided plan", icon: Compass },
  { id: "map", label: "Architecture", icon: GitBranch },
  { id: "evaluation", label: "Evaluation", icon: ClipboardCheck },
  { id: "delivery", label: "Delivery", icon: Layers },
  { id: "learn", label: "Field guide", icon: BookOpen },
];

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
function readView() {
  const value = window.location.hash.slice(1);
  return views.some((v) => v.id === value) ? value : "guide";
}

function SaveLabel({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "New draft · stays in this browser",
    saved: "Saved in this browser",
    unavailable: "Browser save unavailable · export to keep your work",
    recovery:
      "Saved file needs recovery · new edits last only while this page stays open",
    invalid: "Project could not be saved · review the invalid edit",
  };
  return (
    <span className={`save-label ${status}`} role="status">
      <span className="status-dot" />
      {labels[status]}
    </span>
  );
}

function RecoveryBanner({
  text,
  onRecover,
}: {
  text: string;
  onRecover: () => void;
}) {
  return (
    <div className="notice warning">
      <strong>Your previous saved file could not be opened.</strong>
      <p>
        It is preserved. Download it before replacing the saved copy. New edits
        last only while this page stays open, until you choose to save a new
        project.
      </p>
      <div className="button-row">
        <button
          onClick={() => downloadFile("tools-of-the-trade-recovery.json", text)}
        >
          Download preserved file
        </button>
        <button onClick={onRecover}>Save this as a new project</button>
      </div>
    </div>
  );
}

type Pending =
  | { kind: "import"; project: Project; migrated: boolean }
  | { kind: "example" | "blank" | "recovery" };

function ConfirmChange({
  pending,
  onClose,
  onConfirm,
  project,
  recovery,
}: {
  pending: Pending;
  onClose: () => void;
  onConfirm: () => void;
  project: Project;
  recovery: string | null;
}) {
  const titles = {
    import: "Review this project before opening",
    example: "Open the worked example?",
    blank: "Start a new project?",
    recovery: "Replace the saved copy?",
  };
  return (
    <Modal title={titles[pending.kind]} onClose={onClose}>
      {pending.kind === "import" && (
        <div className="import-preview">
          <h3>{pending.project.title}</h3>
          <p>{pending.project.objective || "No outcome recorded yet."}</p>
          <p>
            {pending.project.needs.length} needs ·{" "}
            {pending.project.rules.length} rules ·{" "}
            {pending.project.nodes.length} components ·{" "}
            {pending.project.checks.length} checks
          </p>
          {pending.migrated && (
            <p>
              The earlier field-guide plan has been converted. Its notes and
              statuses are preserved.
            </p>
          )}
        </div>
      )}
      <p>
        This replaces the current project in this browser. Export it first if
        you want to keep a separate copy. Undo is available until you reload.
      </p>
      {recovery !== null && (
        <div className="notice warning">
          <p>
            The unreadable saved file will also be replaced. Download it here if
            you want to recover it later.
          </p>
          <button
            onClick={() =>
              downloadFile("tools-of-the-trade-recovery.json", recovery)
            }
          >
            Download preserved file
          </button>
        </div>
      )}
      <div className="button-row">
        <button
          onClick={() =>
            downloadFile(
              "current-project-backup.json",
              JSON.stringify(project, null, 2),
            )
          }
        >
          Export current project
        </button>
        <button onClick={onClose}>Cancel</button>
        <button className="primary" onClick={onConfirm}>
          Replace current project
        </button>
      </div>
    </Modal>
  );
}

export default function App() {
  const workspace = useProject();
  const { project, update } = workspace;
  const view = useSyncExternalStore(subscribe, readView);
  const fileInput = useRef<HTMLInputElement>(null);
  const main = useRef<HTMLElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState("");
  const gaps = projectGaps(project);
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1024 * 1024)
        throw new Error("Choose a project smaller than 1 MiB.");
      const parsed = importProjectFile(await file.text());
      setPending({ kind: "import", ...parsed });
    } catch (error) {
      setNotice(
        `The project was not changed. ${error instanceof Error ? error.message.slice(0, 800) : "The file could not be read."}`,
      );
    }
  }
  function confirmChange() {
    if (!pending) return;
    if (pending.kind === "recovery") workspace.releaseRecovery();
    else
      workspace.replace(
        pending.kind === "import"
          ? pending.project
          : createProject(pending.kind === "example"),
      );
    setPending(null);
    window.location.hash = "guide";
    setNotice("Project opened. Use the guided steps or explore any view.");
  }
  function useConcept(id: string) {
    update(addConceptToProject(project, id));
    setNotice(
      `Added the evidence prompts for ${conceptById.get(id)?.title ?? id} to your evaluation plan.`,
    );
  }
  const props = { project, update };
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a href="#guide" className="brand" aria-label="Tools of the Trade home">
          <img
            src={`${import.meta.env.BASE_URL}brightbeam-logo.png`}
            alt="Brightbeam"
          />
          <span>
            <strong>Tools of the Trade</strong>
            <small>Learn · design · build the evidence</small>
          </span>
        </a>
        <a
          className="source-link"
          href="https://github.com/GlenTiki/tools-of-the-trade"
          target="_blank"
          rel="noreferrer"
        >
          Open source ↗
        </a>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        {views.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={view === id ? "page" : undefined}
          >
            <Icon size={18} aria-hidden />
            {label}
          </a>
        ))}
      </nav>
      <div className="project-bar">
        <div>
          <strong title={project.title}>{project.title}</strong>
          <SaveLabel status={workspace.status} />
        </div>
        <div className="button-row">
          <button
            onClick={workspace.undo}
            disabled={!workspace.canUndo}
            title="Undo the last edit"
          >
            <RotateCcw size={15} aria-hidden />
            Undo
          </button>
          <button onClick={() => fileInput.current?.click()}>
            <Upload size={15} aria-hidden />
            Import project
          </button>
          <button
            onClick={() =>
              downloadFile(
                "tools-of-the-trade-project.json",
                JSON.stringify(project, null, 2),
              )
            }
          >
            <Download size={15} aria-hidden />
            Export project
          </button>
          <button onClick={() => setPending({ kind: "blank" })}>
            New project
          </button>
        </div>
        <input
          type="file"
          ref={fileInput}
          accept="application/json,.json"
          className="visually-hidden"
          aria-label="Choose a project file"
          onChange={(e) => {
            void importFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <main ref={main} id="main" tabIndex={-1}>
        {workspace.error && (
          <div className="notice warning dismissible" role="alert">
            <span>{workspace.error}</span>
            <button onClick={workspace.clearError}>Dismiss error</button>
          </div>
        )}
        <div aria-live="polite" aria-atomic="true">
          {notice && (
            <div className="notice dismissible">
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        {workspace.recovery !== null && (
          <RecoveryBanner
            text={workspace.recovery}
            onRecover={() => setPending({ kind: "recovery" })}
          />
        )}
        <Suspense
          fallback={<div className="panel loading">Loading the workspace…</div>}
        >
          {view === "guide" && (
            <Guide
              {...props}
              onExample={() => setPending({ kind: "example" })}
            />
          )}
          {view === "map" && <Architecture {...props} />}
          {view === "evaluation" && <Evaluation {...props} />}
          {view === "delivery" && <Delivery {...props} />}
          {view === "learn" && <Learn onUseConcept={useConcept} />}
        </Suspense>
      </main>
      <footer className="site-footer">
        <p>
          {gaps.length} open design or evidence questions ·{" "}
          <button
            className="text-button"
            onClick={() => {
              update({ ...project, tutorialStep: 6 });
              window.location.hash = "guide";
            }}
          >
            Review the handoff
          </button>
        </p>
        <p>
          Your project stays in this browser. Export it to share or back it up.{" "}
          <a
            href="https://github.com/GlenTiki/tools-of-the-trade#privacy-and-data"
            target="_blank"
            rel="noreferrer"
          >
            How data is handled
          </a>
        </p>
      </footer>
      {pending && (
        <ConfirmChange
          pending={pending}
          project={project}
          recovery={workspace.recovery}
          onClose={() => setPending(null)}
          onConfirm={confirmChange}
        />
      )}
    </>
  );
}
