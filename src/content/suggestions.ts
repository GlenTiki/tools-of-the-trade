import { conceptById } from "./catalogue";

type Context = { topics: string[]; reason: string };
export const guideContexts: Record<string, Context> = {
  outcome: {
    topics: ["x-construct-validity", "x-unit-economics", "a-user-slo"],
    reason: "Connect the intended benefit to something a user can demonstrate.",
  },
  success: {
    topics: ["x-construct-validity", "a-user-slo", "golden-dataset"],
    reason:
      "Define evidence for this success criterion before choosing a target.",
  },
  need: {
    topics: [
      "x-construct-validity",
      "golden-dataset",
      "x-selective-prediction",
    ],
    reason:
      "Turn the user's task into an observable outcome and its exceptions.",
  },
  acceptance: {
    topics: ["golden-dataset", "annotation-rubric", "x-held-out"],
    reason: "Use concrete passing and failing cases to explain acceptance.",
  },
  rule: {
    topics: ["x-selective-prediction", "a-authorization", "x-mutation"],
    reason:
      "Specify the decision boundary and what happens when the rule cannot settle it.",
  },
  source: {
    topics: ["data", "x-pinning", "a-authorization"],
    reason: "Establish source authority, revision and permitted use.",
  },
  capabilities: {
    topics: ["api-contract", "data", "a-tool-contract"],
    reason:
      "Choose component responsibilities from the requirements and their boundaries.",
  },
  "component:ui": {
    topics: ["api-contract", "x-selective-prediction", "a-user-slo"],
    reason:
      "Show users the request result, missing information and next action.",
  },
  "component:service": {
    topics: ["api-contract", "a-authorization", "a-tracing"],
    reason: "Define what this service accepts, authorizes and returns.",
  },
  "component:database": {
    topics: ["data", "a-authorization", "p-moderation-pii"],
    reason:
      "Record which data this store owns, who can access it and when it is removed.",
  },
  "component:source": {
    topics: ["data", "x-pinning", "a-authorization"],
    reason:
      "Keep the source's authority, version and access boundary explicit.",
  },
  "component:retrieval": {
    topics: ["search", "x-retrieval-recall", "p-chunking"],
    reason:
      "Check whether this component finds the permitted evidence the task needs.",
  },
  "component:model": {
    topics: ["x-support-checking", "generation", "x-selective-prediction"],
    reason: "Define what supports an answer and when the model must defer.",
  },
  "component:queue": {
    topics: ["a-idempotency", "a-retry", "a-cancel"],
    reason:
      "Specify duplicate delivery, retry limits and cancellation for queued work.",
  },
  "component:worker": {
    topics: ["a-retry", "a-idempotency", "a-cancel"],
    reason:
      "Define how interrupted work resumes without repeating its effects.",
  },
  "component:human": {
    topics: ["x-selective-prediction", "a-authorization", "a-cancel"],
    reason:
      "Name the reviewer, permitted decisions and behaviour when no decision arrives.",
  },
  "component:router": {
    topics: ["p-classifier", "a-authorization", "x-precision-recall"],
    reason:
      "Check route selection separately from permission to use the destination.",
  },
  "component:policy": {
    topics: ["a-authorization", "a-tool-contract", "x-mutation"],
    reason:
      "Make the policy enforceable at the action boundary and test a denied case.",
  },
  "data-field": {
    topics: ["api-contract", "p-moderation-pii", "data"],
    reason:
      "Define presence, type and sensitivity for the data this component handles.",
  },
  process: {
    topics: ["a-tool-contract", "a-authorization", "a-cancel"],
    reason:
      "Make each step's inputs, authority and failure behaviour explicit.",
  },
  connection: {
    topics: ["api-contract", "a-idempotency", "a-cancel"],
    reason:
      "Describe the exchanged data and what the receiver does after failure.",
  },
};

const cues: { pattern: RegExp; id: string; reason: string }[] = [
  {
    pattern: /\b(duplicat\w*|idempot\w*)\b/i,
    id: "a-idempotency",
    reason: "This input mentions a duplicate or repeated action.",
  },
  {
    pattern: /\b(permission\w*|authori[sz]\w*|tenant\w*|access)\b/i,
    id: "a-authorization",
    reason: "This input raises an access or permission decision.",
  },
  {
    pattern: /\b(personal|sensitive|pii|email|redact\w*)\b/i,
    id: "p-moderation-pii",
    reason: "This input refers to potentially sensitive data.",
  },
  {
    pattern: /\b(retr(?:y|ies)|backoff)\b/i,
    id: "a-retry",
    reason: "This input mentions retry behaviour after a failure.",
  },
  {
    pattern: /\b(cancel\w*|stale result\w*)\b/i,
    id: "a-cancel",
    reason:
      "This input mentions cancellation or a result that may arrive too late.",
  },
  {
    pattern: /\b(citation\w*|unsupported|source-backed)\b/i,
    id: "x-support-checking",
    reason: "This input asks whether the evidence supports the answer.",
  },
  {
    pattern: /\b(document\w*|handbook\w*|retriev\w*|search)\b/i,
    id: "search",
    reason: "This input mentions the task of finding document evidence.",
  },
  {
    pattern: /\b(timeout\w*|latency|availability)\b/i,
    id: "a-user-slo",
    reason:
      "This input mentions a service behaviour that needs a measurable promise.",
  },
  {
    pattern: /\b(rollback|roll back|release)\b/i,
    id: "a-rollback",
    reason: "This input mentions release or recovery decisions.",
  },
];

export function suggestTopics(context: string, value: string) {
  if (!Object.hasOwn(guideContexts, context)) return [];
  const profile = guideContexts[context];
  const defaults = profile.topics.map((id) => ({ id, reason: profile.reason }));
  const matches = cues.filter((cue) =>
    cue.pattern.test(value.slice(0, 20_000)),
  );
  const ordered = [
    matches[0],
    defaults[0],
    ...matches.slice(1),
    ...defaults.slice(1),
  ];
  const unique = new Map<string, { id: string; reason: string }>();
  for (const item of ordered) {
    if (item && conceptById.has(item.id) && !unique.has(item.id))
      unique.set(item.id, { id: item.id, reason: item.reason });
  }
  return [...unique.values()].slice(0, 3);
}
