import { expect, it } from "vitest";
import { createProject } from "../domain";
import { removeNeed, removeRule, removeComponent } from "./editing";

it("removes references to a deleted need without dropping the checks", () => {
  const project = createProject(true);
  const id = project.needs[0].id;
  const updated = removeNeed(project, id);
  expect(updated.needs.some((n) => n.id === id)).toBe(false);
  expect(updated.nodes.some((n) => n.needIds.includes(id))).toBe(false);
  expect(updated.checks.some((c) => c.needIds.includes(id))).toBe(false);
  expect(updated.checks).toHaveLength(project.checks.length);
});

it("removes a deleted rule from component processes and checks", () => {
  const project = createProject(true);
  const id = project.rules[0].id;
  const updated = removeRule(project, id);
  expect(updated.rules.some((r) => r.id === id)).toBe(false);
  expect(
    updated.nodes.some((n) => n.steps.some((s) => s.ruleIds.includes(id))),
  ).toBe(false);
  expect(updated.checks.some((c) => c.ruleIds.includes(id))).toBe(false);
});

it("deletes a component subtree and its edges but keeps evaluation work", () => {
  const project = createProject(true);
  const removed = new Set(
    project.nodes
      .filter((n) => n.id === "service" || n.parentId === "service")
      .map((n) => n.id),
  );
  const updated = removeComponent(project, "service");
  expect(updated.nodes.some((n) => removed.has(n.id))).toBe(false);
  expect(
    updated.edges.some((e) => removed.has(e.source) || removed.has(e.target)),
  ).toBe(false);
  expect(
    updated.checks.some((c) => c.componentIds.some((id) => removed.has(id))),
  ).toBe(false);
});
