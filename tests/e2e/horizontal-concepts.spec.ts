import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const topics = [
  [
    "construct validity",
    "Does the metric measure the user need?",
    "Write and calibrate the rubric",
  ],
  ["Goodhart", "When a score becomes a target", "Held-out set"],
  [
    "selective prediction",
    "Answer, ask, or refer",
    "Precision, recall and false-positive rate",
  ],
  ["user-centered SLO", "Agree on a service promise", "Release and rollback"],
  ["unit economics", "Cost per useful outcome", "Agree on a service promise"],
];

async function catalogueCount() {
  const counts = await Promise.all(
    ["root", "core", "advanced"].map(async (name) => {
      const nodes: unknown[] = JSON.parse(
        await readFile(
          new URL(`../../src/content/${name}-nodes.json`, import.meta.url),
          "utf8",
        ),
      );
      return nodes.length;
    }),
  );
  return counts.reduce((total, count) => total + count, 0);
}

test("cross-role topics are searchable, connected and leave the saved project intact", async ({
  page,
}) => {
  const topicCount = await catalogueCount();
  await page.goto("./");
  await page.getByLabel("Project name").fill("Preserve my outcome plan");
  await expect(page.getByRole("status")).toHaveText("Saved in this browser");
  const before = await page.evaluate(() =>
    localStorage.getItem("tools-of-the-trade.project.v1"),
  );
  for (const [query, title, next] of topics) {
    await page.goto("./#learn");
    await expect(
      page
        .locator(".learn-navigation")
        .getByRole("button", { name: /Overview/ }),
    ).toContainText(String(topicCount));
    await page.getByLabel("Search the field guide").fill(query);
    await page
      .getByRole("button", { name: new RegExp(title.replace(/[?]/g, "\\?")) })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Curated conceptual links.")).toBeVisible();
    await expect(page.locator(".learn-detail-side a").first()).toHaveAttribute(
      "href",
      /^https:\/\//,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .locator(".learn-related")
      .getByRole("button", { name: new RegExp(next) })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: next, exact: true }),
    ).toBeVisible();
  }
  expect(
    await page.evaluate(() =>
      localStorage.getItem("tools-of-the-trade.project.v1"),
    ),
  ).toBe(before);
});
