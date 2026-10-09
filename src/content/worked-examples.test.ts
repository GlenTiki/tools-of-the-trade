import { describe, expect, it } from "vitest";
import { z } from "zod";
import examples from "./worked-examples";
import { conceptById } from "./catalogue";
import review from "../../docs/content-review.json";

const text = z.string().trim().min(30);
const exampleSchema = z.strictObject({
  id: z.string().min(1),
  topics: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  situation: text,
  input: text,
  expected: text,
  decision: text,
  failure: text,
  evidence: text,
});

describe("worked field-guide cases", () => {
  it("resolves each reviewed topic gap with a linked concrete case", () => {
    expect(new Set(review.field_guide.map((item) => item.id))).toEqual(
      new Set(conceptById.keys()),
    );
    for (const item of review.field_guide) {
      if (item.initial === "concrete-enough") continue;
      for (const id of item.resolution) {
        expect(
          examples.find((example) => example.id === id)?.topics,
          id,
        ).toContain(item.id);
      }
      expect(item.resolution.length, item.id).toBeGreaterThan(0);
    }
  });

  it("contains substantive illustrative cases with unique IDs and valid topics", () => {
    expect(z.array(exampleSchema).length(70).safeParse(examples).success).toBe(
      true,
    );
    expect(new Set(examples.map((example) => example.id)).size).toBe(
      examples.length,
    );
    for (const example of examples) {
      expect(new Set(example.topics).size).toBe(example.topics.length);
      expect(example.topics.every((topic) => conceptById.has(topic))).toBe(
        true,
      );
      expect(example.situation).toMatch(/fictional|illustrative/i);
    }
  });

  it("covers evidence, business outcomes and the complete request lifecycle", () => {
    const topics = new Set(examples.flatMap((example) => example.topics));
    for (const topic of [
      "x-construct-validity",
      "golden-dataset",
      "x-held-out",
      "data",
      "x-pinning",
      "api-contract",
      "a-authorization",
      "x-retrieval-recall",
      "x-support-checking",
      "p-moderation-pii",
      "a-retry",
      "a-idempotency",
      "a-cancel",
      "a-user-slo",
      "a-rollback",
      "p-chunking",
      "p-classifier",
      "x-precision-recall",
      "x-mutation",
    ]) {
      expect(topics.has(topic), topic).toBe(true);
    }
    expect(
      examples.some((example) => /adviser|advisory/i.test(example.situation)),
    ).toBe(true);
    expect(
      examples.some((example) =>
        /business|operations|manager/i.test(example.situation),
      ),
    ).toBe(true);
  });
});
