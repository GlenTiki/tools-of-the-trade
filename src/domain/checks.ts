import type { Check, Component, Need, Project, Rule } from "./schema";

function base(id: string, title: string): Check {
  return {
    id,
    title,
    method: "",
    dataset: "",
    metric: "",
    expected: "",
    owner: "",
    status: "unresolved",
    evidence: "",
    needIds: [],
    ruleIds: [],
    componentIds: [],
  };
}
function needCheck(need: Need, project: Project): Check {
  return {
    ...base(`check-need-${need.id}`, `Demonstrate: ${need.task || need.id}`),
    method:
      "Exercise the user task and inspect the outcome against the stated acceptance criteria.",
    dataset:
      "Representative task cases, including unavailable information and a controlled failure.",
    metric: "Per-case acceptance outcome and missing results.",
    expected: need.acceptance,
    owner: need.owner,
    needIds: [need.id],
    componentIds: project.nodes
      .filter((node) => node.needIds.includes(need.id))
      .map((node) => node.id),
  };
}
function ruleCheck(rule: Rule, project: Project): Check {
  return {
    ...base(`check-rule-${rule.id}`, `Verify rule: ${rule.name || rule.id}`),
    method:
      "Exercise the rule, each exception and a denied or conflicting case at the implementation boundary.",
    dataset: [rule.examplePass, rule.exampleFail].filter(Boolean).join("\n"),
    metric: "Correct rule decisions and unintended effects.",
    expected: rule.then,
    owner: rule.owner,
    ruleIds: [rule.id],
    componentIds: project.nodes
      .filter(
        (node) =>
          node.ruleIds.includes(rule.id) ||
          node.steps.some((step) => step.ruleIds.includes(rule.id)),
      )
      .map((node) => node.id),
  };
}
const methods: Partial<Record<Component["kind"], [string, string, string]>> = {
  service: [
    "Request and permission contract",
    "Test valid, invalid and unauthorized requests; preserve errors and absent values.",
    "Expected response, denial and error behavior.",
  ],
  retrieval: [
    "Evidence retrieval",
    "Compare retrieved source IDs with reviewed relevance labels at a fixed result count.",
    "Recall at k, wrong-division results and latency.",
  ],
  model: [
    "Answer support",
    "Review required facts and citations against the supplied evidence, including no-answer cases.",
    "Supported claims, omissions and correct abstention.",
  ],
  router: [
    "Division and product isolation",
    "Exercise each division/product rule and ambiguous, missing or conflicting routing inputs.",
    "Correct route and prohibited cross-scope results.",
  ],
  database: [
    "Persistence and retention",
    "Exercise authorization, updates, deletion and recovery for the agreed data.",
    "Access violations, retained records and recovery outcomes.",
  ],
  queue: [
    "Asynchronous delivery",
    "Exercise retries, duplicate delivery, timeouts and interrupted jobs.",
    "Lost jobs, duplicate effects and visible failure states.",
  ],
  worker: [
    "Worker recovery",
    "Interrupt processing and inspect retry, cancellation and result reconciliation.",
    "Completed effects and recoverable failures.",
  ],
  human: [
    "Review boundary",
    "Exercise approval, rejection, no response and stale approval after cancellation.",
    "Unauthorized effects and preserved decisions.",
  ],
};
function componentCheck(node: Component): Check[] {
  const method = methods[node.kind];
  if (!method) return [];
  return [
    {
      ...base(`check-component-${node.id}`, method[0]),
      method: method[1],
      dataset:
        "Define representative cases and at least one controlled failure for this boundary.",
      metric: method[2],
      needIds: [...node.needIds],
      ruleIds: [...node.ruleIds],
      componentIds: [node.id],
    },
  ];
}
export function deriveChecks(project: Project): Check[] {
  const candidates = [
    ...project.needs.map((need) => needCheck(need, project)),
    ...project.rules.map((rule) => ruleCheck(rule, project)),
    ...project.nodes.flatMap(componentCheck),
  ];
  const checks = new Map(project.checks.map((check) => [check.id, check]));
  for (const check of candidates)
    if (!checks.has(check.id)) checks.set(check.id, check);
  return [...checks.values()];
}
