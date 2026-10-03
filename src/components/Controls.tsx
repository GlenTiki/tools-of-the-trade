import { useId, useEffect, useRef, type ReactNode } from "react";

export function Field({
  label,
  value,
  onChange,
  hint,
  multiline = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const props = {
    id,
    value,
    placeholder,
    "aria-describedby": hint ? `${id}-hint` : undefined,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea {...props} rows={3} /> : <input {...props} />}{" "}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option value={o.value} key={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Panel({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="section-heading">
        <h2 id={id}>{title}</h2>
        <button onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

export function LinksPicker({
  title,
  values,
  options,
  onChange,
}: {
  title: string;
  values: string[];
  options: { id: string; label: string }[];
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset className="links-picker">
      <legend>{title}</legend>
      {options.length === 0 && (
        <small>Add these in the guided plan first.</small>
      )}
      {options.map((option) => (
        <label key={option.id}>
          <input
            type="checkbox"
            checked={values.includes(option.id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...values, option.id]
                  : values.filter((id) => id !== option.id),
              )
            }
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
