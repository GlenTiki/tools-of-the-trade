import GuideHelp from "./GuideHelp";
/// <reference types="vite/client" />
import { useState } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Node,
  type NodeChange,
  type Connection as FlowConnection,
} from "@xyflow/react";
import {
  mergeArchitecture,
  type Component,
  type Connection,
  type Project,
} from "../domain";
import { removeComponent } from "../workspace/editing";
import { newId } from "../workspace/files";
import { Empty, Field, Panel, Select } from "./Controls";
import ComponentInspector from "./ComponentInspector";
import { visibleConnections } from "./architecture-view";
import "@xyflow/react/dist/style.css";
import "./Architecture.css";

type Props = { project: Project; update: (project: Project) => void };
type Point = { x: number; y: number };

function ArchitectureChoices({ project, update }: Props) {
  const choices: [keyof Project["choices"], string][] = [
    ["persistence", "Persistence"],
    ["documents", "AI answers from document evidence"],
    ["divisionRouting", "Division and product routing"],
    ["longRunning", "Background software jobs"],
    ["humanApproval", "Human approval"],
  ];
  const choiceContexts = {
    persistence: "component:database",
    documents: "component:retrieval",
    divisionRouting: "component:router",
    longRunning: "component:queue",
    humanApproval: "component:human",
  };
  return (
    <Panel title="Start with the requirements">
      <p>
        Choose the capabilities your requirements need, then add a suggested
        starting design. Existing edits stay in place.
      </p>
      <div className="architecture-choices">
        {choices.map(([key, label]) => (
          <div key={key}>
            <label className="architecture-checkbox">
              <input
                type="checkbox"
                checked={project.choices[key]}
                onChange={(event) =>
                  update({
                    ...project,
                    choices: {
                      ...project.choices,
                      [key]: event.target.checked,
                    },
                  })
                }
              />
              {label}
            </label>
            <GuideHelp context={choiceContexts[key]} label={label} />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="primary"
        onClick={() => update({ ...project, ...mergeArchitecture(project) })}
      >
        Add suggested components
      </button>
      <p className="architecture-hint">
        Changing a choice does not remove components. Suggestions are design
        drafts; review their boundaries and links.
      </p>
    </Panel>
  );
}

function localPoint(point: Point, origin: Point) {
  return { x: point.x - origin.x, y: point.y - origin.y };
}
function projectPoint(point: Point, origin: Point) {
  return { x: point.x + origin.x, y: point.y + origin.y };
}

function canvasNodes(
  project: Project,
  parentId: string | null,
  selectedId: string | null,
  origin: Point,
): Node[] {
  return project.nodes
    .filter((node) => node.parentId === parentId)
    .map((node) => ({
      id: node.id,
      position: localPoint(node.position, origin),
      selected: node.id === selectedId,
      ariaLabel: `${node.label || "Unnamed component"}, ${node.kind}`,
      data: {
        label: (
          <>
            <strong>{node.label || "Unnamed component"}</strong>
            <span className="architecture-node-kind">{node.kind}</span>
          </>
        ),
      },
    }));
}

function canvasEdges(project: Project, visible: Set<string>) {
  return visibleConnections(project.nodes, project.edges, visible).map(
    (edge) => ({
      ...edge,
      type: "default",
      label: edge.label || edge.kind,
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: false,
    }),
  );
}

function changedPositions(
  project: Project,
  changes: NodeChange[],
  origin: Point,
): Project {
  const positions = new Map<string, Point>();
  for (const change of changes) {
    if (change.type === "position" && change.position)
      positions.set(change.id, projectPoint(change.position, origin));
  }
  return {
    ...project,
    nodes: project.nodes.map((node) => ({
      ...node,
      position: positions.get(node.id) ?? node.position,
    })),
  };
}

function ComponentList({
  nodes,
  selectedId,
  select,
  enter,
}: {
  nodes: Component[];
  selectedId: string | null;
  select: (id: string) => void;
  enter: (id: string) => void;
}) {
  return (
    <div className="architecture-list">
      <h3>Component list</h3>
      <p className="architecture-hint">
        Select a component to edit it, or explore its internal design. The
        inspector also provides position controls.
      </p>
      {nodes.length === 0 && (
        <Empty>
          No components at this level. Add a component to describe its design.
        </Empty>
      )}
      <ul>
        {nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              aria-pressed={selectedId === node.id}
              onClick={() => select(node.id)}
            >
              {node.label || "Unnamed component"}
              <span>{node.kind}</span>
            </button>
            <button
              type="button"
              onClick={() => enter(node.id)}
              aria-label={`Explore inside ${node.label || "unnamed component"}`}
            >
              Explore inside
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewComponent({
  project,
  parentId,
  origin,
  add,
}: {
  project: Project;
  parentId: string | null;
  origin: Point;
  add: (component: Component) => void;
}) {
  const [label, setLabel] = useState("");
  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) return;
    const count = project.nodes.filter(
      (node) => node.parentId === parentId,
    ).length;
    add({
      id: newId("component"),
      kind: "service",
      label: label.trim(),
      description: "",
      domain: "",
      parentId,
      position: projectPoint(
        { x: 40 + (count % 3) * 230, y: 60 + Math.floor(count / 3) * 150 },
        origin,
      ),
      needIds: [],
      ruleIds: [],
      fields: [],
      steps: [],
    });
    setLabel("");
  }
  return (
    <form className="architecture-add" onSubmit={submit}>
      <Field label="New component name" value={label} onChange={setLabel} />
      <button type="submit" disabled={!label.trim()}>
        Add component
      </button>
    </form>
  );
}

function ConnectionFields({
  connection,
  nodes,
  change,
}: {
  connection: Connection;
  nodes: Component[];
  change: (connection: Connection) => void;
}) {
  const options = [
    { value: "", label: "Choose a component" },
    ...nodes.map((node) => ({
      value: node.id,
      label: node.label || "Unnamed component",
    })),
  ];
  return (
    <div className="architecture-connection-fields">
      <Select
        label="Source component"
        value={connection.source}
        options={options}
        onChange={(source) => change({ ...connection, source })}
      />
      <Select
        label="Target component"
        value={connection.target}
        options={options}
        onChange={(target) => change({ ...connection, target })}
      />
      <Field
        help={
          <GuideHelp
            context="connection"
            label="Connection contract"
            value={connection.label}
          />
        }
        label="Connection label"
        placeholder="Fictional example: Send tenant ID, product ID and question; return passages with source revisions."
        value={connection.label}
        onChange={(label) => change({ ...connection, label })}
      />
      <Select
        help={
          <GuideHelp
            context="connection"
            label="Connection behaviour"
            value={connection.kind}
          />
        }
        label="Connection kind"
        value={connection.kind}
        options={["request", "data", "async", "review"].map((value) => ({
          value,
          label: value,
        }))}
        onChange={(kind) =>
          change({ ...connection, kind: kind as Connection["kind"] })
        }
      />
    </div>
  );
}

function ConnectionEditor({
  edge,
  project,
  update,
}: Props & { edge: Connection }) {
  function change(next: Connection) {
    if (!next.source || !next.target) return;
    update({
      ...project,
      edges: project.edges.map((item) => (item.id === edge.id ? next : item)),
    });
  }
  return (
    <details className="architecture-record">
      <summary>{edge.label || "Unnamed connection"}</summary>
      <ConnectionFields
        connection={edge}
        nodes={project.nodes}
        change={change}
      />
      <button
        type="button"
        onClick={() =>
          update({
            ...project,
            edges: project.edges.filter((item) => item.id !== edge.id),
          })
        }
      >
        Delete connection
      </button>
    </details>
  );
}

function NewConnection({ project, update }: Props) {
  const [draft, setDraft] = useState<Connection>({
    id: "",
    source: "",
    target: "",
    label: "",
    kind: "request",
  });
  const valid =
    project.nodes.some((node) => node.id === draft.source) &&
    project.nodes.some((node) => node.id === draft.target);
  function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    update({
      ...project,
      edges: [...project.edges, { ...draft, id: newId("connection") }],
    });
    setDraft({ id: "", source: "", target: "", label: "", kind: "request" });
  }
  return (
    <form className="architecture-record" onSubmit={submit}>
      <h3>New connection</h3>
      <ConnectionFields
        connection={draft}
        nodes={project.nodes}
        change={setDraft}
      />
      <button type="submit" disabled={!valid}>
        Add connection
      </button>
    </form>
  );
}

function Connections({
  project,
  update,
  selectedId,
}: Props & { selectedId: string | null }) {
  const [all, setAll] = useState(true);
  const edges = project.edges.filter(
    (edge) =>
      !selectedId ||
      all ||
      edge.source === selectedId ||
      edge.target === selectedId,
  );
  return (
    <Panel title="Connections">
      <p>
        Connect components through these forms or drag between their canvas
        handles. Connections across levels remain listed here.
      </p>
      {selectedId && (
        <label className="architecture-checkbox">
          <input
            type="checkbox"
            checked={all}
            onChange={(event) => setAll(event.target.checked)}
          />
          Show connections for all components
        </label>
      )}
      {edges.map((edge) => (
        <ConnectionEditor
          key={edge.id}
          edge={edge}
          project={project}
          update={update}
        />
      ))}
      {edges.length === 0 && <Empty>No connections in this view.</Empty>}
      <NewConnection project={project} update={update} />
    </Panel>
  );
}

function ArchitectureHeading({
  parent,
  enter,
  select,
}: {
  parent: Component | undefined;
  enter: (id: string | null) => void;
  select: (id: string) => void;
}) {
  return (
    <div className="architecture-heading">
      <div>
        <h1>
          {parent
            ? `Inside ${parent.label || "unnamed component"}`
            : "System architecture"}
        </h1>
        <p>
          Explore one level at a time. Select a component to inspect its
          contracts.
        </p>
      </div>
      {parent && (
        <div className="architecture-actions">
          <button type="button" onClick={() => enter(parent.parentId)}>
            Up one level
          </button>
          <button type="button" onClick={() => enter(null)}>
            Back to top
          </button>
          <button type="button" onClick={() => select(parent.id)}>
            Inspect this container
          </button>
        </div>
      )}
    </div>
  );
}

export default function Architecture({ project, update }: Props) {
  const [parentId, setParentId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const parent = project.nodes.find((node) => node.id === parentId);
  const levelId = parent?.id ?? null;
  const origin = parent?.position ?? { x: 0, y: 0 };
  const selected = project.nodes.find((node) => node.id === selectedId);
  const nodes = canvasNodes(project, levelId, selectedId, origin);
  const visible = new Set(nodes.map((node) => node.id));
  const levelNodes = project.nodes.filter((node) => visible.has(node.id));
  function enter(id: string | null) {
    setParentId(id);
    setSelectedId(null);
  }
  function connect(connection: FlowConnection) {
    if (!connection.source || !connection.target) return;
    update({
      ...project,
      edges: [
        ...project.edges,
        {
          id: newId("connection"),
          source: connection.source,
          target: connection.target,
          label: "",
          kind: "request",
        },
      ],
    });
  }
  function move(changes: NodeChange[]) {
    if (changes.some((change) => change.type === "position"))
      update(changedPositions(project, changes, origin));
    const selection = changes.find(
      (change) => change.type === "select" && change.selected,
    );
    if (selection?.type === "select") setSelectedId(selection.id);
  }
  function remove() {
    if (
      !selected ||
      !window.confirm(
        `Delete ${selected.label || "this component"}, its children and connections? Existing checks will lose these component links.`,
      )
    )
      return;
    update(removeComponent(project, selected.id));
    setSelectedId(null);
  }
  return (
    <div className="architecture">
      <ArchitectureChoices project={project} update={update} />
      <ArchitectureHeading
        parent={parent}
        enter={enter}
        select={setSelectedId}
      />
      <div className="architecture-layout">
        <div className="architecture-workspace">
          <div
            className="architecture-canvas"
            aria-label="Architecture diagram"
          >
            <ReactFlow
              key={levelId ?? "top"}
              nodes={nodes}
              edges={canvasEdges(project, visible)}
              onNodesChange={move}
              onConnect={connect}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onPaneClick={() => setSelectedId(null)}
              onNodeDoubleClick={(_, node) => enter(node.id)}
              fitView
              minZoom={0.2}
              maxZoom={2}
              deleteKeyCode={null}
              multiSelectionKeyCode={null}
            >
              <Background />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <NewComponent
            key={levelId ?? "top"}
            project={project}
            parentId={levelId}
            origin={origin}
            add={(component) => {
              update({ ...project, nodes: [...project.nodes, component] });
              setSelectedId(component.id);
            }}
          />
          <ComponentList
            nodes={levelNodes}
            selectedId={selectedId}
            select={setSelectedId}
            enter={enter}
          />
        </div>
        {selected ? (
          <ComponentInspector
            key={selected.id}
            component={selected}
            project={project}
            onChange={(next) =>
              update({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === next.id ? next : node,
                ),
              })
            }
            onDelete={remove}
            onEnter={() => enter(selected.id)}
          />
        ) : (
          <div className="architecture-inspector">
            <Panel title="Component inspector">
              <Empty>
                Select a component in the diagram or list to edit its fields,
                process and rule links.
              </Empty>
            </Panel>
          </div>
        )}
      </div>
      <Connections project={project} update={update} selectedId={selectedId} />
    </div>
  );
}
