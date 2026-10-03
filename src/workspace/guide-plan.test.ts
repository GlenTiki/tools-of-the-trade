import { describe, expect, it } from "vitest";
import { createProject, parseProject } from "../domain";
import { conceptById, requirements } from "../content/catalogue";
import { addConceptToProject, importProjectFile } from "./guide-plan";

const legacy = () => ({
  version: 1,
  selected: ["p-chunking"],
  platform: "azure",
  notes: {},
});

describe("field-guide project checks", () => {
  it("adds a concept once without inventing criteria, evidence or traceability", () => {
    const original = createProject();
    const added = addConceptToProject(original, "p-chunking");
    expect(original.assumptions).toEqual([]);
    expect(original.checks.some((check) => check.id.startsWith("guide-"))).toBe(
      false,
    );
    for (const id of conceptById.get("p-chunking")!.requirements) {
      const requirement = requirements.find((item) => item.id === id)!;
      expect(added.checks.find((check) => check.id === `guide-${id}`)).toEqual({
        id: `guide-${id}`,
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
      });
    }
    expect(addConceptToProject(added, "p-chunking")).toEqual(added);
    expect(
      added.assumptions.some(
        (text) => text.includes("p-chunking") && text.includes("Chunking"),
      ),
    ).toBe(true);
  });
  it("preserves edited and custom checks when another concept shares requirements", () => {
    const project = addConceptToProject(createProject(), "p-chunking");
    const edited = project.checks.find(
      (check) => check.id === "guide-retrieval-relevance",
    )!;
    edited.title = "My acceptance check";
    edited.expected = "Reviewed support for the question";
    edited.evidence = "Evidence reference";
    edited.status = "evidenced";
    const added = addConceptToProject(project, "p-reranker");
    expect(added.checks.find((check) => check.id === edited.id)).toEqual(
      edited,
    );
    expect(added.checks.filter((check) => check.id === edited.id)).toHaveLength(
      1,
    );
    expect(() => addConceptToProject(project, "unknown")).toThrow(/unknown/i);
  });
});

describe("project file migration", () => {
  it("imports the current schema without migration or losing edits", () => {
    const project = createProject(true);
    project.nodes[0].position = { x: -99, y: 140 };
    expect(importProjectFile(JSON.stringify(project))).toEqual({
      project,
      migrated: false,
    });
  });
  it("preserves legacy notes, statuses and unselected requirements", () => {
    const note = "検証: café <script>plain text</script>\n".repeat(120);
    const input = {
      ...legacy(),
      notes: {
        "retrieval-relevance": { status: "evidenced", note },
        "tool-safety": {
          status: "excluded",
          note: "Not applicable: read-only fixture.",
        },
      },
    };
    const result = importProjectFile(JSON.stringify(input));
    expect(result.migrated).toBe(true);
    expect(result.project.title).toBe("Imported Tools of the Trade plan");
    expect(
      result.project.checks.find(
        (check) => check.id === "guide-retrieval-relevance",
      ),
    ).toMatchObject({ status: "evidenced", evidence: note });
    expect(
      result.project.checks.find((check) => check.id === "guide-tool-safety"),
    ).toMatchObject({
      status: "excluded",
      evidence: "Not applicable: read-only fixture.",
    });
    expect(
      result.project.assumptions.some(
        (text) => text.includes("azure") && text.includes("not a deployment"),
      ),
    ).toBe(true);
    expect(parseProject(JSON.stringify(result.project))).toEqual(
      result.project,
    );
  });
  it("preserves empty notes and every original status exactly", () => {
    const statuses = [
      "unresolved",
      "defined",
      "evidenced",
      "excluded",
    ] as const;
    for (const status of statuses) {
      const { project } = importProjectFile(
        JSON.stringify({
          ...legacy(),
          selected: [],
          notes: { "api-contract": { status, note: "" } },
        }),
      );
      expect(
        project.checks.find((check) => check.id === "guide-api-contract"),
      ).toMatchObject({ status, evidence: "" });
    }
  });
  it("rejects unknown IDs, extra fields, invalid statuses and oversized notes", () => {
    const inputs = [
      { ...legacy(), version: 2 },
      { ...legacy(), selected: ["unknown"] },
      { ...legacy(), platform: "unknown" },
      { ...legacy(), execute: true },
      { ...legacy(), notes: { unknown: { status: "defined", note: "" } } },
      {
        ...legacy(),
        notes: { "api-contract": { status: "approved", note: "" } },
      },
      {
        ...legacy(),
        notes: {
          "api-contract": { status: "defined", note: "x".repeat(8001) },
        },
      },
      {
        ...legacy(),
        notes: {
          "api-contract": { status: "defined", note: "", execute: true },
        },
      },
      { ...legacy(), notes: [] },
    ];
    for (const input of inputs)
      expect(() => importProjectFile(JSON.stringify(input))).toThrow();
  });
  it("bounds UTF-8 bytes before parsing and retains modern graph validation", () => {
    expect(() => importProjectFile("é".repeat(600_000))).toThrow(/1 MiB/);
    const project = createProject(true);
    project.edges[0].source = "missing";
    expect(() => importProjectFile(JSON.stringify(project))).toThrow(/missing/);
  });
});
