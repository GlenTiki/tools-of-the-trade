import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createProject, parseProject } from "../../src/domain";

test("a PM starts an advisory engagement without invented software", async ({
  page,
}, info) => {
  await page.goto("./");
  await page
    .getByText("Your role & your collaborators", { exact: true })
    .click();
  await expect(page.getByLabel("I am contributing as…")).toHaveValue("pm");
  await page.getByLabel("I am working with…").selectOption("engineer");
  await expect(page.locator(".collaboration")).toContainText("commercial");
  await page.getByRole("link", { name: "Open engagement checkpoints" }).click();
  await page.screenshot({
    path: info.outputPath("core-checkpoints.png"),
    fullPage: false,
  });
  const mandate = page.locator(".template-card").filter({
    has: page.getByRole("heading", {
      name: "Engagement mandate and scope",
      exact: true,
    }),
  });
  await mandate.getByRole("button", { name: "Use this checkpoint" }).click();
  await page
    .getByLabel("Which deliverables will the client receive?")
    .fill(
      "Arts organisation: interviews, service map and options memo. No build or live operations.",
    );
  await page
    .getByLabel("Who can accept the engagement mandate for the client?")
    .fill("Client director; supplier PM coordinates delivery.");
  await page.getByLabel("Accountable owner").fill("Supplier PM");
  await page
    .getByLabel("Which deliverables will the client receive?")
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("engagement-decision.png"),
    fullPage: false,
  });
  await page.reload();
  await expect(
    page.getByLabel("Which deliverables will the client receive?"),
  ).toHaveValue(/No build/);
  await page.getByRole("link", { name: "Evaluation", exact: true }).click();
  await page.getByRole("button", { name: "Add a check", exact: true }).click();
  await page.locator("details.record summary").last().click();
  await page
    .getByLabel("What claim does this check test?")
    .fill("Options cover the agreed needs");
  await page
    .getByLabel("Method", { exact: true })
    .fill("Client review and staff interviews");
  await page
    .getByLabel("Test cases or review material")
    .fill("Options memo and interview findings");
  await page
    .getByLabel("Measure or review criterion")
    .fill("Each agreed need has a supported option or explicit limitation");
  await page
    .getByLabel("Expected result or acceptance threshold")
    .fill("Client acceptor can assess every agreed option");
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const project = parseProject(
    await readFile((await (await downloaded).path())!, "utf8"),
  );
  expect(project.nodes).toEqual([]);
  expect(project.edges).toEqual([]);
  expect(project.checks).toHaveLength(1);
  expect(project.checks[0].dataset).toBe("Options memo and interview findings");
  expect(project.decisions[0].answers?.deliverables).toContain("options memo");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("specialist selection never hides saved legacy or unmatched answers", async ({
  page,
}) => {
  const project = createProject();
  project.decisions = [
    {
      id: "legacy",
      title: "Existing routing decision",
      lifecycle: "design",
      owner: "Client lead",
      status: "open",
      notes: "Keep this",
      evidence: "",
      templateId: "division-routing",
      answers: { division: "Retail", "older-note": "Unmatched saved answer" },
    },
    {
      id: "unknown",
      title: "Imported custom checkpoint",
      lifecycle: "operation",
      owner: "Service owner",
      status: "open",
      notes: "",
      evidence: "",
      templateId: "old-custom",
      answers: { "custom-question": "Keep another field" },
    },
  ];
  await page.addInitScript(
    (value) =>
      localStorage.setItem(
        "tools-of-the-trade.project.v1",
        JSON.stringify(value),
      ),
    project,
  );
  await page.goto("./#delivery");
  await expect(
    page.getByRole("heading", {
      name: "Product and division routing",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Which divisions require separate handling?"),
  ).toHaveValue("Retail");
  await expect(page.getByLabel("Saved answer: older-note")).toHaveValue(
    "Unmatched saved answer",
  );
  await expect(page.getByLabel("Saved answer: custom-question")).toHaveValue(
    "Keep another field",
  );
  await page
    .getByLabel("Saved answer: older-note")
    .fill("Edited retained answer");
  await page.getByLabel("Checkpoint topics").selectOption("specialist");
  await expect(
    page.getByRole("heading", {
      name: "Product and division routing",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Checkpoint topics").selectOption("core");
  await expect(page.getByLabel("Saved answer: older-note")).toHaveValue(
    "Edited retained answer",
  );
});

test("a phase plan records dependencies and distinguishes commitments from proposals", async ({
  page,
}) => {
  await page.goto("./#delivery");
  await page
    .getByRole("button", { name: "Plan and deliver", exact: true })
    .click();
  const roadmap = page.locator(".template-card").filter({
    has: page.getByRole("heading", {
      name: "Phases, milestones and capacity",
      exact: true,
    }),
  });
  await roadmap.getByRole("button", { name: "Use this checkpoint" }).click();
  await page
    .getByLabel("Which dependency controls the next milestone?")
    .fill(
      "Distributor migration: client data owner supplies mapping sample before cutover planning.",
    );
  await page
    .getByLabel("What marks the next milestone?")
    .fill("Reconciliation accepted; cutover date proposed, not committed.");
  await page
    .getByRole("button", { name: "Discover and design", exact: true })
    .click();
  await expect(
    page.getByLabel("Which dependency controls the next milestone?"),
  ).toHaveValue(/Distributor migration/);
  await page.reload();
  await expect(page.getByLabel("What marks the next milestone?")).toHaveValue(
    /not committed/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("a portal engagement adds software design only on explicit request", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByLabel("Project name").fill("Membership service portal");
  await page.getByRole("link", { name: "Architecture", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^Application service service$/ }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("AI answers from document evidence"),
  ).not.toBeChecked();
  await expect(page.getByLabel("Background software jobs")).not.toBeChecked();
  await page
    .getByRole("button", { name: "Add suggested components", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^Application service service$/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Answer generation model$/ }),
  ).toHaveCount(0);
});
