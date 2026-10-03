import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Architecture from "./Architecture";
import { createProject, type Component, type Connection } from "../domain";
import { visibleConnections } from "./architecture-view";

function component(id: string, parentId: string | null): Component {
  return { ...createProject().nodes[0], id, parentId };
}

const nodes = [
  component("source", null),
  component("service", null),
  component("retrieval", "service"),
  component("model", "service"),
  component("ranking", "retrieval"),
];
const edges: Connection[] = [
  {
    id: "evidence",
    source: "source",
    target: "retrieval",
    label: "Permitted evidence",
    kind: "data",
  },
  {
    id: "generation",
    source: "retrieval",
    target: "model",
    label: "Evidence with source IDs",
    kind: "data",
  },
  {
    id: "ranking",
    source: "ranking",
    target: "model",
    label: "Ranked evidence",
    kind: "data",
  },
  {
    id: "answer",
    source: "model",
    target: "service",
    label: "Draft answer",
    kind: "data",
  },
];

describe("visible architecture connections", () => {
  it("connects an external source to the visible container while preserving connection meaning", () => {
    const result = visibleConnections(
      nodes,
      edges,
      new Set(["source", "service"]),
    );
    expect(result).toEqual([{ ...edges[0], target: "service" }]);
    expect(edges[0].target).toBe("retrieval");
  });

  it("shows direct internal links and projects deeper endpoints to their nearest visible ancestor", () => {
    const result = visibleConnections(
      nodes,
      edges,
      new Set(["retrieval", "model"]),
    );
    expect(result).toEqual([edges[1], { ...edges[2], source: "retrieval" }]);
  });

  it("omits self edges and connections outside the selected subtree", () => {
    expect(visibleConnections(nodes, edges, new Set(["ranking"]))).toEqual([]);
    expect(
      visibleConnections(
        nodes,
        [{ ...edges[0], target: "source" }],
        new Set(["source"]),
      ),
    ).toEqual([]);
  });
});

it("gives the standalone architecture view a top-level heading", () => {
  const html = renderToStaticMarkup(
    createElement(Architecture, { project: createProject(), update: () => {} }),
  );
  expect(html).toContain("<h1>System architecture</h1>");
});
