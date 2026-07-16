import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentsService } from "./students.service";

const SEED_TOTAL = 86;

/**
 * Re-import the module fresh each time, with a demo school active so the mock seeds its
 * fixtures (entity data is scoped to the active school; non-demo schools start empty).
 */
async function freshService(): Promise<StudentsService> {
  vi.resetModules();
  localStorage.clear();
  const { useAuthStore } = await import("@/features/auth/store");
  useAuthStore.setState({
    session: {
      user: {
        id: "usr_owner",
        name: "Demo Owner",
        email: "owner@fobs.cm",
        phone: null,
        role: "owner",
        emailVerifiedAt: null,
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      token: "test",
      memberships: [],
      activeSchoolId: "sch_1", // a demo school → seeded data
    },
  });
  const mod = await import("./students.service");
  return mod.studentsService;
}

describe("studentsService (mock)", () => {
  beforeEach(() => localStorage.clear());

  it("paginates with correct totals", async () => {
    const svc = await freshService();
    const p1 = await svc.list({ page: 1, perPage: 10 });
    expect(p1.items).toHaveLength(10);
    expect(p1.total).toBe(SEED_TOTAL);
    expect(p1.totalPages).toBe(Math.ceil(SEED_TOTAL / 10));
    const p2 = await svc.list({ page: 2, perPage: 10 });
    expect(p2.items[0].id).not.toBe(p1.items[0].id);
  });

  it("filters by status", async () => {
    const svc = await freshService();
    const r = await svc.list({ page: 1, perPage: 200, status: "Approved" });
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.items.every((s) => s.status === "Approved")).toBe(true);
  });

  it("sorts by fullName ascending", async () => {
    const svc = await freshService();
    const r = await svc.list({ page: 1, perPage: 200, sortBy: "fullName", sortDir: "asc" });
    const names = r.items.map((s) => s.fullName);
    expect(names).toEqual([...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });

  it("creates, updates and deletes a student", async () => {
    const svc = await freshService();
    const created = await svc.create({
      fullName: "Test Student",
      gender: "Male",
      dateOfBirth: "2010-01-01",
      placeOfBirth: "Buea",
      classId: "cls_1",
    });
    expect(created.id).toBeTruthy();
    expect((await svc.list({ page: 1, perPage: 300 })).total).toBe(SEED_TOTAL + 1);

    const updated = await svc.update(created.id, {
      fullName: "Renamed Student",
      gender: "Female",
      dateOfBirth: "2010-01-01",
      placeOfBirth: "Buea",
      classId: "cls_1",
    });
    expect(updated.fullName).toBe("Renamed Student");
    expect(updated.gender).toBe("Female");

    await svc.remove(created.id);
    expect((await svc.list({ page: 1, perPage: 300 })).total).toBe(SEED_TOTAL);
  });

  it("bulk-removes multiple students", async () => {
    const svc = await freshService();
    const ids = (await svc.list({ page: 1, perPage: 5 })).items.map((s) => s.id);
    await svc.bulkRemove(ids);
    expect((await svc.list({ page: 1, perPage: 300 })).total).toBe(SEED_TOTAL - ids.length);
  });
});
