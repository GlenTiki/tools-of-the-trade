import { describe, expect, it } from "vitest";
import { readWorkspace, saveWorkspace, timestamp } from "./storage";
import { createProject } from "../domain";

describe("portable workspace storage", () => {
  it("starts a blank draft when storage has no project", () => {
    expect(readWorkspace({ getItem: () => null }).project.title).toBeTruthy();
  });
  it("keeps the original text when saved work is invalid", () => {
    const loaded = readWorkspace({ getItem: () => "{broken" });
    expect(loaded.recovery).toBe("{broken");
    expect(loaded.status).toBe("recovery");
  });
  it("does not claim a save when the browser denies storage", () => {
    expect(
      saveWorkspace(
        {
          setItem: () => {
            throw new Error("quota");
          },
        },
        createProject(),
      ),
    ).toBe("unavailable");
  });
  it("round trips an edited project with Unicode notes", () => {
    let value = "";
    const project = {
      ...createProject(),
      objective: "Aide à l’équipe — 日本語",
    };
    expect(
      saveWorkspace(
        {
          setItem: (_key, text) => {
            value = text;
          },
        },
        project,
      ),
    ).toBe("saved");
    expect(readWorkspace({ getItem: () => value }).project.objective).toBe(
      project.objective,
    );
  });
  it("uses UTC timestamps at second resolution", () => {
    expect(timestamp(new Date("2026-10-03T01:02:03.456Z"))).toBe(
      "2026-10-03T01:02:03Z",
    );
  });
  it("preserves the last saved file when an edit exceeds the schema limits", () => {
    let saved = "previous valid project";
    const oversized = { ...createProject(), objective: "x".repeat(20001) };
    expect(
      saveWorkspace(
        {
          setItem: (_key, text) => {
            saved = text;
          },
        },
        oversized,
      ),
    ).toBe("invalid");
    expect(saved).toBe("previous valid project");
  });
});
