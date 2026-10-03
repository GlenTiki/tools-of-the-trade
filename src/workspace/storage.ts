import { createProject, parseProject, type Project } from "../domain";

export type SaveStatus =
  "draft" | "saved" | "unavailable" | "recovery" | "invalid";
export interface StoredWorkspace {
  project: Project;
  status: SaveStatus;
  recovery: string | null;
}
const storageKey = "tools-of-the-trade.project.v1";

export function readWorkspace(
  storage: Pick<Storage, "getItem">,
): StoredWorkspace {
  let text: string | null = null;
  try {
    text = storage.getItem(storageKey);
    return {
      project: text ? parseProject(text) : createProject(),
      status: text ? "saved" : "draft",
      recovery: null,
    };
  } catch {
    return {
      project: createProject(),
      status: text ? "recovery" : "unavailable",
      recovery: text,
    };
  }
}

export function saveWorkspace(
  storage: Pick<Storage, "setItem">,
  project: Project,
): SaveStatus {
  const text = JSON.stringify(project);
  try {
    parseProject(text);
  } catch {
    return "invalid";
  }
  try {
    storage.setItem(storageKey, text);
    return "saved";
  } catch {
    return "unavailable";
  }
}

export function timestamp(date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function browserStorage(): Storage {
  return window.localStorage;
}

export function loadBrowserWorkspace(): StoredWorkspace {
  try {
    return readWorkspace(browserStorage());
  } catch {
    return { project: createProject(), status: "unavailable", recovery: null };
  }
}

export function saveBrowserWorkspace(project: Project): SaveStatus {
  try {
    return saveWorkspace(browserStorage(), project);
  } catch {
    return "unavailable";
  }
}
