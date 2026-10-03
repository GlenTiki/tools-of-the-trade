import type { Architecture, Component, Connection, Project } from "./schema";

function component(
  id: string,
  kind: Component["kind"],
  label: string,
  x: number,
  y: number,
  project: Project,
  parentId: string | null = null,
): Component {
  return {
    id,
    kind,
    label,
    description: "",
    domain: kind,
    parentId,
    position: { x, y },
    needIds: project.needs.map((need) => need.id),
    ruleIds: [],
    fields: [],
    steps: [],
  };
}
function edge(
  source: string,
  target: string,
  label: string,
  kind: Connection["kind"] = "request",
): Connection {
  return {
    id: `edge-${source}-${target}-${kind}`,
    source,
    target,
    label,
    kind,
  };
}
function documents(project: Project): Architecture {
  if (!project.choices.documents) return { nodes: [], edges: [] };
  const retrieval = component(
    "retrieval",
    "retrieval",
    "Evidence retrieval",
    35,
    140,
    project,
    "service",
  );
  retrieval.description =
    "Retrieve only permitted evidence and retain source identifiers.";
  const model = component(
    "model",
    "model",
    "Answer generation",
    280,
    140,
    project,
    "service",
  );
  model.description =
    "Generate from supplied evidence. Report missing support explicitly.";
  const sources = project.sources.map((source, index) => {
    const node = component(
      `source-${source.id}`,
      "source",
      source.name || "Unnamed source",
      900,
      index * 150,
      project,
    );
    node.description = `Division: ${source.division || "unresolved"}. Product: ${source.product || "unresolved"}. Authority: ${source.authority || "unresolved"}.`;
    return node;
  });
  return {
    nodes: [...sources, retrieval, model],
    edges: [
      ...sources.map((source) =>
        edge(source.id, retrieval.id, "Permitted evidence", "data"),
      ),
      edge(retrieval.id, model.id, "Evidence with source IDs", "data"),
      edge(model.id, "service", "Draft answer", "data"),
    ],
  };
}
function routing(project: Project): Architecture {
  if (!project.choices.divisionRouting) return { nodes: [], edges: [] };
  const router = component(
    "router",
    "router",
    "Division and product routing",
    35,
    35,
    project,
    "service",
  );
  router.ruleIds = project.rules.map((rule) => rule.id);
  router.description =
    "Resolve division and product before retrieval. This is internal logic within the service, not an additional service.";
  router.steps = project.rules.map((rule) => ({
    id: `step-${rule.id}`,
    name: rule.name || "Unnamed routing rule",
    kind: "rule",
    ruleIds: [rule.id],
  }));
  const target = project.choices.documents ? "retrieval" : "service";
  return {
    nodes: [router],
    edges: [
      edge("service", router.id, "Division and product context"),
      edge(router.id, target, "Rule-selected scope", "data"),
    ],
  };
}
function storage(project: Project): Architecture {
  if (!project.choices.persistence) return { nodes: [], edges: [] };
  const node = component(
    "persistence",
    "database",
    "Project data store",
    380,
    620,
    project,
  );
  node.description =
    "Store only the agreed data, with explicit retention and access rules.";
  return {
    nodes: [node],
    edges: [edge("service", node.id, "Read and write agreed data", "data")],
  };
}
function asynchronous(project: Project): Architecture {
  if (!project.choices.longRunning) return { nodes: [], edges: [] };
  return {
    nodes: [
      component("queue", "queue", "Work queue", 20, 620, project),
      component("worker", "worker", "Background worker", 20, 810, project),
    ],
    edges: [
      edge("service", "queue", "Submit job", "async"),
      edge("queue", "worker", "Deliver job", "async"),
      edge("worker", "service", "Job outcome", "async"),
    ],
  };
}
function review(project: Project): Architecture {
  if (!project.choices.humanApproval) return { nodes: [], edges: [] };
  const node = component("human", "human", "Named reviewer", 670, 620, project);
  node.description =
    "The project must name the reviewer and the actions that require approval.";
  return {
    nodes: [node],
    edges: [
      edge("service", "human", "Request review", "review"),
      edge("human", "service", "Approve or reject", "review"),
    ],
  };
}
export function deriveArchitecture(project: Project): Architecture {
  const ui = component("ui", "ui", "User interface", 30, 100, project);
  ui.description =
    "Collect the user request and display the outcome or an explicit unresolved state.";
  const service = component(
    "service",
    "service",
    "Application service",
    340,
    40,
    project,
  );
  service.description =
    "Own the request contract, authorization, business rules and response.";
  service.ruleIds = project.rules.map((rule) => rule.id);
  const parts = [
    documents(project),
    routing(project),
    storage(project),
    asynchronous(project),
    review(project),
  ];
  return {
    nodes: [ui, service, ...parts.flatMap((part) => part.nodes)],
    edges: [
      edge("ui", "service", "Submit request"),
      ...parts.flatMap((part) => part.edges),
    ],
  };
}
export function mergeArchitecture(project: Project): Architecture {
  const generated = deriveArchitecture(project);
  const existingNodes = new Map(project.nodes.map((node) => [node.id, node]));
  const existingEdges = new Map(
    project.edges.map((connection) => [connection.id, connection]),
  );
  for (const node of generated.nodes)
    if (!existingNodes.has(node.id)) existingNodes.set(node.id, node);
  for (const connection of generated.edges)
    if (!existingEdges.has(connection.id))
      existingEdges.set(connection.id, connection);
  return {
    nodes: [...existingNodes.values()],
    edges: [...existingEdges.values()],
  };
}
