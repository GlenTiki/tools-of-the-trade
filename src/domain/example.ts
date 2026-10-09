import type { Project } from "./schema";

export function fillExample(project: Project): void {
  project.title = "Fictional product support assistant";
  project.objective =
    "Help support advisers resolve routine policy questions for the correct division and product, with inspectable evidence and a clear referral when policy is uncertain.";
  project.audience =
    "Retail and Business support advisers in a fictional organisation; product specialists review unresolved cases.";
  project.baseline =
    "In the fictional ten-case workshop, advisers resolve eight cases correctly with the handbooks. The proposed assistant resolves six. These invented counts illustrate the comparison; no real evaluation has run.";
  project.successMeasure =
    "Count correctly resolved adviser tasks, not just answers produced. In the ten-case fixture, six correct assistant outcomes do not beat eight manual outcomes. For G-12, referral without approval is correct; a fluent promise of another pause is a failure.";
  project.outcomeOwner =
    "Support operations lead (role placeholder; name unassigned)";
  project.roles = ["pm", "domain", "engineer", "qa", "sre"];
  project.choices = {
    persistence: false,
    documents: true,
    divisionRouting: true,
    longRunning: false,
    humanApproval: true,
  };
  project.assumptions = [
    "This is a fictional teaching example. All products, documents, requests and evaluation cases are invented.",
    "Role owners are placeholders, not assigned people. Rules, targets and decisions are proposals, not approvals or measured evidence.",
    "Maya and Leila are fictional characters in case G-12. They do not represent assigned owners in your project.",
    "The assistant prepares an internal draft. It cannot send customer messages, change accounts or grant a policy exception.",
    "The design stores no conversation history. The existing review workflow would own any referral record; confirm that boundary before implementation.",
    "Handbook revisions, permissions and source authority require real policy-owner confirmation before any non-synthetic use.",
  ];
  project.needs = [
    {
      id: "need-policy",
      actor: "Support adviser",
      task: "Find the applicable product policy",
      outcome:
        "Resolve a routine question using an inspectable passage for the correct division and product.",
      acceptance:
        "For Retail + Everyday, answer the maximum-pause question with 30 days, subject to adviser eligibility confirmation, and cite source-retail-everyday / RE-7. Never substitute the Business Team handbook or the RE-8 draft.",
      owner: "Support operations lead (role placeholder)",
    },
    {
      id: "need-escalation",
      actor: "Support adviser",
      task: "Refer an unsupported or exceptional request",
      outcome:
        "Give a product specialist the unresolved question and evidence conflict without promising a customer an exception.",
      acceptance:
        "For G-12, a 20-day pause four months ago followed by a request for 10 more days returns unresolved with label referral-required. Cite RE-7 and make no approval promise. Maya prepares a referral for Leila.",
      owner: "Product policy lead (role placeholder)",
    },
    {
      id: "need-access",
      actor: "Division support lead",
      task: "Keep evidence within the adviser's permitted scope",
      outcome:
        "Prevent an adviser from reading another division's restricted policy through a crafted request.",
      acceptance:
        "A Retail-only adviser who requests Business Team receives denied before retrieval. An ambiguous product prompts clarification without guessing a division.",
      owner: "Access control lead (role placeholder)",
    },
    {
      id: "need-minimise",
      actor: "Support adviser",
      task: "Ask a policy question without customer identifiers",
      outcome:
        "Use synthetic or general policy facts rather than account numbers, contact details or copied customer messages.",
      acceptance:
        "Request q-18 says: Can ACCT-4821 take a pause? Ask the adviser to remove the invented account number before model use. The trace records q-18 and identifier_blocked; it must not contain ACCT-4821.",
      owner: "Privacy lead (role placeholder)",
    },
    {
      id: "need-revision",
      actor: "Product policy specialist",
      task: "Identify the policy revision behind an answer",
      outcome:
        "Reproduce the evidence selection and spot a superseded or unconfirmed handbook.",
      acceptance:
        "The fixture manifest marks RE-7 applicable and RE-8 draft. A result based on RE-8 must stay unresolved. A result based on RE-7 records source-retail-everyday and revision RE-7 so QA can repeat the check.",
      owner: "Product policy lead (role placeholder)",
    },
  ];
  project.rules = [
    {
      id: "rule-scope",
      name: "Match division and product",
      when: "A policy question enters the service.",
      then: "Use sources for the explicitly selected division and product, within the adviser's permitted scope.",
      exceptions:
        "If either value is absent or ambiguous, ask for clarification before retrieval.",
      source:
        "Fictional routing workshop proposal; a policy owner must confirm the product map.",
      owner: "Product policy lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "G-12 with Retail + Everyday selects source-retail-everyday / RE-7. Request q-17 with no product returns clarify before retrieval.",
      exampleFail:
        "A Retail request receives a Business policy because the wording is similar.",
    },
    {
      id: "rule-review",
      name: "Review unsupported commitments",
      when: "Sources conflict, omit the answer or require an exception.",
      then: "For G-12, return API outcome unresolved with dataset label referral-required: the previous pause was four months ago. Keep referral separate from any approval or customer commitment.",
      exceptions:
        "A reviewer may resolve the question in the existing workflow; the assistant never grants an exception itself.",
      source:
        "Fictional review workshop proposal; the policy lead must agree reviewer authority.",
      owner: "Product policy lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "G-12 is referred because the previous pause was four months ago, even though 20 + 10 equals the 30-day duration limit.",
      exampleFail:
        "Wrong answer to G-12: Yes, you have 10 days left. This treats the duration limit as a reusable balance and approves a second pause.",
    },
    {
      id: "rule-access",
      name: "Authorize before evidence access",
      when: "A request selects a division and product.",
      then: "Check the authenticated adviser's current permissions before retrieval; never trust a client-supplied access claim.",
      exceptions:
        "Missing identity or unavailable permission evidence produces denied; no fallback opens a broader scope.",
      source:
        "Fictional access control proposal; the access owner must confirm enforcement and revocation.",
      owner: "Access control lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "A Retail-only identity requesting Business Team is denied without a retrieval call.",
      exampleFail:
        "Changing division in the request body exposes a Business handbook to a Retail-only adviser.",
    },
    {
      id: "rule-authority",
      name: "Use the confirmed policy revision",
      when: "Retrieval selects candidate passages.",
      then: "Keep only sources with confirmed authority and the applicable revision; retain source and revision IDs in every citation.",
      exceptions:
        "Unknown authority, conflicting revisions or no applicable revision returns unresolved for specialist review.",
      source:
        "Fictional handbook publication proposal; no sample handbook is confirmed policy.",
      owner: "Product policy lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "A synthetic approved-revision fixture supplies a citation with its source and revision IDs.",
      exampleFail:
        "A superseded draft outranks the applicable policy and is presented without its revision.",
    },
    {
      id: "rule-privacy",
      name: "Exclude customer identifiers from model requests",
      when: "An adviser submits free text or prepares a referral.",
      then: "Require a general policy question; block detected customer identifiers before model use and exclude raw questions from traces.",
      exceptions:
        "If the text cannot be safely generalised, the adviser uses the existing authorised human workflow outside this assistant.",
      source:
        "Fictional data-minimisation proposal; the privacy lead must agree detectors, residual risk and retention.",
      owner: "Privacy lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "A synthetic account number triggers a request to remove it before the model boundary.",
      exampleFail:
        "The UI masks an identifier but the original text still reaches the model or a trace.",
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
      id === "source-retail-everyday"
        ? 'Fictional fixture RE-7: "One pause per 12 months; maximum 30 days; an adviser must confirm eligibility." The sample manifest marks RE-7 applicable and RE-8 draft. Real source authority remains unconfirmed.'
        : `Fictional ${division} policy-owner publication. Authority and effective revision are unconfirmed; a matching title alone grants neither.`,
    updateCadence:
      "At each policy revision: confirm the effective revision, replace the previous source snapshot and rerun affected acceptance cases before promotion.",
    allowedUse:
      "Synthetic workshop use only. No customer data, client documents or real policy commitments.",
    owner: `${division} product policy lead (role placeholder)`,
  }));
  project.decisions = [
    {
      id: "decision-scope",
      title: "Confirm policy scope and referral authority",
      lifecycle: "design",
      owner: "Product policy lead (role placeholder)",
      status: "open",
      notes:
        "Agree the four product scopes, authoritative revisions and who can resolve exceptions. The sample source list is not an approval.",
      evidence: "",
    },
    {
      id: "decision-contract",
      title: "Prove permission and privacy boundaries",
      lifecycle: "implementation",
      owner: "Engineering lead (role placeholder)",
      status: "open",
      notes:
        "Review the request contract, permission checks and raw-text exclusion. Demonstrate denial and sensitive-input cases with a controlled test harness.",
      evidence: "",
    },
    {
      id: "decision-release",
      title: "Agree release evidence and accountable owners",
      lifecycle: "release",
      owner: "Support operations lead (role placeholder)",
      status: "open",
      notes:
        "Maya and Leila label G-12 independently. QA keeps both answers; the policy owner resolves the disagreement using RE-7. QA versions the case, rubric and source as regression data because this case is already visible. Collect separate unseen cases for a release holdout; the dataset owner accepts a frozen reference, while the outcome owner separately decides release.",
      evidence: "",
    },
    {
      id: "decision-operation",
      title: "Agree source updates and withdrawal procedure",
      lifecycle: "operation",
      owner: "Service owner (role placeholder)",
      status: "open",
      notes:
        "Rehearse withdrawal of an invalid source revision and restore the last permitted configuration. Define who handles unresolved referrals when the assistant is unavailable.",
      evidence: "",
    },
  ];
}
