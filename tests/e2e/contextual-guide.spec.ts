import { test, expect, type Page } from "@playwright/test";

const saved = (page: Page) =>
  page.evaluate(() => localStorage.getItem("tools-of-the-trade.project.v1"));

async function openExample(page: Page) {
  await page.goto("./");
  await page
    .getByRole("button", { name: "Explore a specialist AI example" })
    .click();
  await page.getByRole("button", { name: "Replace current project" }).click();
}

async function readableDatasetRecords(page: Page) {
  const contrasts = await page
    .locator(".dataset-records pre")
    .evaluateAll((records) => {
      function luminance(color: string) {
        const channels = color.match(/\d+/g)!.slice(0, 3).map(Number);
        const linear = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      }
      return records.map((record) => {
        const style = getComputedStyle(record);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return (
          (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05)
        );
      });
    });
  expect(contrasts).toHaveLength(2);
  for (const contrast of contrasts)
    expect(contrast).toBeGreaterThanOrEqual(4.5);
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const dialog = page.getByRole("dialog");
  if (await dialog.count())
    expect(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
}

test("plan help opens a worked topic and returns to the same saved draft", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByLabel("Project name").fill("Membership service review");
  await page
    .getByLabel("How would we recognise success?")
    .fill("Members can finish their renewal without calling support.");
  await expect(page.getByRole("status")).toHaveText("Saved in this browser");
  const before = await saved(page);
  await page
    .getByText("Field guide: Success criteria", { exact: true })
    .click();
  const read = page.getByRole("button", {
    name: "Read Does the metric measure the user need?",
    exact: true,
  });
  await read.click();
  const dialog = page.getByRole("dialog", { name: "Field guide" });
  await expect(
    dialog.getByRole("heading", {
      name: "Does the metric measure the user need?",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Worked examples", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /Use in my project/ }),
  ).toHaveCount(0);
  await expect(
    dialog.getByText("Input", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    dialog.getByText("Expected result", { exact: true }).first(),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: /tested with.*Build a golden dataset/ })
    .click();
  await expect(
    dialog.getByRole("heading", {
      name: "Build a golden dataset",
      exact: true,
    }),
  ).toBeVisible();
  await readableDatasetRecords(page);
  await noOverflow(page);
  await page.keyboard.press("Escape");
  await expect(read).toBeFocused();
  expect(await saved(page)).toBe(before);
  await page.reload();
  await expect(page.getByLabel("Project name")).toHaveValue(
    "Membership service review",
  );
  await expect(page.getByLabel("How would we recognise success?")).toHaveValue(
    /renewal/,
  );
});

test("current need text refines suggestions without changing the plan", async ({
  page,
}) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: "Next: Understand users and their work" })
    .click();
  await page.getByRole("button", { name: "Add a user need" }).click();
  const task = page.getByLabel("What do they need to do?");
  await task.fill("Retry a duplicate request safely");
  await page.getByText("Field guide: User task", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Read Idempotent actions", exact: true }),
  ).toBeVisible();
  await task.fill("Interview members about renewal");
  await expect(
    page.getByRole("button", { name: "Read Idempotent actions", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Read Does the metric measure the user need?",
      exact: true,
    }),
  ).toBeVisible();
});

test("architecture help follows the selected component and preserves its contracts", async ({
  page,
}) => {
  await openExample(page);
  await page.getByRole("link", { name: "Architecture", exact: true }).click();
  await page
    .getByRole("button", { name: /^Application service service$/ })
    .click();
  await page
    .getByLabel("Description", { exact: true })
    .fill("Validate the request and enforce permissions.");
  await expect(
    page.getByLabel("Field name", { exact: true }).first(),
  ).not.toHaveValue("");
  const before = await saved(page);
  await page
    .getByText("Field guide: Component design", { exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Read Authorization at execution",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("heading", {
      name: "Authorization at execution",
      exact: true,
    }),
  ).toBeVisible();
  await noOverflow(page);
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(await saved(page)).toBe(before);
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue(
    "Validate the request and enforce permissions.",
  );
  await page.getByRole("button", { name: /Explore inside \(/ }).click();
  await page
    .getByRole("button", { name: /^Evidence retrieval retrieval$/ })
    .click();
  await page
    .getByText("Field guide: Component design", { exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Read Search and retrieval",
      exact: true,
    }),
  ).toBeVisible();
});

test("field guide searches worked cases and reads them without project changes", async ({
  page,
}) => {
  await page.goto("./#learn");
  const before = await saved(page);
  await page
    .getByRole("searchbox", { name: "Search the field guide" })
    .fill("duplicate");
  await page.getByRole("button", { name: /Idempotent actions/ }).click();
  await expect(
    page.getByRole("heading", { name: "Worked examples", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".worked-examples")).toContainText(
    "Fictional policies and sample data",
  );
  await noOverflow(page);
  expect(await saved(page)).toBe(before);
});

test("a golden dataset shows the people, dispute and controlled revisions", async ({
  page,
}) => {
  await page.goto("./#evaluation");
  await page.getByRole("button", { name: /golden dataset/i }).click();
  const walkthrough = page.getByRole("region", {
    name: "Golden dataset lifecycle",
  });
  await walkthrough
    .getByRole("button", { name: "4. Hold the disagreement open", exact: true })
    .click();
  await expect(
    walkthrough.getByText("Maya = answer-yes", { exact: false }).last(),
  ).toBeVisible();
  await expect(walkthrough.locator(".dataset-after")).toContainText(
    "scoring = blocked",
  );
  await readableDatasetRecords(page);
  const before = await saved(page);
  await walkthrough
    .getByRole("button", {
      name: "Next: Resolve the disagreement using the policy and scoring rules",
      exact: true,
    })
    .click();
  await expect(walkthrough.locator(".dataset-after")).toContainText(
    "resolved = referral-required",
  );
  await expect(walkthrough.locator(".dataset-owner")).toContainText(
    "Policy owner",
  );
  await walkthrough
    .getByRole("button", {
      name: "7. Save a fixed version of the reviewed reference set",
      exact: true,
    })
    .click();
  await expect(walkthrough.locator(".dataset-after")).toContainText(
    "model result = not yet measured",
  );
  await walkthrough
    .getByRole("button", {
      name: "Next: Reopen after policy or evidence changes",
      exact: true,
    })
    .click();
  await expect(walkthrough.locator(".dataset-after")).toContainText(
    "old v1 resolution = preserved",
  );
  await noOverflow(page);
  expect(await saved(page)).toBe(before);
});
