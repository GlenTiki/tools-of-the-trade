import { describe, it, expect } from "vitest";
import { conceptById, concepts, journeys, requirements } from "./catalogue";
describe("field guide migration", () => {
  it("keeps topic identifiers unique and all references resolvable", () => {
    const ids = new Set(concepts.map((n) => n.id));
    expect(ids.size).toBe(concepts.length);
    for (const n of concepts) {
      if (n.parent) expect(ids.has(n.parent)).toBe(true);
      for (const r of n.related) expect(ids.has(r.id)).toBe(true);
      for (const r of n.requirements)
        expect(requirements.some((x) => x.id === r)).toBe(true);
    }
    for (const j of journeys)
      for (const s of j.steps) expect(ids.has(s.node)).toBe(true);
  });
});

describe("cross-role decisions", () => {
  it.each([
    ["golden-dataset", "x-construct-validity", "annotation-rubric"],
    ["a-prompt-optimization", "x-goodhart", "x-held-out"],
    ["x-calibration", "x-selective-prediction", "x-precision-recall"],
    ["a-slo", "a-user-slo", "a-rollback"],
    ["x-cost-quality", "x-unit-economics", "a-user-slo"],
  ])(
    "connects %s through %s to an actionable next topic",
    (entry, id, next) => {
      expect(conceptById.get(entry)?.related.map((link) => link.id)).toContain(
        id,
      );
      const concept = conceptById.get(id);
      expect(concept?.related.map((link) => link.id)).toContain(next);
      expect(
        concept?.sources.every((source) => source.url.startsWith("https://")),
      ).toBe(true);
      expect(concept?.sources.length).toBeGreaterThan(0);
      expect(concept?.requirements.length).toBeGreaterThan(0);
      expect(concept?.tags).toContain("cross-role");
    },
  );
});
