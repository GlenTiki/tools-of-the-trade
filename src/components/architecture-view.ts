import type { Component, Connection } from "../domain";

function visibleAncestor(
  id: string,
  nodes: ReadonlyMap<string, Component>,
  visible: ReadonlySet<string>,
): string | undefined {
  let node = nodes.get(id);
  while (node) {
    if (visible.has(node.id)) return node.id;
    node = node.parentId === null ? undefined : nodes.get(node.parentId);
  }
  return undefined;
}

export function visibleConnections(
  nodes: Component[],
  edges: Connection[],
  visible: ReadonlySet<string>,
): Connection[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return edges.flatMap((edge) => {
    const source = visibleAncestor(edge.source, byId, visible);
    const target = visibleAncestor(edge.target, byId, visible);
    if (!source || !target || source === target) return [];
    return [{ ...edge, source, target }];
  });
}
