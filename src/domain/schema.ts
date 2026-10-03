import { z } from "zod";

const prose = z.string().max(20_000);
const id = z.string().min(1).max(160);
const ids = z.array(id).max(500);
const list = <T extends z.ZodType>(item: T) => z.array(item).max(500);
const timestamp = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
  .refine((value) => {
    const date = new Date(value);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().replace(".000Z", "Z") === value
    );
  }, "Use a valid UTC timestamp with seconds and Z.");

export const needSchema = z.strictObject({
  id,
  actor: prose,
  task: prose,
  outcome: prose,
  acceptance: prose,
  owner: prose,
});
export const ruleSchema = z.strictObject({
  id,
  name: prose,
  when: prose,
  then: prose,
  exceptions: prose,
  source: prose,
  owner: prose,
  status: z.enum(["unconfirmed", "confirmed"]),
  examplePass: prose,
  exampleFail: prose,
});
export const sourceSchema = z.strictObject({
  id,
  name: prose,
  division: prose,
  product: prose,
  authority: prose,
  updateCadence: prose,
  allowedUse: prose,
  owner: prose,
});
export const fieldSchema = z.strictObject({
  id,
  name: prose,
  type: z.enum(["string", "number", "boolean", "date", "object", "array"]),
  required: z.boolean(),
  classification: z.enum(["public", "internal", "sensitive"]),
});
export const processStepSchema = z.strictObject({
  id,
  name: prose,
  kind: z.enum(["input", "rule", "tool", "review", "output"]),
  ruleIds: ids,
});
export const componentSchema = z.strictObject({
  id,
  kind: z.enum([
    "ui",
    "service",
    "database",
    "source",
    "retrieval",
    "model",
    "queue",
    "worker",
    "human",
    "router",
    "policy",
  ]),
  label: prose,
  description: prose,
  domain: prose,
  parentId: id.nullable(),
  position: z.strictObject({ x: z.number().finite(), y: z.number().finite() }),
  needIds: ids,
  ruleIds: ids,
  fields: list(fieldSchema),
  steps: list(processStepSchema),
});
export const connectionSchema = z.strictObject({
  id,
  source: id,
  target: id,
  label: prose,
  kind: z.enum(["request", "data", "async", "review"]),
});
export const checkSchema = z.strictObject({
  id,
  title: prose,
  method: prose,
  dataset: prose,
  metric: prose,
  expected: prose,
  owner: prose,
  status: z.enum(["unresolved", "defined", "evidenced", "excluded"]),
  evidence: prose,
  needIds: ids,
  ruleIds: ids,
  componentIds: ids,
});
export const decisionSchema = z.strictObject({
  id,
  title: prose,
  lifecycle: z.enum(["design", "implementation", "release", "operation"]),
  owner: prose,
  status: z.enum(["open", "accepted", "revisit"]),
  notes: prose,
  evidence: prose,
  templateId: id.optional(),
  answers: z.record(id, prose).optional(),
});
export const projectSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id,
  title: prose,
  objective: prose,
  audience: prose,
  baseline: prose,
  successMeasure: prose,
  outcomeOwner: prose,
  createdAt: timestamp,
  updatedAt: timestamp,
  roles: list(prose),
  choices: z.strictObject({
    persistence: z.boolean(),
    documents: z.boolean(),
    divisionRouting: z.boolean(),
    longRunning: z.boolean(),
    humanApproval: z.boolean(),
  }),
  needs: list(needSchema),
  rules: list(ruleSchema),
  sources: list(sourceSchema),
  nodes: list(componentSchema),
  edges: list(connectionSchema),
  checks: list(checkSchema),
  decisions: list(decisionSchema),
  assumptions: list(prose),
  tutorialStep: z.number().int().min(0).max(100),
});
export type Project = z.infer<typeof projectSchema>;
export type Need = z.infer<typeof needSchema>;
export type Rule = z.infer<typeof ruleSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Field = z.infer<typeof fieldSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
export type Component = z.infer<typeof componentSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type Check = z.infer<typeof checkSchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type Architecture = Pick<Project, "nodes" | "edges">;
export interface Gap {
  id: string;
  title: string;
  detail: string;
  area: string;
}
