import { describe, expect, it } from "vitest";
import {
  createProject,
  implementationBrief,
  parseProject,
  projectGaps,
} from "./index";

describe("generic engagements", () => {
  it("starts an advisory plan without fabricated software or checks", () => {
    const project = createProject();
    expect(project.roles).toEqual([]);
    expect(project.nodes).toEqual([]);
    expect(project.edges).toEqual([]);
    expect(project.checks).toEqual([]);
    project.needs = [
      {
        id: "need",
        actor: "Client sponsor",
        task: "Review options",
        outcome: "Choose next phase",
        acceptance: "Reviewed options memo",
        owner: "Client lead",
      },
    ];
    expect(
      projectGaps(project).some((gap) => gap.id === "need-need-component"),
    ).toBe(false);
    expect(
      projectGaps(project).some((gap) => gap.id === "need-need-check"),
    ).toBe(true);
  });
  it("keeps advisory rules testable without inventing component work", () => {
    const project = createProject();
    project.rules = [
      {
        id: "rule",
        name: "Client approves scope",
        when: "Scope changes",
        then: "Obtain agreement",
        exceptions: "None",
        source: "Signed brief",
        owner: "Client sponsor",
        status: "confirmed",
        examplePass: "Agreement recorded",
        exampleFail: "Unapproved commitment",
      },
    ];
    project.checks = [
      {
        id: "check",
        title: "Review change decisions",
        method: "Client review",
        dataset: "Change log",
        metric: "Every change has agreement",
        expected: "No unapproved change",
        owner: "PM",
        status: "defined",
        evidence: "",
        needIds: [],
        ruleIds: ["rule"],
        componentIds: [],
      },
    ];
    expect(
      projectGaps(project).some((gap) => gap.id === "rule-rule-component"),
    ).toBe(false);
    expect(
      projectGaps(project)
        .filter((gap) => gap.area === "checks")
        .map((gap) => gap.id),
    ).toEqual(["check-check-run"]);
    project.checks[0].status = "evidenced";
    project.checks[0].evidence = "Client review of the fictional change log";
    expect(projectGaps(project).filter((gap) => gap.area === "checks")).toEqual(
      [],
    );
    expect(implementationBrief(project)).not.toContain("division [unresolved]");
  });
  it("requires source scope only when routing is selected", () => {
    const project = createProject();
    project.sources = [
      {
        id: "client-brief",
        name: "Client brief",
        division: "",
        product: "",
        authority: "Signed brief",
        updateCadence: "At each agreed change",
        allowedUse: "Engagement team",
        owner: "Client sponsor",
      },
    ];
    expect(
      projectGaps(project).filter(
        (gap) => gap.id === "source-client-brief-detail",
      ),
    ).toEqual([]);
    expect(implementationBrief(project)).not.toContain("division [unresolved]");
    expect(implementationBrief(project)).not.toContain("product [unresolved]");
    project.choices.divisionRouting = true;
    expect(implementationBrief(project)).toContain("division [unresolved]");
    expect(
      projectGaps(project).find(
        (gap) => gap.id === "source-client-brief-detail",
      )?.detail,
    ).toContain("Division; Product or scope");
  });
  it("exports readable questions without losing legacy or unknown answers", () => {
    const project = createProject();
    project.decisions = [
      {
        id: "legacy",
        title: "Existing routing",
        lifecycle: "design",
        owner: "Lead",
        status: "open",
        notes: "Preserve me",
        evidence: "",
        templateId: "division-routing",
        answers: { division: "Retail", "former-field": "Saved detail" },
      },
    ];
    const restored = parseProject(JSON.stringify(project));
    expect(restored).toEqual(project);
    const brief = implementationBrief(restored);
    expect(brief).toContain(
      "Which products or business divisions need different handling?: Retail",
    );
    expect(brief).toContain("former-field: Saved detail");
    expect(brief).toContain("Preserve me");
    expect(
      brief.split("## Decisions\n\n")[1].split("\n\n## Assumptions")[0],
    ).toBe(
      "### Existing routing\n\nLifecycle: design; status: open; owner: Lead.\n\nDecision: Preserve me\n\nEvidence: [unresolved]\n\nTemplate: division-routing\n\nWhich products or business divisions need different handling?: Retail\n\nformer-field: Saved detail",
    );
  });
});
