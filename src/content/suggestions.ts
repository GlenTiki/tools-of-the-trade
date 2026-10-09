import { conceptById } from "./catalogue";

type Context = { topics: string[]; reason: string };
export const guideContexts: Record<string, Context> = {
  outcome: {
    topics: ["x-construct-validity", "x-unit-economics", "a-user-slo"],
    reason:
      "Describe a task the user should be able to complete and how to check it.",
  },
  success: {
    topics: ["x-construct-validity", "a-user-slo", "golden-dataset"],
    reason:
      "Decide what to measure and where the results will come from before setting a target.",
  },
  need: {
    topics: [
      "x-construct-validity",
      "golden-dataset",
      "x-selective-prediction",
    ],
    reason:
      "Describe what success looks like for this task and when the person needs help.",
  },
  acceptance: {
    topics: ["golden-dataset", "annotation-rubric", "x-held-out"],
    reason:
      "Write one example you would accept and one you would reject, with a reason for each.",
  },
  rule: {
    topics: ["x-selective-prediction", "a-authorization", "x-mutation"],
    reason:
      "Say when this rule applies and who to ask when it cannot settle the question.",
  },
  source: {
    topics: ["data", "x-pinning", "a-authorization"],
    reason:
      "Record who confirms this source, which version applies and who may use it.",
  },
  capabilities: {
    topics: ["api-contract", "data", "a-tool-contract"],
    reason:
      "Choose the job each part must do, using the user needs and business rules.",
  },
  "component:ui": {
    topics: ["api-contract", "x-selective-prediction", "a-user-slo"],
    reason:
      "Show users the request result, missing information and next action.",
  },
  "component:service": {
    topics: ["api-contract", "a-authorization", "a-tracing"],
    reason:
      "State which requests this service accepts, who may make them and what it returns.",
  },
  "component:database": {
    topics: ["data", "a-authorization", "p-moderation-pii"],
    reason:
      "Record which data this store owns, who can access it and when it is removed.",
  },
  "component:source": {
    topics: ["data", "x-pinning", "a-authorization"],
    reason:
      "Name who confirms the source, which version applies and who may read it.",
  },
  "component:retrieval": {
    topics: ["search", "x-retrieval-recall", "p-chunking"],
    reason:
      "Check that this part finds relevant information and excludes documents the user must not read.",
  },
  "component:model": {
    topics: ["x-support-checking", "generation", "x-selective-prediction"],
    reason:
      "Say which evidence supports an answer and when the model must ask a person for help.",
  },
  "component:queue": {
    topics: ["a-idempotency", "a-retry", "a-cancel"],
    reason:
      "Say what happens if a waiting job arrives twice, fails and runs again, or is cancelled.",
  },
  "component:worker": {
    topics: ["a-retry", "a-idempotency", "a-cancel"],
    reason:
      "Check that work can continue after an interruption without doing the same action twice.",
  },
  "component:human": {
    topics: ["x-selective-prediction", "a-authorization", "a-cancel"],
    reason:
      "Name the reviewer, what they may approve and what happens if they do not reply.",
  },
  "component:router": {
    topics: ["p-classifier", "a-authorization", "x-precision-recall"],
    reason:
      "Check that the system chooses the correct destination and that the user may access it.",
  },
  "component:policy": {
    topics: ["a-authorization", "a-tool-contract", "x-mutation"],
    reason:
      "Check the policy before the action happens, including a request the system must refuse.",
  },
  "data-field": {
    topics: ["api-contract", "p-moderation-pii", "data"],
    reason:
      "Say whether this field is required, what kind of value it holds and who may see it.",
  },
  process: {
    topics: ["a-tool-contract", "a-authorization", "a-cancel"],
    reason:
      "Say what each step needs, who may perform it and what happens if it fails.",
  },
  connection: {
    topics: ["api-contract", "a-idempotency", "a-cancel"],
    reason:
      "Describe the information sent between these parts and what the receiver does if it cannot complete the request.",
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
      "This input mentions response time or availability. Define what users can expect and how to measure it.",
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
