import type { Component, Project } from "./schema";

function field(
  name: string,
  classification: "internal" | "sensitive",
): Component["fields"][number] {
  return {
    id: `field-${name}`,
    name,
    type: "string",
    required: true,
    classification,
  };
}

function contracts(): Record<string, Partial<Component>> {
  return {
    ui: {
      description:
        "Collect a general policy question and explicit division/product. Show citations, clarification, denied or unresolved states; prepare an internal draft without sending it to a customer.",
      needIds: ["need-policy", "need-escalation", "need-minimise"],
      ruleIds: ["rule-privacy", "rule-review"],
      fields: [
        field("question", "sensitive"),
        field("division", "internal"),
        field("product", "internal"),
      ],
      steps: [
        {
          id: "ui-input",
          name: "Ask for a general policy question without identifiers",
          kind: "input",
          ruleIds: ["rule-privacy"],
        },
        {
          id: "ui-output",
          name: "Display the draft or unresolved reason and source revisions",
          kind: "output",
          ruleIds: ["rule-review"],
        },
      ],
    },
    service: {
      description:
        "For G-12, accept Retail/Everyday with a server-authenticated identity, then route to RE-7. Return unresolved and referral-required because the question asks for a second pause within 12 months. Deny unauthorized scope before retrieval; keep raw text out of traces.",
      needIds: [
        "need-policy",
        "need-escalation",
        "need-access",
        "need-minimise",
        "need-revision",
      ],
      ruleIds: [
        "rule-scope",
        "rule-review",
        "rule-access",
        "rule-authority",
        "rule-privacy",
      ],
      fields: [
        field("requestId", "internal"),
        field("question", "sensitive"),
        field("division", "internal"),
        field("product", "internal"),
      ],
      steps: [
        {
          id: "service-input",
          name: "Validate shape and reject detected identifiers",
          kind: "input",
          ruleIds: ["rule-privacy"],
        },
        {
          id: "service-authorize",
          name: "Check identity permissions and resolve the requested scope",
          kind: "rule",
          ruleIds: ["rule-access", "rule-scope"],
        },
        {
          id: "service-evidence",
          name: "Retrieve applicable evidence and generate a supported draft",
          kind: "tool",
          ruleIds: ["rule-authority", "rule-review"],
        },
        {
          id: "service-review",
          name: "Mark conflicts and missing evidence for specialist referral",
          kind: "review",
          ruleIds: ["rule-review"],
        },
        {
          id: "service-output",
          name: "Return the draft or explicit unresolved outcome without raw-text traces",
          kind: "output",
          ruleIds: ["rule-privacy", "rule-review"],
        },
      ],
    },
    router: {
      description:
        "Resolve explicit division and product inside the application service. Emit a permitted source scope only after the service has checked identity permissions; ambiguous input returns clarify.",
      needIds: ["need-policy", "need-access"],
      ruleIds: ["rule-scope"],
      fields: [field("division", "internal"), field("product", "internal")],
      steps: [
        {
          id: "route-scope",
          name: "Map an explicit division/product to its permitted handbook",
          kind: "rule",
          ruleIds: ["rule-scope"],
        },
      ],
    },
    retrieval: {
      description:
        "Accept an authorised scope and general policy question. Return relevant passages with source ID and applicable revision, or a missing/conflicting-evidence outcome. Never broaden the scope to fill an empty result.",
      needIds: ["need-policy", "need-access", "need-revision"],
      ruleIds: ["rule-scope", "rule-authority"],
      fields: [
        field("sourceId", "internal"),
        field("revisionId", "internal"),
        field("passage", "internal"),
      ],
      steps: [
        {
          id: "retrieve-filter",
          name: "Filter by permitted scope and confirmed effective revision",
          kind: "rule",
          ruleIds: ["rule-scope", "rule-authority"],
        },
        {
          id: "retrieve-output",
          name: "Return passages with their source and revision identifiers",
          kind: "output",
          ruleIds: ["rule-authority"],
        },
      ],
    },
    model: {
      description:
        "For G-12, read the supplied RE-7 clause. Reject the draft 'You have 10 days left': the one-pause limit still applies. Return unresolved with a cited explanation and a referral, without granting an exception. No account-change or customer-send tool exists.",
      needIds: ["need-policy", "need-escalation", "need-minimise"],
      ruleIds: ["rule-review", "rule-privacy"],
      fields: [
        field("draft", "internal"),
        field("citationIds", "internal"),
        field("outcome", "internal"),
      ],
      steps: [
        {
          id: "model-support",
          name: "Check each proposed claim against supplied passages",
          kind: "rule",
          ruleIds: ["rule-review"],
        },
        {
          id: "model-output",
          name: "Return a cited draft or an unresolved reason",
          kind: "output",
          ruleIds: ["rule-review"],
        },
      ],
    },
    human: {
      description:
        "In G-12, Maya prepares the referral and Leila checks the one-pause clause. The policy owner resolves the dataset label to referral-required; that label grants no customer approval. These are fictional roles, with no real reviewer assigned.",
      needIds: ["need-escalation", "need-revision"],
      ruleIds: ["rule-review", "rule-authority", "rule-privacy"],
      fields: [
        field("unresolvedReason", "internal"),
        field("sourceRevisionIds", "internal"),
      ],
      steps: [
        {
          id: "human-review",
          name: "Confirm the applicable policy or retain the unresolved outcome",
          kind: "review",
          ruleIds: ["rule-review", "rule-authority"],
        },
      ],
    },
  };
}

export function enrichExampleArchitecture(project: Project): void {
  const overrides = contracts();
  for (const node of project.nodes) {
    Object.assign(node, overrides[node.id]);
    if (node.kind === "source") {
      node.needIds = ["need-policy", "need-revision"];
      node.ruleIds = ["rule-scope", "rule-authority"];
      node.fields = [
        field("sourceId", "internal"),
        field("revisionId", "internal"),
      ];
    }
  }
  const labels: Record<string, string> = {
    "edge-ui-service-request": "General question + selected division/product",
    "edge-service-router-request": "Authorised division/product context",
    "edge-router-retrieval-data": "Permitted source scope",
    "edge-retrieval-model-data": "Passages + source and revision IDs",
    "edge-model-service-data": "Cited draft or unresolved reason",
    "edge-service-human-review": "Minimal referral + evidence conflict",
    "edge-human-service-review":
      "Reviewed policy outcome; no automatic commitment",
  };
  for (const edge of project.edges) {
    edge.label = labels[edge.id] ?? edge.label;
  }
}
