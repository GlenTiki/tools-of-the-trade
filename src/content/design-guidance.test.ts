import { describe, expect, it } from "vitest";
import { z } from "zod";
import guidance from "./design-guidance.json";

const text = z.string().trim().min(1);
const texts = z.array(text).min(1);
const profileIds = [
  "director",
  "pm",
  "ba",
  "domain",
  "designer",
  "engineer",
  "junior",
  "qa",
  "devops",
  "sre",
  "finance",
];
const stepIds = [
  "outcome",
  "needs",
  "rules",
  "architecture",
  "evaluation",
  "delivery",
  "handoff",
];
const schema = z
  .object({
    profiles: z.array(
      z
        .object({
          id: text,
          title: text,
          summary: text,
          contribution: text,
          artifact: text,
          questions: texts,
          reviewQuestions: texts,
          steps: texts,
        })
        .strict(),
    ),
    tutorial: z.array(
      z
        .object({
          id: text,
          title: text,
          lesson: text,
          prompt: text,
          example: text,
          doneWhen: text,
        })
        .strict(),
    ),
    checkpoints: z.array(
      z
        .object({
          id: text,
          title: text,
          lifecycle: z.enum([
            "design",
            "implementation",
            "release",
            "operation",
          ]),
          purpose: text,
          roles: texts,
          questions: z
            .array(
              z
                .object({ id: text, label: text, hint: text, example: text })
                .strict(),
            )
            .min(1),
          outputs: texts,
        })
        .strict(),
    ),
    collaborations: z.array(
      z
        .object({
          roles: z.tuple([text, text]),
          title: text,
          question: text,
          artifact: text,
        })
        .strict(),
    ),
  })
  .strict();

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

function expectOrderedJourney(steps: string[]) {
  const positions = steps.map((step) => stepIds.indexOf(step));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expectUnique(steps);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
}

describe("public design guidance", () => {
  it("has complete structured content and the exact role and tutorial inventory", () => {
    expect(schema.safeParse(guidance).success).toBe(true);
    expect(guidance.profiles.map((profile) => profile.id).sort()).toEqual(
      [...profileIds].sort(),
    );
    expect(guidance.tutorial.map((step) => step.id)).toEqual(stepIds);
    guidance.profiles.forEach((profile) => expectOrderedJourney(profile.steps));
  });

  it("gives every distinct role pair its own concrete collaboration", () => {
    expect(guidance.collaborations).toHaveLength(55);
    const keys = guidance.collaborations.map((entry) =>
      [...entry.roles].sort().join(":"),
    );
    expectUnique(keys);
    expectUnique(guidance.collaborations.map((entry) => entry.question));
    expectUnique(guidance.collaborations.map((entry) => entry.artifact));
    for (const entry of guidance.collaborations) {
      expect(entry.roles[0]).not.toBe(entry.roles[1]);
      expect(entry.roles.every((role) => profileIds.includes(role))).toBe(true);
    }
  });

  it("provides named checkpoint fields across the delivery lifecycle", () => {
    expect(guidance.checkpoints.length).toBeGreaterThanOrEqual(10);
    expect(guidance.checkpoints.length).toBeLessThanOrEqual(12);
    expectUnique(guidance.checkpoints.map((checkpoint) => checkpoint.id));
    expect(
      new Set(guidance.checkpoints.map((checkpoint) => checkpoint.lifecycle)),
    ).toEqual(new Set(["design", "implementation", "release", "operation"]));
    for (const checkpoint of guidance.checkpoints) {
      expect(checkpoint.roles.every((role) => profileIds.includes(role))).toBe(
        true,
      );
      expectUnique(checkpoint.questions.map((question) => question.id));
      expect(
        checkpoint.questions.every(
          (question) => (question.label.match(/\?/g) ?? []).length === 1,
        ),
      ).toBe(true);
    }
  });
});
