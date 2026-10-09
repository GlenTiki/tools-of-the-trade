import type { Check, Gap, Project } from "./schema";

const fieldLabels: Record<string, string> = {
  actor: "Who needs this?",
  task: "What do they need to do?",
  outcome: "Why does this matter?",
  acceptance: "A result they would accept",
  when: "When this is true…",
  then: "The system must…",
  exceptions: "Exceptions or missing information",
  source: "Where does this rule come from?",
  examplePass: "An example that should pass",
  exampleFail: "An example that should fail",
  division: "Division",
  product: "Product or scope",
  authority: "Authority when sources disagree",
  updateCadence: "How often does it change?",
  allowedUse: "Who may use it, and for what?",
  method: "Method",
  dataset: "Test cases or review material",
  metric: "Measure or review criterion",
  expected: "Expected result or acceptance threshold",
};

function missingFieldNames(
  fields: string[],
  names: Record<string, string>,
): string {
  return fields.map((key) => names[key] ?? fieldLabels[key]).join("; ");
}

function missing(value: string): boolean {
  return !value.trim();
}
function gap(id: string, title: string, detail: string, area: string): Gap {
  return { id, title, detail, area };
}
function outcomeGaps(project: Project): Gap[] {
  const fields = {
    objective: "User outcome",
    audience: "Intended audience",
    baseline: "Current baseline",
    successMeasure: "Success measure",
    outcomeOwner: "Outcome owner",
  } as const;
  return Object.entries(fields)
    .filter(([key]) => missing(project[key as keyof typeof fields]))
    .map(([key, title]) =>
      gap(
        `outcome-${key}`,
        `Define ${title.toLowerCase()}`,
        `${title} is not yet recorded.`,
        "outcome",
      ),
    );
}
function needGaps(project: Project): Gap[] {
  if (!project.needs.length)
    return [
      gap(
        "needs-empty",
        "Capture a user need",
        "Name the person, what they need to do, why it matters and an example of a result they would accept.",
        "needs",
      ),
    ];
  return project.needs.flatMap((need) => {
    const gaps: Gap[] = [];
    const absent = ["actor", "task", "outcome", "acceptance", "owner"].filter(
      (key) => missing(need[key as keyof typeof need]),
    );
    if (absent.length)
      gaps.push(
        gap(
          `need-${need.id}-detail`,
          "Complete the user need",
          `${need.task || need.id}: missing ${missingFieldNames(absent, { owner: "Who can confirm this need?" })}.`,
          "needs",
        ),
      );
    if (
      project.nodes.length &&
      !project.nodes.some((node) => node.needIds.includes(need.id))
    )
      gaps.push(
        gap(
          `need-${need.id}-component`,
          "Link the need to a component",
          `${need.task || need.id} has no implementation component.`,
          "needs",
        ),
      );
    if (!project.checks.some((check) => check.needIds.includes(need.id)))
      gaps.push(
        gap(
          `need-${need.id}-check`,
          "Define an acceptance check",
          `${need.task || need.id} has no linked check.`,
          "needs",
        ),
      );
    return gaps;
  });
}
function ruleGaps(project: Project): Gap[] {
  return project.rules.flatMap((rule) => {
    const gaps: Gap[] = [];
    if (rule.status === "unconfirmed")
      gaps.push(
        gap(
          `rule-${rule.id}-confirm`,
          "Confirm the business rule",
          `${rule.name || rule.id} remains unconfirmed; a drafted rule is not an approval.`,
          "rules",
        ),
      );
    const absent = [
      "name",
      "when",
      "then",
      "exceptions",
      "source",
      "owner",
      "examplePass",
      "exampleFail",
    ].filter((key) => missing(rule[key as keyof typeof rule]));
    if (absent.length)
      gaps.push(
        gap(
          `rule-${rule.id}-detail`,
          "Complete the rule and its examples",
          `${rule.name || rule.id}: missing ${missingFieldNames(absent, { name: "Rule name", owner: "Who can confirm it?" })}.`,
          "rules",
        ),
      );
    if (
      project.nodes.length > 0 &&
      !project.nodes.some(
        (node) =>
          node.ruleIds.includes(rule.id) ||
          node.steps.some((step) => step.ruleIds.includes(rule.id)),
      )
    )
      gaps.push(
        gap(
          `rule-${rule.id}-component`,
          "Link rule enforcement",
          `${rule.name || rule.id} has no implementation component or process step.`,
          "rules",
        ),
      );
    if (!project.checks.some((check) => check.ruleIds.includes(rule.id)))
      gaps.push(
        gap(
          `rule-${rule.id}-check`,
          "Test the rule",
          `${rule.name || rule.id} has no linked check.`,
          "rules",
        ),
      );
    return gaps;
  });
}
function sourceGaps(project: Project): Gap[] {
  const gaps: Gap[] = [];
  if (project.choices.documents && !project.sources.length)
    gaps.push(
      gap(
        "sources-empty",
        "Identify document sources",
        "Document support is selected but no sources are recorded.",
        "sources",
      ),
    );
  for (const source of project.sources) {
    const absent = [
      "name",
      ...(project.choices.divisionRouting ? ["division", "product"] : []),
      "authority",
      "updateCadence",
      "allowedUse",
      "owner",
    ].filter((key) => missing(source[key as keyof typeof source]));
    if (absent.length)
      gaps.push(
        gap(
          `source-${source.id}-detail`,
          "Record where the source comes from and who can confirm it",
          `${source.name || source.id}: missing ${missingFieldNames(absent, { name: "Source name", owner: "Source owner" })}.`,
          "sources",
        ),
      );
  }
  return gaps;
}
function checkGaps(check: Check): Gap[] {
  const gaps: Gap[] = [];
  const name = check.title || check.id;
  if (check.status === "excluded") {
    if (missing(check.evidence))
      gaps.push(
        gap(
          `check-${check.id}-excluded`,
          "Record the exclusion reason",
          `${name} is excluded without a reason in its evidence field.`,
          "checks",
        ),
      );
    return gaps;
  }
  const absent = ["method", "dataset", "metric", "expected", "owner"].filter(
    (key) =>
      missing(
        check[
          key as keyof Pick<
            Check,
            "method" | "dataset" | "metric" | "expected" | "owner"
          >
        ],
      ),
  );
  if (absent.length)
    gaps.push(
      gap(
        `check-${check.id}-detail`,
        "Define the check",
        `${name}: missing ${missingFieldNames(absent, { owner: "Evidence owner" })}.`,
        "checks",
      ),
    );
  if (check.status !== "evidenced")
    gaps.push(
      gap(
        `check-${check.id}-run`,
        "Supply evaluation evidence",
        `${name} is ${check.status}; filling in the plan alone does not show that the work is ready to use.`,
        "checks",
      ),
    );
  if (check.status === "evidenced" && missing(check.evidence))
    gaps.push(
      gap(
        `check-${check.id}-evidence`,
        "Attach the claimed evidence",
        `${name} is marked evidenced but no evidence is recorded.`,
        "checks",
      ),
    );
  return gaps;
}
function decisionGaps(project: Project): Gap[] {
  return project.decisions.flatMap((decision) => {
    const gaps: Gap[] = [];
    if (decision.status !== "accepted")
      gaps.push(
        gap(
          `decision-${decision.id}-open`,
          "Resolve the decision",
          `${decision.title || decision.id} is ${decision.status}.`,
          "decisions",
        ),
      );
    if (missing(decision.owner))
      gaps.push(
        gap(
          `decision-${decision.id}-owner`,
          "Name the decision owner",
          `${decision.title || decision.id} has no owner.`,
          "decisions",
        ),
      );
    if (decision.status === "accepted" && missing(decision.evidence))
      gaps.push(
        gap(
          `decision-${decision.id}-evidence`,
          "Record the decision basis",
          `${decision.title || decision.id} is accepted without supporting evidence.`,
          "decisions",
        ),
      );
    return gaps;
  });
}
function choiceGaps(project: Project): Gap[] {
  const gaps: Gap[] = [];
  if (project.choices.divisionRouting && !project.rules.length)
    gaps.push(
      gap(
        "routing-rules",
        "Define routing rules",
        "Division routing is selected without a business rule.",
        "rules",
      ),
    );
  if (
    project.choices.humanApproval &&
    !project.nodes.some((node) => node.kind === "human")
  )
    gaps.push(
      gap(
        "approval-component",
        "Add the person who must review the work",
        "Human approval is selected without a reviewer component.",
        "architecture",
      ),
    );
  if (!project.checks.length)
    gaps.push(
      gap(
        "checks-empty",
        "Define evaluation checks",
        "No checks link the design to evidence yet.",
        "checks",
      ),
    );
  return gaps;
}
export function projectGaps(project: Project): Gap[] {
  return [
    ...outcomeGaps(project),
    ...needGaps(project),
    ...ruleGaps(project),
    ...sourceGaps(project),
    ...project.checks.flatMap(checkGaps),
    ...decisionGaps(project),
    ...choiceGaps(project),
  ];
}
