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
      "Ask someone to perform the user task. Compare what happens with the result the user agreed would be acceptable.",
    dataset:
      "Use examples of normal work, an example with missing information and a deliberate failure whose expected response you know.",
    metric:
      "Record whether each case meets the agreed result and which results are missing.",
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
      "Check the rule where the system acts on it. Include each exception, a request that must be refused and a case with conflicting information.",
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
    "Ask a reviewer which source passages answer each question. Retrieve a fixed number of passages and compare their IDs with that list.",
    "Of all relevant passages, how many appear in the first k results? Also count wrong-division passages and record the response time.",
  ],
  model: [
    "Answer support",
    "Review required facts and citations against the supplied evidence, including no-answer cases.",
    "Claims supported by a source, missing facts and cases where the system correctly declines to answer.",
  ],
  router: [
    "Division and product isolation",
    "Exercise each division/product rule and ambiguous, missing or conflicting routing inputs.",
    "Correct destination and any results from a division or product the user must not access.",
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
    "Stop a job partway through. Check that a retry resumes safely, cancellation prevents further work, and stored results match completed actions.",
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
        "Choose examples of normal use and a deliberate failure for this component. Write what should happen before running each check.",
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
