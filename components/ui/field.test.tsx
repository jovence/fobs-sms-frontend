import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Field } from "./field";

describe("Field", () => {
  it("programmatically associates the error with the control", () => {
    render(
      <Field id="email" label="Email" error="Email is required">
        {(aria) => <input {...aria} />}
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "email-error");
    expect(alert).toHaveTextContent("Email is required");
    // the describedby target actually resolves to the error node
    expect(document.getElementById(input.getAttribute("aria-describedby")!)).toBe(alert);
  });

  it("sets no aria-invalid/aria-describedby and renders no alert when valid", () => {
    render(
      <Field id="name" label="Name">
        {(aria) => <input {...aria} />}
      </Field>,
    );
    const input = screen.getByLabelText("Name");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("links a visible hint via aria-describedby when there is no error", () => {
    render(
      <Field id="seq" label="Sequence" hint="Terms have up to two sequences">
        {(aria) => <input {...aria} />}
      </Field>,
    );
    const input = screen.getByLabelText("Sequence");
    expect(input).toHaveAttribute("aria-describedby", "seq-hint");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(document.getElementById("seq-hint")).toHaveTextContent(
      "Terms have up to two sequences",
    );
  });

  it("prefers the error over the hint once a field is invalid", () => {
    render(
      <Field id="code" label="Code" hint="Uppercase" error="Code is taken">
        {(aria) => <input {...aria} />}
      </Field>,
    );
    const input = screen.getByLabelText("Code");
    expect(input).toHaveAttribute("aria-describedby", "code-error");
    expect(screen.getByRole("alert")).toHaveTextContent("Code is taken");
  });
});
