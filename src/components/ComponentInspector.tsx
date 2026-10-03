import type { Component, Field, ProcessStep, Project } from "../domain";
import { Field as TextField, LinksPicker, Panel, Select } from "./Controls";
import { newId } from "../workspace/files";

type InspectorProps = {
  component: Component;
  project: Project;
  onChange: (component: Component) => void;
  onDelete: () => void;
  onEnter: () => void;
};

function FieldEditor({
  field,
  change,
  remove,
}: {
  field: Field;
  change: (field: Field) => void;
  remove: () => void;
}) {
  return (
    <fieldset className="architecture-record">
      <legend>{field.name || "New field"}</legend>
      <TextField
        label="Field name"
        value={field.name}
        onChange={(name) => change({ ...field, name })}
      />
      <Select
        label="Field type"
        value={field.type}
        options={["string", "number", "boolean", "date", "object", "array"].map(
          (value) => ({ value, label: value }),
        )}
        onChange={(type) => change({ ...field, type: type as Field["type"] })}
      />
      <Select
        label="Classification"
        value={field.classification}
        options={["public", "internal", "sensitive"].map((value) => ({
          value,
          label: value,
        }))}
        onChange={(classification) =>
          change({
            ...field,
            classification: classification as Field["classification"],
          })
        }
      />
      <label className="architecture-checkbox">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(event) =>
            change({ ...field, required: event.target.checked })
          }
        />
        Required field
      </label>
      <button type="button" onClick={remove}>
        Remove field {field.name}
      </button>
    </fieldset>
  );
}

function StepEditor({
  step,
  project,
  change,
  remove,
  earlier,
  later,
}: {
  step: ProcessStep;
  project: Project;
  change: (step: ProcessStep) => void;
  remove: () => void;
  earlier?: () => void;
  later?: () => void;
}) {
  return (
    <fieldset className="architecture-record">
      <legend>{step.name || "New step"}</legend>
      <TextField
        label="Step name"
        value={step.name}
        onChange={(name) => change({ ...step, name })}
      />
      <Select
        label="Step kind"
        value={step.kind}
        options={["input", "rule", "tool", "review", "output"].map((value) => ({
          value,
          label: value,
        }))}
        onChange={(kind) =>
          change({ ...step, kind: kind as ProcessStep["kind"] })
        }
      />
      <LinksPicker
        title="Rules used by this step"
        values={step.ruleIds}
        options={project.rules.map((rule) => ({
          id: rule.id,
          label: rule.name || "Unnamed rule",
        }))}
        onChange={(ruleIds) => change({ ...step, ruleIds })}
      />
      <div className="architecture-actions">
        <button
          type="button"
          disabled={!earlier}
          onClick={earlier}
          aria-label={`Move ${step.name || "step"} earlier`}
        >
          Earlier
        </button>
        <button
          type="button"
          disabled={!later}
          onClick={later}
          aria-label={`Move ${step.name || "step"} later`}
        >
          Later
        </button>
        <button type="button" onClick={remove}>
          Remove step {step.name}
        </button>
      </div>
    </fieldset>
  );
}

function movedSteps(steps: ProcessStep[], index: number, direction: number) {
  const result = [...steps];
  [result[index], result[index + direction]] = [
    result[index + direction],
    result[index],
  ];
  return result;
}

function DataFields({
  component,
  onChange,
}: Pick<InspectorProps, "component" | "onChange">) {
  const add = () =>
    onChange({
      ...component,
      fields: [
        ...component.fields,
        {
          id: newId("field"),
          name: "",
          type: "string",
          required: false,
          classification: "internal",
        },
      ],
    });
  return (
    <details className="architecture-section" open>
      <summary>Data fields ({component.fields.length})</summary>
      <p>Describe the data this component owns or accepts.</p>
      {component.fields.map((field) => (
        <FieldEditor
          key={field.id}
          field={field}
          change={(next) =>
            onChange({
              ...component,
              fields: component.fields.map((item) =>
                item.id === field.id ? next : item,
              ),
            })
          }
          remove={() =>
            onChange({
              ...component,
              fields: component.fields.filter((item) => item.id !== field.id),
            })
          }
        />
      ))}
      <button type="button" onClick={add}>
        Add field
      </button>
    </details>
  );
}

function ProcessSteps({
  component,
  project,
  onChange,
}: Pick<InspectorProps, "component" | "project" | "onChange">) {
  const add = () =>
    onChange({
      ...component,
      steps: [
        ...component.steps,
        { id: newId("step"), name: "", kind: "input", ruleIds: [] },
      ],
    });
  return (
    <details className="architecture-section" open>
      <summary>Process steps ({component.steps.length})</summary>
      <p>
        List the intended sequence. These steps describe the design; they do not
        execute it.
      </p>
      {component.steps.map((step, index) => (
        <StepEditor
          key={step.id}
          step={step}
          project={project}
          change={(next) =>
            onChange({
              ...component,
              steps: component.steps.map((item) =>
                item.id === step.id ? next : item,
              ),
            })
          }
          remove={() =>
            onChange({
              ...component,
              steps: component.steps.filter((item) => item.id !== step.id),
            })
          }
          earlier={
            index > 0
              ? () =>
                  onChange({
                    ...component,
                    steps: movedSteps(component.steps, index, -1),
                  })
              : undefined
          }
          later={
            index < component.steps.length - 1
              ? () =>
                  onChange({
                    ...component,
                    steps: movedSteps(component.steps, index, 1),
                  })
              : undefined
          }
        />
      ))}
      <button type="button" onClick={add}>
        Add process step
      </button>
    </details>
  );
}

function PositionFields({
  component,
  onChange,
}: Pick<InspectorProps, "component" | "onChange">) {
  function position(axis: "x" | "y", value: string) {
    if (!value.trim() || !Number.isFinite(Number(value))) return;
    onChange({
      ...component,
      position: { ...component.position, [axis]: Number(value) },
    });
  }
  return (
    <fieldset className="architecture-position">
      <legend>Position in the project</legend>
      {(["x", "y"] as const).map((axis) => (
        <label key={axis}>
          {axis === "x" ? "Horizontal position" : "Vertical position"}
          <input
            type="number"
            step="10"
            value={component.position[axis]}
            onChange={(event) => position(axis, event.target.value)}
          />
        </label>
      ))}
    </fieldset>
  );
}

export default function ComponentInspector({
  component,
  project,
  onChange,
  onDelete,
  onEnter,
}: InspectorProps) {
  const children = project.nodes.filter(
    (node) => node.parentId === component.id,
  ).length;
  return (
    <div className="architecture-inspector">
      <Panel title="Component inspector">
        <TextField
          label="Component name"
          value={component.label}
          onChange={(label) => onChange({ ...component, label })}
        />
        <TextField
          label="Description"
          value={component.description}
          multiline
          onChange={(description) => onChange({ ...component, description })}
        />
        <Select
          label="Component kind"
          value={component.kind}
          options={[
            "ui",
            "service",
            "database",
            "source",
            "retrieval",
            "model",
            "queue",
            "worker",
            "human",
            "router",
            "policy",
          ].map((value) => ({ value, label: value }))}
          onChange={(kind) =>
            onChange({ ...component, kind: kind as Component["kind"] })
          }
        />
        <TextField
          label="Domain or responsibility"
          value={component.domain}
          onChange={(domain) => onChange({ ...component, domain })}
        />
        <LinksPicker
          title="Linked needs"
          values={component.needIds}
          options={project.needs.map((need) => ({
            id: need.id,
            label: need.task || "Unnamed need",
          }))}
          onChange={(needIds) => onChange({ ...component, needIds })}
        />
        <LinksPicker
          title="Linked rules"
          values={component.ruleIds}
          options={project.rules.map((rule) => ({
            id: rule.id,
            label: rule.name || "Unnamed rule",
          }))}
          onChange={(ruleIds) => onChange({ ...component, ruleIds })}
        />
        <PositionFields component={component} onChange={onChange} />
        <DataFields component={component} onChange={onChange} />
        <ProcessSteps
          component={component}
          project={project}
          onChange={onChange}
        />
        <div className="architecture-actions architecture-section">
          <button type="button" onClick={onEnter}>
            Explore inside ({children})
          </button>
          <button className="danger" type="button" onClick={onDelete}>
            Delete component
          </button>
        </div>
        <p className="architecture-hint">
          Deleting a component also removes its children and connections.
          Existing checks remain with those component links removed.
        </p>
      </Panel>
    </div>
  );
}
