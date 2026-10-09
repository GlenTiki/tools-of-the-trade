import examples from "../content/worked-examples.json" with { type: "json" };
import type { Project } from "./schema";

const cases: Record<string, [string, string]> = {
  "check-need-need-policy": [
    "policy-source-revision",
    "Support operations lead",
  ],
  "check-need-need-escalation": [
    "reviewed-acceptance-cases",
    "Product policy lead",
  ],
  "check-need-need-access": ["scope-before-retrieval", "Access control lead"],
  "check-need-need-minimise": ["identifiers-at-every-boundary", "Privacy lead"],
  "check-need-need-revision": ["policy-source-revision", "Product policy lead"],
  "check-component-service": ["explicit-request-outcomes", "Engineering lead"],
  "check-component-retrieval": [
    "retrieval-before-generation",
    "Search engineer",
  ],
  "check-component-model": ["reviewed-acceptance-cases", "Product policy lead"],
  "check-component-router": ["scope-before-retrieval", "Access control lead"],
  "check-component-human": [
    "reviewed-acceptance-cases",
    "Support operations lead",
  ],
};

export function enrichExampleChecks(project: Project): void {
  for (const check of project.checks) {
    const reference = cases[check.id];
    if (!reference) continue;
    const [id, owner] = reference;
    const example = examples.find((item) => item.id === id)!;
    check.dataset = `${example.situation}\n${example.input}`;
    check.expected = example.expected;
    check.method = example.evidence;
    check.owner = `${owner} (role placeholder)`;
  }
}
