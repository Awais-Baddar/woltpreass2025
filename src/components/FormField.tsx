import React from "react";

type Props = {
  label: string;
  id: string;
  testId: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  error?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
};

export function FormField({
  label,
  id,
  testId,
  value,
  onChange,
  inputMode,
  placeholder,
  error,
  type,
}: Props) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>

      <input
        id={id}
        name={id}
        className="input"
        data-test-id={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        autoComplete="off"
        type={type ?? "text"}
      />

      {error ? (
        <div id={describedBy} className="error" aria-live="polite">
          {error}
        </div>
      ) : null}
    </div>
  );
}
