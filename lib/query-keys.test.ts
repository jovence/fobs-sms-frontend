import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { NO_SCHOOL_SCOPE, currentSchoolScope, useSchoolScope } from "./query-keys";

afterEach(() => {
  useAuthStore.setState({ session: null });
});

describe("school scope", () => {
  it("returns the sentinel when no school is active", () => {
    useAuthStore.setState({ session: null });
    expect(currentSchoolScope()).toBe(NO_SCHOOL_SCOPE);
  });

  it("returns the active school id, reactively and imperatively", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useAuthStore.setState({ session: { activeSchoolId: "sch_A" } as any });
    expect(currentSchoolScope()).toBe("sch_A");
    const { result } = renderHook(() => useSchoolScope());
    expect(result.current).toBe("sch_A");
  });

  it("isolates cached data by school scope (no cross-tenant read)", () => {
    const qc = new QueryClient();
    const keyA = ["school", "sch_A", "students", "list", {}];
    const keyB = ["school", "sch_B", "students", "list", {}];
    qc.setQueryData(keyA, [{ id: "a1" }]);
    // A row set under school A is never visible under school B's key.
    expect(qc.getQueryData(keyB)).toBeUndefined();
    expect(qc.getQueryData(keyA)).toEqual([{ id: "a1" }]);
  });
});
