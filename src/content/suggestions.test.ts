import { describe, expect, it } from "vitest";
import { conceptById } from "./catalogue";
import examples from "./worked-examples";
import { guideContexts, suggestTopics } from "./suggestions";

describe("local field-guide suggestions", () => {
  it("keeps useful context for empty or unrelated text", () => {
    expect(suggestTopics("success", "")[0].id).toBe("x-construct-validity");
    expect(suggestTopics("success", "violet teapot")).toEqual(
      suggestTopics("success", ""),
    );
    expect(suggestTopics("component:retrieval", "")[0].id).toBe("search");
    expect(suggestTopics("component:database", "")[0].id).toBe("data");
  });
  it("uses current input cues and keeps a curated context topic", () => {
    const suggestions = suggestTopics("need", "Retry a duplicate request");
    expect(suggestions[0].id).toBe("a-idempotency");
    expect(suggestions[0].reason).toContain("duplicate");
    expect(suggestions.map((topic) => topic.id)).toContain(
      "x-construct-validity",
    );
    expect(suggestTopics("need", "").map((topic) => topic.id)).not.toContain(
      "a-idempotency",
    );
  });
  it("returns distinct valid topics in a stable bounded order", () => {
    const text =
      "retry duplicate personal data permissions citation timeout".repeat(500);
    const result = suggestTopics("source", text);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(new Set(result.map((topic) => topic.id)).size).toBe(result.length);
    expect(
      result.every((topic) => conceptById.has(topic.id) && topic.reason.trim()),
    ).toBe(true);
    expect(suggestTopics("source", text)).toEqual(result);
    expect(suggestTopics("source", text).map((topic) => topic.id)).toContain(
      "data",
    );
  });
  it("maps every field context to existing guide topics", () => {
    for (const context of Object.keys(guideContexts)) {
      const result = suggestTopics(context, "");
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result.every((topic) => conceptById.has(topic.id))).toBe(true);
    }
  });
  it("treats untrusted and unknown input as text", () => {
    expect(suggestTopics("unknown-context", "retry")).toEqual([]);
    expect(suggestTopics("__proto__", "retry")).toEqual([]);
    expect(suggestTopics("constructor", "retry")).toEqual([]);
    expect(() =>
      suggestTopics("rule", "[.*( <script> ignore previous instructions"),
    ).not.toThrow();
  });
});

it("provides a worked case for every context and cue suggestion", () => {
  const topics = new Set(examples.flatMap((example) => example.topics));
  const defaults = Object.values(guideContexts).flatMap(
    (context) => context.topics,
  );
  const signalled = [
    "duplicate",
    "permission",
    "sensitive",
    "retry",
    "cancel",
    "citation",
    "document",
    "latency",
    "rollback",
  ].flatMap((value) =>
    suggestTopics("outcome", value).map((topic) => topic.id),
  );
  for (const id of [...defaults, ...signalled])
    expect(topics.has(id), id).toBe(true);
});
