import type { Project } from "./schema";
import { deriveArchitecture } from "./architecture";
import { deriveChecks } from "./checks";

function fillExample(project: Project): void {
  project.title = "Fictional product support assistant";
  project.objective =
    "Help product-support staff find the correct policy for a customer’s division and product.";
  project.audience =
    "Retail and Business product-support staff in a fictional organisation.";
  project.baseline =
    "Staff search separate product handbooks and ask a product specialist when evidence is unclear.";
  project.successMeasure =
    "Correct division and product evidence, source-backed answers, and escalation when the approved documents do not settle the request. Agree numerical thresholds before release.";
  project.roles = ["pm", "domain", "engineer", "qa"];
  project.choices = {
    persistence: false,
    documents: true,
    divisionRouting: true,
    longRunning: false,
    humanApproval: true,
  };
  project.assumptions = [
    "This is a fictional teaching example. All products and documents are invented.",
    "Sources listed here are design placeholders, not verified policies or uploaded files.",
  ];
  project.needs = [
    {
      id: "need-policy",
      actor: "Support adviser",
      task: "Find the applicable product policy",
      outcome:
        "Give a source-backed answer for the correct division and product.",
      acceptance:
        "A Retail Everyday query cites the Retail Everyday handbook and does not substitute a Business policy.",
      owner: "",
    },
    {
      id: "need-escalation",
      actor: "Support adviser",
      task: "Escalate an unsupported or exceptional request",
      outcome: "Avoid presenting a guess as an approved policy.",
      acceptance:
        "Missing or conflicting evidence produces an unresolved result and a review request; no unsupported commitment is sent.",
      owner: "",
    },
  ];
  project.rules = [
    {
      id: "rule-scope",
      name: "Match division and product",
      when: "A policy question enters the service.",
      then: "Use sources for the explicitly selected division and product.",
      exceptions:
        "If either is absent or ambiguous, ask for clarification before selecting sources.",
      source:
        "Fictional workshop routing policy; confirm with a real policy owner.",
      owner: "",
      status: "unconfirmed",
      examplePass: "Retail + Everyday selects the Retail Everyday source.",
      exampleFail:
        "A Retail request receives a Business policy because the wording is similar.",
    },
    {
      id: "rule-review",
      name: "Review unsupported commitments",
      when: "Sources conflict, omit the answer or require an exception.",
      then: "Keep the answer unresolved and request human review before making a commitment.",
      exceptions: "No automatic exception is defined in this draft.",
      source:
        "Fictional workshop review policy; confirm with a real policy owner.",
      owner: "",
      status: "unconfirmed",
      examplePass: "A missing exception policy triggers a review request.",
      exampleFail:
        "The model invents an exception and presents it as approved.",
    },
  ];
  project.sources = [
    [
      "source-retail-everyday",
      "Retail Everyday handbook",
      "Retail",
      "Everyday",
    ],
    ["source-retail-plus", "Retail Plus handbook", "Retail", "Plus"],
    [
      "source-business-standard",
      "Business Standard handbook",
      "Business",
      "Standard",
    ],
    ["source-business-team", "Business Team handbook", "Business", "Team"],
  ].map(([id, name, division, product]) => ({
    id,
    name,
    division,
    product,
    authority:
      "Fictional product policy placeholder; authority requires confirmation.",
    updateCadence:
      "Confirm the document revision and update process with its owner.",
    allowedUse: "Synthetic workshop use only; no customer or client content.",
    owner: "",
  }));
  project.decisions = [
    {
      id: "decision-release",
      title: "Agree release evidence and accountable owners",
      lifecycle: "release",
      owner: "",
      status: "open",
      notes:
        "Confirm rules and evaluate representative held-out cases before deciding to release.",
      evidence: "",
    },
  ];
}
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
    project.checks = deriveChecks(project);
  }
  return project;
}
