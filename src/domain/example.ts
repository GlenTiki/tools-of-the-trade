import type { Project } from "./schema";

export function fillExample(project: Project): void {
  project.title = "Fictional product support assistant";
  project.objective =
    "Help support advisers answer routine questions for the correct division and product using passages they can inspect. Refer uncertain questions to a product specialist instead of guessing.";
  project.audience =
    "Retail and Business support advisers in a fictional organisation; product specialists review unresolved cases.";
  project.baseline =
    "In the fictional ten-case workshop, advisers resolve eight cases correctly with the handbooks. The proposed assistant resolves six. These invented counts illustrate the comparison; no real evaluation has run.";
  project.successMeasure =
    "Count correctly resolved adviser tasks, not just replies. In this invented ten-case comparison, six correct assistant outcomes do not beat eight manual outcomes. G-12 is the example of a second pause requested four months after the first: asking a specialist is correct; promising approval is a failure.";
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
    "Before using real questions or documents, a real policy owner must confirm the handbook versions, access permissions and which sources may establish policy.",
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
      task: "Keep handbook access within the adviser's permitted division and product",
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
        "Use invented test details or general policy facts rather than account numbers, contact details or copied customer messages.",
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
        "The test configuration record marks handbook RE-7 as applicable and RE-8 as a draft. An answer based on RE-8 must stay unresolved. An answer based on RE-7 records source-retail-everyday and revision RE-7 so quality assurance (QA) can repeat the check.",
      owner: "Product policy lead (role placeholder)",
    },
  ];
  project.rules = [
    {
      id: "rule-scope",
      name: "Match division and product",
      when: "A policy question enters the service.",
      then: "Use sources for the explicitly selected division and product only when the adviser has permission to read them.",
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
      then: "For G-12, the service returns outcome unresolved and the test case uses label referral-required because the previous pause was four months ago. These mean the question needs human review; neither is an approval or a promise to the customer.",
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
        "If identity or permission cannot be checked, return denied. Do not try a different route that grants access to more documents.",
      source:
        "Fictional access-control proposal; the access owner must confirm how permission is checked and how removed permissions take effect.",
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
      then: "Use only sources the policy owner has confirmed are authoritative for this question and version. Keep the source and version identifiers in every citation so a reviewer can find the same text.",
      exceptions:
        "Unknown authority, conflicting revisions or no applicable revision returns unresolved for specialist review.",
      source:
        "Fictional handbook publication proposal; no sample handbook is confirmed policy.",
      owner: "Product policy lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "In an invented test, a source marked approved-for-test returns a citation naming both the handbook and its version. This test label is not real policy approval.",
      exampleFail:
        "A superseded draft outranks the applicable policy and is presented without its revision.",
    },
    {
      id: "rule-privacy",
      name: "Exclude customer identifiers from model requests",
      when: "An adviser submits free text or prepares a referral.",
      then: "Require a general policy question. Block detected customer identifiers before sending text to the model, and keep the original question out of processing logs called traces.",
      exceptions:
        "If the text cannot be safely generalised, the adviser uses the existing authorised human workflow outside this assistant.",
      source:
        "Fictional proposal to use less personal data. The privacy lead must agree how identifiers are detected, what the detector can miss and how long any records are kept.",
      owner: "Privacy lead (role placeholder)",
      status: "unconfirmed",
      examplePass:
        "An invented account number triggers a request to remove it before the question reaches the model.",
      exampleFail:
        "The user interface hides an identifier on screen, but the original text still reaches the model or a processing log.",
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
        ? 'Fictional test handbook RE-7: "One pause per 12 months; maximum 30 days; an adviser must confirm eligibility." The test configuration record marks RE-7 applicable and RE-8 draft. A real policy owner has not confirmed either as an authoritative source.'
        : `Fictional ${division} policy-owner publication. Authority and effective revision are unconfirmed; a matching title alone grants neither.`,
    updateCadence:
      "When a policy changes, confirm which version applies, replace the saved source copy and rerun the affected acceptance tests before putting the new version into use.",
    allowedUse:
      "Invented workshop examples only. No customer data, client documents or real policy commitments.",
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
        "Review the required request fields, possible replies, permission checks and exclusion of original question text from logs. Use a test setup with recorded inputs and outputs to demonstrate denied access and blocked sensitive input.",
      evidence: "",
    },
    {
      id: "decision-release",
      title: "Agree release evidence and accountable owners",
      lifecycle: "release",
      owner: "Support operations lead (role placeholder)",
      status: "open",
      notes:
        "Maya and Leila independently choose an answer category for G-12. Quality assurance (QA) keeps both opinions; the policy owner resolves their disagreement using RE-7. Save a version of the case, scoring rules (rubric) and source for regression tests that catch repeat failures. Because the team has seen G-12, use separate unseen cases for the final release test (holdout). The dataset owner accepts the fixed reference; the outcome owner separately decides release.",
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
