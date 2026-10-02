import { describe, it, expect } from "vitest";
import { concepts, journeys, requirements } from "./catalogue";
describe("field guide migration", () => {
  it("preserves all111 topics and valid references", () => {
    const ids = new Set(concepts.map((n) => n.id));
    expect(ids.size).toBe(111);
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
