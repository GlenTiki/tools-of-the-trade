import type { Project } from "./schema";
import { deriveArchitecture } from "./architecture";
import { deriveChecks } from "./checks";
import { fillExample } from "./example";
import { enrichExampleArchitecture } from "./example-architecture";
import { enrichExampleChecks } from "./example-checks";

export function createProject(example = false): Project {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const project: Project = {
    schemaVersion: 1,
    id: `project-${crypto.randomUUID()}`,
    title: "Untitled project",
    objective: "",
    audience: "",
    baseline: "",
    successMeasure: "",
    outcomeOwner: "",
    createdAt: now,
    updatedAt: now,
    roles: [],
    choices: {
      persistence: false,
      documents: false,
      divisionRouting: false,
      longRunning: false,
      humanApproval: false,
    },
    needs: [],
    rules: [],
    sources: [],
    nodes: [],
    edges: [],
    checks: [],
    decisions: [],
    assumptions: [],
    tutorialStep: 0,
  };
  if (example) {
    fillExample(project);
    Object.assign(project, deriveArchitecture(project));
    enrichExampleArchitecture(project);
    project.checks = deriveChecks(project);
    enrichExampleChecks(project);
  }
  return project;
}
