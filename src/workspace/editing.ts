import type { Project } from "../domain";
export function removeNeed(project: Project, id: string): Project {
  return {
    ...project,
    needs: project.needs.filter((n) => n.id !== id),
    nodes: project.nodes.map((n) => ({
      ...n,
      needIds: n.needIds.filter((value) => value !== id),
    })),
    checks: project.checks.map((c) => ({
      ...c,
      needIds: c.needIds.filter((value) => value !== id),
    })),
  };
}
export function removeRule(project: Project, id: string): Project {
  return {
    ...project,
    rules: project.rules.filter((r) => r.id !== id),
    nodes: project.nodes.map((n) => ({
      ...n,
      ruleIds: n.ruleIds.filter((value) => value !== id),
      steps: n.steps.map((s) => ({
        ...s,
        ruleIds: s.ruleIds.filter((value) => value !== id),
      })),
    })),
    checks: project.checks.map((c) => ({
      ...c,
      ruleIds: c.ruleIds.filter((value) => value !== id),
    })),
  };
}
export function removeComponent(project: Project, id: string): Project {
  const removed = new Set([id]);
  for (let pass = 0; pass < project.nodes.length; pass++) {
    for (const node of project.nodes)
      if (node.parentId && removed.has(node.parentId)) removed.add(node.id);
  }
  return {
    ...project,
    nodes: project.nodes.filter((n) => !removed.has(n.id)),
    edges: project.edges.filter(
      (e) => !removed.has(e.source) && !removed.has(e.target),
    ),
    checks: project.checks.map((c) => ({
      ...c,
      componentIds: c.componentIds.filter((value) => !removed.has(value)),
    })),
  };
}
