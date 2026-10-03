import { describe, expect, it } from "vitest";
import {
  createProject,
  parseProject,
  deriveArchitecture,
  deriveChecks,
  projectGaps,
  implementationBrief,
  mergeArchitecture,
} from "./index";

const encode = (project: unknown) => JSON.stringify(project);
function softwareProject() {
  const project = createProject();
  return { ...project, ...deriveArchitecture(project) };
}

describe("portable project", () => {
  it("roundtrips edits, positions, absent draft values and UTC second timestamps", () => {
    const project = softwareProject();
    project.nodes[0].position = { x: 12.5, y: -87 };
    project.objective = "";
    project.nodes[0].fields = [
      {
        id: "field-a",
        name: "contact",
        type: "string",
        required: false,
        classification: "sensitive",
      },
    ];
    expect(parseProject(encode(project))).toEqual(project);
    expect(project.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
  it("rejects unknown versions and unknown executable-looking extra fields", () => {
    expect(() =>
      parseProject(encode({ ...createProject(), schemaVersion: 2 })),
    ).toThrow();
    expect(() =>
      parseProject(encode({ ...createProject(), command: "run something" })),
    ).toThrow();
  });
  it("rejects duplicate IDs, dangling references and parent cycles", () => {
    const duplicate = softwareProject();
    duplicate.nodes.push({ ...duplicate.nodes[0] });
    expect(() => parseProject(encode(duplicate))).toThrow(/duplicate/i);
    const dangling = softwareProject();
    dangling.edges[0].target = "missing";
    expect(() => parseProject(encode(dangling))).toThrow(/missing/i);
    const cycle = softwareProject();
    cycle.nodes[0].parentId = cycle.nodes[1].id;
    cycle.nodes[1].parentId = cycle.nodes[0].id;
    expect(() => parseProject(encode(cycle))).toThrow(/cycle/i);
  });
  it("rejects invalid rule/check links, field duplicates and impossible dates", () => {
    const project = createProject(true);
    project.nodes[0].ruleIds = ["missing-rule"];
    expect(() => parseProject(encode(project))).toThrow(/missing-rule/);
    project.nodes[0].ruleIds = [];
    project.checks[0].needIds = ["missing-need"];
    expect(() => parseProject(encode(project))).toThrow(/missing-need/);
    project.checks[0].needIds = [];
    const field = {
      id: "f",
      name: "x",
      type: "string" as const,
      required: false,
      classification: "internal" as const,
    };
    project.nodes[0].fields = [field, field];
    expect(() => parseProject(encode(project))).toThrow(/duplicate/i);
    project.nodes[0].fields = [];
    project.createdAt = "2026-02-30T10:00:00Z";
    expect(() => parseProject(encode(project))).toThrow();
  });
  it("bounds UTF-8 bytes, not only JavaScript character count", () => {
    const project = createProject();
    project.objective = "é".repeat(600_000);
    expect(() => parseProject(encode(project))).toThrow(/1 MiB/);
  });
});

describe("starter architecture", () => {
  it("explicitly derives one UI and one service, without guessed persistence", () => {
    const project = softwareProject();
    expect(project.nodes.map((node) => node.kind)).toEqual(["ui", "service"]);
    expect(deriveArchitecture(project)).toEqual({
      nodes: project.nodes,
      edges: project.edges,
    });
  });
  it("adds only chosen infrastructure and keeps routing inside one service", () => {
    const project = createProject(true);
    project.choices = {
      persistence: true,
      documents: true,
      divisionRouting: true,
      longRunning: true,
      humanApproval: true,
    };
    const { nodes, edges } = deriveArchitecture(project);
    expect(nodes.filter((node) => node.kind === "service")).toHaveLength(1);
    expect(nodes.find((node) => node.kind === "router")?.parentId).toBe(
      "service",
    );
    expect(nodes.some((node) => node.kind === "database")).toBe(true);
    expect(nodes.some((node) => node.kind === "queue")).toBe(true);
    expect(nodes.some((node) => node.kind === "worker")).toBe(true);
    expect(nodes.filter((node) => node.kind === "source")).toHaveLength(
      project.sources.length,
    );
    expect(edges.some((edge) => edge.kind === "review")).toBe(true);
    expect(deriveArchitecture(project)).toEqual({ nodes, edges });
  });
  it("preserves custom work when explicitly merging a new starter", () => {
    const project = softwareProject();
    project.nodes[0].position.x = 999;
    project.nodes[0].label = "My edited interface";
    const custom = {
      ...project.nodes[0],
      id: "custom",
      label: "Custom component",
    };
    project.nodes.push(custom);
    project.edges.push({
      id: "custom-link",
      source: "ui",
      target: "custom",
      kind: "data",
      label: "custom route",
    });
    project.choices.persistence = true;
    const merged = mergeArchitecture(project);
    expect(merged.nodes.find((node) => node.id === "ui")?.position.x).toBe(999);
    expect(merged.nodes.find((node) => node.id === "ui")?.label).toBe(
      "My edited interface",
    );
    expect(merged.nodes).toContainEqual(custom);
    expect(merged.edges.some((edge) => edge.id === "custom-link")).toBe(true);
    expect(merged.nodes.some((node) => node.kind === "database")).toBe(true);
  });
});

describe("evidence and handoff", () => {
  it("keeps unknowns unresolved and does not fabricate evidence", () => {
    const project = softwareProject();
    const checks = deriveChecks(project);
    expect(checks.length).toBeGreaterThan(0);
    expect(
      checks.every(
        (check) => check.status === "unresolved" && check.evidence === "",
      ),
    ).toBe(true);
    expect(projectGaps(project).some((gap) => gap.area === "outcome")).toBe(
      true,
    );
    expect(projectGaps(project).some((gap) => gap.area === "needs")).toBe(true);
  });
  it("preserves edited checks and gives needs and rules traceable checks", () => {
    const project = createProject(true);
    const first = project.checks[0];
    first.title = "Edited check";
    first.evidence = "Local review record";
    first.status = "evidenced";
    const regenerated = deriveChecks(project);
    expect(regenerated.find((check) => check.id === first.id)).toEqual(first);
    for (const need of project.needs)
      expect(regenerated.some((check) => check.needIds.includes(need.id))).toBe(
        true,
      );
    for (const rule of project.rules)
      expect(regenerated.some((check) => check.ruleIds.includes(rule.id))).toBe(
        true,
      );
  });
  it("surfaces unconfirmed rules, missing ownership and unsupported evidence claims", () => {
    const project = createProject(true);
    project.rules[0].status = "unconfirmed";
    project.rules[0].owner = "";
    project.checks[0].status = "evidenced";
    project.checks[0].evidence = "";
    const gaps = projectGaps(project);
    expect(
      gaps.some(
        (gap) =>
          gap.area === "rules" && gap.detail.includes(project.rules[0].name),
      ),
    ).toBe(true);
    expect(
      gaps.some(
        (gap) =>
          gap.area === "checks" && gap.detail.includes(project.checks[0].title),
      ),
    ).toBe(true);
  });
  it("has fictional division/product sources and an honest implementation brief", () => {
    const project = createProject(true);
    expect(new Set(project.sources.map((source) => source.division))).toEqual(
      new Set(["Retail", "Business"]),
    );
    expect(project.sources.length).toBeGreaterThan(2);
    expect(project.assumptions.join(" ")).toMatch(/fictional/i);
    const brief = implementationBrief(project);
    for (const rule of project.rules) expect(brief).toContain(rule.name);
    expect(brief).toContain("Unresolved");
    expect(brief).toContain("not permission to execute");
    expect(parseProject(encode(project))).toEqual(project);
  });
});

it("roundtrips structured decision answers and includes them in the handoff", () => {
  const project = createProject(true);
  const encoded = JSON.stringify({
    ...project,
    decisions: [
      {
        ...project.decisions[0],
        templateId: "release-review",
        answers: {
          "reviewer-question": "A named person must inspect the failure cases.",
        },
      },
    ],
  });
  const restored = parseProject(encoded);
  expect(JSON.stringify(restored)).toBe(encoded);
  expect(implementationBrief(restored)).toContain("release-review");
  expect(implementationBrief(restored)).toContain(
    "reviewer-question: A named person must inspect the failure cases.",
  );
});
