import { z } from "zod";
import { conceptById, concepts, requirements } from "../content/catalogue";
import { createProject, MAX_PROJECT_BYTES, parseProject } from "../domain";
import type { Check, Project } from "../domain";

const requirementById = new Map(
  requirements.map((requirement) => [requirement.id, requirement]),
);
const legacySchema = z.strictObject({
  version: z.literal(1),
  selected: z
    .array(
      z
        .string()
        .refine((id) => conceptById.has(id), "Unknown field-guide concept."),
    )
    .max(concepts.length),
  platform: z.enum(["all", "azure", "aws", "gcp", "vercel"]),
  notes: z.record(
    z
      .string()
      .refine(
        (id) => requirementById.has(id),
        "Unknown field-guide requirement.",
      ),
    z.strictObject({
      status: z.enum(["unresolved", "defined", "evidenced", "excluded"]),
      note: z.string().max(8000),
    }),
  ),
});
type LegacyPlan = z.infer<typeof legacySchema>;

function requirementCheck(requirementId: string): Check {
  const requirement = requirementById.get(requirementId);
  if (!requirement)
    throw new Error(`Unknown field-guide requirement: ${requirementId}.`);
  return {
    id: `guide-${requirement.id}`,
    title: requirement.title,
    method: requirement.why,
    dataset: requirement.dataset,
    metric: requirement.metric,
    expected: "",
    owner: "",
    status: "unresolved",
    evidence: "",
    needIds: [],
    ruleIds: [],
    componentIds: [],
  };
}
export function addConceptToProject(
  project: Project,
  conceptId: string,
): Project {
  const concept = conceptById.get(conceptId);
  if (!concept) throw new Error(`Unknown field-guide concept: ${conceptId}.`);
  const checks = new Map(project.checks.map((check) => [check.id, check]));
  for (const requirement of concept.requirements) {
    const check = requirementCheck(requirement);
    if (!checks.has(check.id)) checks.set(check.id, check);
  }
  const selection = `Field-guide concept: ${concept.title} (${concept.id}).`;
  const assumptions = project.assumptions.includes(selection)
    ? [...project.assumptions]
    : [...project.assumptions, selection];
  return { ...project, checks: [...checks.values()], assumptions };
}
function migrateLegacy(legacy: LegacyPlan): Project {
  let project = createProject();
  project.title = "Imported Tools of the Trade plan";
  for (const id of legacy.selected) project = addConceptToProject(project, id);
  const checks = new Map(project.checks.map((check) => [check.id, check]));
  for (const [id, entry] of Object.entries(legacy.notes)) {
    const check = requirementCheck(id);
    checks.set(check.id, {
      ...check,
      status: entry.status,
      evidence: entry.note,
    });
  }
  project.checks = [...checks.values()];
  project.assumptions.push(
    `Legacy platform selection: ${legacy.platform}; this is historical planning context, not a deployment or runtime preference.`,
  );
  project.assumptions.push(
    "Imported notes and evidence statuses are preserved user entries; this import does not verify their claims.",
  );
  return parseProject(JSON.stringify(project));
}
export function importProjectFile(text: string): {
  project: Project;
  migrated: boolean;
} {
  if (new TextEncoder().encode(text).length > MAX_PROJECT_BYTES)
    throw new Error("Project file exceeds the 1 MiB limit.");
  const raw: unknown = JSON.parse(text);
  if (raw !== null && typeof raw === "object" && "schemaVersion" in raw)
    return { project: parseProject(text), migrated: false };
  return { project: migrateLegacy(legacySchema.parse(raw)), migrated: true };
}
