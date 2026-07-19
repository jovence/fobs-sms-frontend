import * as React from "react";
import { Label } from "@/components/ui/label";

export type FieldAria = {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

/**
 * The single place that wires a form control to its label, error, and hint for
 * assistive tech. It derives a stable `${id}-error` / `${id}-hint`, renders the
 * error/hint node with that id, and hands the control an `aria` object via a
 * render-prop so `aria-invalid` + `aria-describedby` land on the real control —
 * including a Radix SelectTrigger inside a react-hook-form Controller, where
 * cloneElement cannot reach. Screen-reader and voice users can then discover
 * which field is wrong and hear the message.
 */
export function Field({
  id,
  label,
  error,
  hint,
  optionalLabel,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  children: React.ReactNode | ((aria: FieldAria) => React.ReactNode);
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const aria: FieldAria = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optionalLabel ? (
          <span className="text-muted-foreground ml-1 text-xs font-normal">
            {optionalLabel}
          </span>
        ) : null}
      </Label>
      {typeof children === "function" ? children(aria) : children}
      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
