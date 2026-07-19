import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUnsavedChangesWarning } from "./use-unsaved-changes-warning";

function fireBeforeUnload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe("useUnsavedChangesWarning", () => {
  it("does not block unload when disabled", () => {
    renderHook(() => useUnsavedChangesWarning(false));
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });

  it("blocks unload when enabled", () => {
    renderHook(() => useUnsavedChangesWarning(true));
    expect(fireBeforeUnload().defaultPrevented).toBe(true);
  });

  it("removes the listener on unmount", () => {
    const { unmount } = renderHook(() => useUnsavedChangesWarning(true));
    unmount();
    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });
});
