import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createProject, parseProject } from "../../src/domain";

async function example(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: "Explore a worked example" }).click();
  await page.getByRole("button", { name: "Replace current project" }).click();
  await expect(page.getByLabel("Project name")).toHaveValue(
    "Fictional product support assistant",
  );
}

test("a director can start a guided plan, review collaborators and keep it after reload", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByLabel("Project name").fill("Helpful product advice");
  await page
    .getByLabel("The outcome we want")
    .fill("People can verify the answer before acting.");
  await page
    .getByText("Your role & your collaborators", { exact: true })
    .click();
  await page.getByLabel("I am contributing as…").selectOption("director");
  await page.getByLabel("I am working with…").selectOption("finance");
  await expect(page.locator(".collaboration")).toContainText("cost");
  await page
    .getByRole("button", { name: "Next: Capture the needs and exceptions" })
    .click();
  await page.getByRole("button", { name: "Add a user need" }).click();
  await page.getByLabel("Who needs this?").fill("Support adviser");
  await page
    .getByLabel("What do they need to do?")
    .fill("Find the current terms");
  await expect(page.getByRole("status")).toHaveText("Saved in this browser");
  await page.reload();
  await expect(page.getByLabel("What do they need to do?")).toHaveValue(
    "Find the current terms",
  );
  await expect(page.locator(".project-bar")).toContainText(
    "Helpful product advice",
  );
});

test("the architecture can be edited without dragging and exported with its contract", async ({
  page,
}) => {
  await example(page);
  await page.getByRole("link", { name: "Architecture", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "System architecture", level: 1 }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /^Application service service$/ })
    .click();
  await page
    .getByLabel("Component name", { exact: true })
    .fill("Support service");
  await page.getByRole("button", { name: "Add field", exact: true }).click();
  await page.getByLabel("Field name", { exact: true }).last().fill("division");
  await page
    .getByRole("button", { name: "Add process step", exact: true })
    .click();
  await page
    .getByLabel("Step name", { exact: true })
    .last()
    .fill("Enforce source permissions");
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const path = await (await downloaded).path();
  const project = parseProject(await readFile(path!, "utf8"));
  const service = project.nodes.find((n) => n.id === "service")!;
  expect(service.label).toBe("Support service");
  expect(service.fields.at(-1)?.name).toBe("division");
  expect(service.steps.at(-1)?.name).toBe("Enforce source permissions");
  await page.getByRole("button", { name: /Explore inside \(/ }).click();
  await expect(
    page
      .getByRole("button", { name: /^Evidence retrieval retrieval$/ })
      .first(),
  ).toBeVisible();
});

test("checkpoints and evidence edits persist as portable project data", async ({
  page,
}) => {
  await example(page);
  await page.getByRole("link", { name: "Delivery", exact: true }).click();
  await page
    .getByRole("button", { name: "Use this checkpoint" })
    .first()
    .click();
  await page.getByLabel("Accountable owner").fill("Product owner");
  await page
    .getByLabel("Decision and unresolved questions")
    .fill("Needs a source-owner review.");
  await page
    .getByLabel("Which user outcome will this version improve?")
    .fill("Correct product instructions.");
  await page.getByRole("link", { name: "Evaluation", exact: true }).click();
  await page.locator("details.record summary").first().click();
  await page
    .getByLabel("Evidence owner", { exact: true })
    .first()
    .fill("QA lead");
  await page
    .getByLabel("Expected result or acceptance threshold")
    .first()
    .fill("No cross-division source in the defined test cases.");
  await page.reload();
  await page.locator("details.record summary").first().click();
  await expect(
    page.getByLabel("Evidence owner", { exact: true }).first(),
  ).toHaveValue("QA lead");
  await page.getByRole("link", { name: "Delivery", exact: true }).click();
  await expect(
    page.getByLabel("Which user outcome will this version improve?"),
  ).toHaveValue("Correct product instructions.");
});

test("import requires confirmation, rejects invalid graphs and displays HTML as text", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByLabel("Project name").fill("Keep this project");
  const project = createProject();
  project.title = "<img src=x onerror=alert(1)>";
  const input = page.getByLabel("Choose a project file");
  await input.setInputFiles({
    name: "project.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(project)),
  });
  await expect(page.getByRole("dialog")).toContainText(project.title);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByLabel("Project name")).toHaveValue(
    "Keep this project",
  );
  await input.setInputFiles({
    name: "project.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(project)),
  });
  await page.getByRole("button", { name: "Replace current project" }).click();
  await expect(page.locator(".project-bar strong")).toHaveText(project.title);
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  project.edges.push({
    id: "bad",
    source: "missing",
    target: "service",
    label: "",
    kind: "request",
  });
  await input.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(project)),
  });
  await expect(page.getByText(/The project was not changed\./)).toBeVisible();
  await expect(page.getByLabel("Project name")).toHaveValue(project.title);
});

test("oversized edits preserve the last valid project and show a useful error", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByLabel("The outcome we want").fill("A useful outcome");
  await page.getByLabel("The outcome we want").fill("x".repeat(20001));
  await expect(page.getByRole("alert")).toContainText(
    "This edit was not applied",
  );
  await expect(page.getByLabel("The outcome we want")).toHaveValue(
    "A useful outcome",
  );
  await page.reload();
  await expect(page.getByLabel("The outcome we want")).toHaveValue(
    "A useful outcome",
  );
});

test("unavailable storage is honest and corrupt saved data is preserved", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("tools-of-the-trade.project.v1", "{broken");
    Storage.prototype.setItem = () => {
      throw new Error("storage denied");
    };
  });
  await page.goto("./");
  await expect(
    page.getByText("Your previous saved file could not be opened."),
  ).toBeVisible();
  await page.getByLabel("Project name").fill("Temporary work");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tools-of-the-trade.project.v1"),
    ),
  ).toBe("{broken");
  await page
    .getByRole("button", { name: "Save this as a new project" })
    .click();
  await page.getByRole("button", { name: "Replace current project" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Browser save unavailable",
  );
});

test("the field guide adds real evaluation prompts and legacy imports retain notes", async ({
  page,
}) => {
  await page.goto("./#learn");
  await page.getByLabel("Search the field guide").fill("cosine");
  await page
    .getByRole("button", { name: /Semantic similarity scoring/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /Semantic similarity scoring/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Use in my project/i }).click();
  await expect(page.getByText(/Added the evidence prompts/)).toBeVisible();
  const legacy = {
    version: 1,
    selected: ["api"],
    platform: "azure",
    notes: { "api-contract": { status: "defined", note: "Révision — 保留" } },
  };
  await page.getByLabel("Choose a project file").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(legacy)),
  });
  await expect(page.getByRole("dialog")).toContainText(
    "earlier field-guide plan",
  );
  await page.getByRole("button", { name: "Replace current project" }).click();
  await page.getByRole("link", { name: "Evaluation", exact: true }).click();
  const check = page.locator("details.record").filter({
    has: page
      .locator("summary")
      .getByText("Define the API contract", { exact: true }),
  });
  await check.locator("summary").click();
  await expect(
    check.getByLabel("Evidence, observed result or exclusion reason"),
  ).toHaveValue("Révision — 保留");
});

test("every main view fits the viewport and the skip link focuses content", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  for (const name of [
    "Architecture",
    "Evaluation",
    "Delivery",
    "Field guide",
    "Guided plan",
  ]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
