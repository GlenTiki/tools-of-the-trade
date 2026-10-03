import type { Check, Gap, Project } from "./schema";

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
        "Name the actor, task, intended outcome and acceptance case.",
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
          `${need.task || need.id}: missing ${absent.join(", ")}.`,
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
          "Complete the rule contract",
          `${rule.name || rule.id}: missing ${absent.join(", ")}.`,
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
          "Establish source provenance",
          `${source.name || source.id}: missing ${absent.join(", ")}.`,
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
        `${name}: missing ${absent.join(", ")}.`,
        "checks",
      ),
    );
  if (check.status !== "evidenced")
    gaps.push(
      gap(
        `check-${check.id}-run`,
        "Supply evaluation evidence",
        `${name} is ${check.status}; no release conclusion follows from completing this form.`,
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
        "Model the review boundary",
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
