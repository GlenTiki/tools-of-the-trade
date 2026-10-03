import { projectSchema } from "./schema";
import type { Project, Component } from "./schema";

export const MAX_PROJECT_BYTES = 1_048_576;
export function assertSize(text: string): void {
  if (new TextEncoder().encode(text).length > MAX_PROJECT_BYTES)
    throw new Error("Project exceeds the 1 MiB limit.");
}
function unique(values: string[], context: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value))
      throw new Error(`Duplicate ID ${value} in ${context}.`);
    seen.add(value);
  }
}
function references(
  values: string[],
  allowed: Set<string>,
  context: string,
): void {
  unique(values, context);
  for (const value of values)
    if (!allowed.has(value))
      throw new Error(`${context} refers to missing ID ${value}.`);
}
function parents(nodes: Component[]): void {
  const index = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    const seen = new Set([node.id]);
    let parent = node.parentId;
    while (parent !== null) {
      if (seen.has(parent)) throw new Error(`Parent cycle at ${node.id}.`);
      const ancestor = index.get(parent);
      if (!ancestor)
        throw new Error(`${node.id} refers to missing parent ${parent}.`);
      seen.add(parent);
      parent = ancestor.parentId;
    }
  }
}
function componentReferences(
  node: Component,
  needs: Set<string>,
  rules: Set<string>,
): void {
  references(node.needIds, needs, node.id);
  references(node.ruleIds, rules, node.id);
  unique(
    node.fields.map((field) => field.id),
    `${node.id} fields`,
  );
  unique(
    node.steps.map((step) => step.id),
    `${node.id} steps`,
  );
  for (const step of node.steps) references(step.ruleIds, rules, step.id);
}
export function validateProjectReferences(project: Project): Project {
  const groups = [
    project.needs,
    project.rules,
    project.sources,
    project.nodes,
    project.edges,
    project.checks,
    project.decisions,
  ];
  unique(
    groups.flatMap((group) => group.map((item) => item.id)),
    "project",
  );
  const needs = new Set(project.needs.map((need) => need.id));
  const rules = new Set(project.rules.map((rule) => rule.id));
  const nodes = new Set(project.nodes.map((node) => node.id));
  parents(project.nodes);
  for (const node of project.nodes) componentReferences(node, needs, rules);
  for (const edge of project.edges) {
    for (const endpoint of [edge.source, edge.target])
      references([endpoint], nodes, edge.id);
  }
  for (const check of project.checks) {
    references(check.needIds, needs, check.id);
    references(check.ruleIds, rules, check.id);
    references(check.componentIds, nodes, check.id);
  }
  return project;
}
export function parseProject(text: string): Project {
  assertSize(text);
  return validateProjectReferences(projectSchema.parse(JSON.parse(text)));
}
