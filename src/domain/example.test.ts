import { describe, expect, it } from "vitest";
import { createProject } from "./project";
import { parseProject } from "./validation";

describe("fictional support project", () => {
  it("connects at least four owned needs and rules to a portable design", () => {
    const project = createProject(true);
    expect(parseProject(JSON.stringify(project))).toEqual(project);
    expect(project.needs.length).toBeGreaterThanOrEqual(4);
    expect(project.rules.length).toBeGreaterThanOrEqual(4);
    expect(project.outcomeOwner).toMatch(/placeholder/i);
    for (const item of [
      ...project.needs,
      ...project.rules,
      ...project.sources,
    ]) {
      expect(item.owner).toMatch(/placeholder/i);
    }
    for (const need of project.needs) {
      expect(project.nodes.some((node) => node.needIds.includes(need.id))).toBe(
        true,
      );
      expect(
        project.checks.some((check) => check.needIds.includes(need.id)),
      ).toBe(true);
    }
    for (const rule of project.rules) {
      expect(project.nodes.some((node) => node.ruleIds.includes(rule.id))).toBe(
        true,
      );
      expect(
        project.checks.some((check) => check.ruleIds.includes(rule.id)),
      ).toBe(true);
    }
  });

  it("gives components concrete contracts and puts each rule at its boundary", () => {
    const project = createProject(true);
    const service = project.nodes.find((node) => node.id === "service")!;
    const retrieval = project.nodes.find((node) => node.id === "retrieval")!;
    const router = project.nodes.find((node) => node.id === "router")!;
    const model = project.nodes.find((node) => node.id === "model")!;
    expect(service.label).toBe("Application service");
    expect(retrieval.label).toBe("Evidence retrieval");
    expect(service.description).toMatch(/unauthorized|denied/i);
    expect(service.fields).toContainEqual(
      expect.objectContaining({
        name: "question",
        classification: "sensitive",
        required: true,
      }),
    );
    expect(router.ruleIds).toEqual(["rule-scope"]);
    expect(retrieval.ruleIds).toEqual(["rule-scope", "rule-authority"]);
    expect(model.ruleIds).toEqual(["rule-review", "rule-privacy"]);
    expect(service.steps.map((step) => step.kind)).toEqual([
      "input",
      "rule",
      "tool",
      "review",
      "output",
    ]);
    expect(
      project.checks.find((check) => check.id === "check-rule-rule-privacy")
        ?.componentIds,
    ).not.toContain("router");
    expect(
      project.checks.find((check) => check.id === "check-rule-rule-authority")
        ?.componentIds,
    ).toContain("retrieval");
  });

  it("supplies test plans and lifecycle decisions without approvals or results", () => {
    const project = createProject(true);
    for (const check of project.checks) {
      for (const field of [
        check.method,
        check.dataset,
        check.metric,
        check.expected,
        check.owner,
      ]) {
        expect(field.trim().length).toBeGreaterThan(0);
      }
      expect(check.status).toBe("unresolved");
      expect(check.evidence).toBe("");
    }
    expect(
      new Set(project.decisions.map((decision) => decision.lifecycle)),
    ).toEqual(new Set(["design", "implementation", "release", "operation"]));
    for (const decision of project.decisions) {
      expect(decision.status).toBe("open");
      expect(decision.evidence).toBe("");
      expect(decision.owner).toMatch(/placeholder/i);
    }
    expect(project.rules.every((rule) => rule.status === "unconfirmed")).toBe(
      true,
    );
    expect(project.assumptions.join(" ")).toMatch(/not.*(?:evidence|approv)/i);
  });

  it("leaves blank projects blank and gives each example independent data", () => {
    const blank = createProject();
    expect(blank.outcomeOwner).toBe("");
    for (const items of [
      blank.needs,
      blank.rules,
      blank.sources,
      blank.nodes,
      blank.checks,
      blank.decisions,
    ]) {
      expect(items).toEqual([]);
    }
    const first = createProject(true);
    first.needs[0].owner = "Changed";
    first.nodes.find((node) => node.id === "service")!.fields[0].name =
      "Changed";
    const second = createProject(true);
    expect(second.needs[0].owner).not.toBe("Changed");
    expect(
      second.nodes.find((node) => node.id === "service")!.fields[0].name,
    ).not.toBe("Changed");
  });
});

it("follows G-12 through the source, rule and unresolved model check", () => {
  const project = createProject(true);
  expect(
    project.sources.find((source) => source.id === "source-retail-everyday")
      ?.authority,
  ).toContain("RE-7");
  expect(
    project.needs.find((need) => need.id === "need-escalation")?.acceptance,
  ).toContain("G-12");
  const check = project.checks.find(
    (item) => item.id === "check-component-model",
  )!;
  expect(check.dataset).toContain("four months ago");
  expect(check.expected).toContain("referral-required");
  expect(check.status).toBe("unresolved");
  expect(check.evidence).toBe("");
  expect(
    project.decisions.find((decision) => decision.id === "decision-release")
      ?.notes,
  ).toContain("regression");
});
