import { expect, it } from "vitest";
import lifecycle from "./golden-lifecycle.json";

it("keeps the dataset states connected and explains each handoff", () => {
  const ids = lifecycle.stages.map((stage) => stage.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const stage of lifecycle.stages) {
    expect(stage.next.every((id) => ids.includes(id))).toBe(true);
    for (const field of [
      stage.owner,
      stage.collaborator,
      stage.action,
      stage.before,
      stage.after,
      stage.artifact,
      stage.gate,
      stage.blocked,
    ])
      expect(field.trim().length).toBeGreaterThan(0);
  }
});

it("preserves disputes, holds exposed cases out of the holdout and reopens changed policy", () => {
  const stage = (id: string) =>
    lifecycle.stages.find((item) => item.id === id)!;
  expect(stage("disputed").after).toContain("resolved = unset");
  expect(stage("adjudicated").after).toContain(
    "Maya: answer-yes; Leila: referral-required",
  );
  expect(stage("validated").after).toContain("regression");
  expect(stage("validated").after).toContain("negative control");
  expect(stage("frozen").after).toContain("not yet measured");
  expect(stage("revisit").next).toContain("labelled");
  expect(stage("revisit").after).toContain("old v1 resolution = preserved");
});
