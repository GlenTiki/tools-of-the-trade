import { useState } from "react";
import { parseProject, type Project } from "../domain";
import {
  loadBrowserWorkspace,
  saveBrowserWorkspace,
  timestamp,
} from "./storage";

export function useProject() {
  const [stored, setStored] = useState(loadBrowserWorkspace);
  const [history, setHistory] = useState<Project[]>([]);
  const [error, setError] = useState("");
  function update(project: Project) {
    const next = { ...project, updatedAt: timestamp() };
    try {
      parseProject(JSON.stringify(next));
    } catch (cause) {
      setError(
        `This edit was not applied. Your previous project is intact. ${cause instanceof Error ? cause.message.slice(0, 500) : "The project limit was exceeded."}`,
      );
      return;
    }
    setError("");
    setHistory([...history.slice(-29), stored.project]);
    const status =
      stored.recovery === null ? saveBrowserWorkspace(next) : "recovery";
    setStored({ ...stored, project: next, status });
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory(history.slice(0, -1));
    setStored({
      ...stored,
      project: previous,
      status:
        stored.recovery === null ? saveBrowserWorkspace(previous) : "recovery",
    });
  }
  function releaseRecovery() {
    setStored({
      ...stored,
      recovery: null,
      status: saveBrowserWorkspace(stored.project),
    });
  }
  function replace(project: Project) {
    setHistory([...history.slice(-29), stored.project]);
    setStored({
      project,
      recovery: null,
      status: saveBrowserWorkspace(project),
    });
  }
  return {
    ...stored,
    error,
    clearError: () => setError(""),
    update,
    replace,
    undo,
    canUndo: history.length > 0,
    releaseRecovery,
  };
}
