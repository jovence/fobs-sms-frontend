import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import { ApiError } from "@/types";
import type { Paginated } from "@/types";
import type {
  ConnectedStudent,
  Parent,
  ParentDetail,
  ParentInput,
  ParentQuery,
  ParentStats,
} from "../types";
import { seedParents } from "../mock-data";
import { httpParentsService } from "./parents.http";

export interface ParentsService {
  list(query: ParentQuery): Promise<Paginated<Parent>>;
  get(id: string): Promise<ParentDetail>;
  stats(): Promise<ParentStats>;
  create(input: ParentInput): Promise<Parent>;
  update(id: string, input: ParentInput): Promise<Parent>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  exportUnattached(): Promise<void>;
}

// ---- Mock implementation (persists to localStorage so edits survive reloads) ----

function db(): Parent[] {
  return mockStore.get<Parent[]>(scopedKey("parents"), isDemoSchool() ? seedParents : []);
}
function commit(next: Parent[]) {
  mockStore.set(scopedKey("parents"), next);
}

const CLASS_NAMES = ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "Lower Sixth", "Upper Sixth"];
const GENDERS = ["Male", "Female"] as const;

/**
 * Synthesize a parent's connected students deterministically (mock mode has no real
 * student↔tutor links). Seeded off the parent id so the list is stable across reloads.
 */
function mockConnectedStudents(parent: Parent): ConnectedStudent[] {
  let seed = 0;
  for (const ch of parent.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const [firstName] = parent.name.split(" ");
  const surname = parent.name.split(" ").slice(1).join(" ") || firstName;
  return Array.from({ length: parent.childrenCount }, (_, i) => ({
    id: `${parent.id}_stu_${i + 1}`,
    matricule: `STD-${(Math.floor(rand() * 90000) + 10000).toString()}`,
    fullName: `${["Alex", "Sam", "Joy", "Ken", "Ada", "Leo"][Math.floor(rand() * 6)]} ${surname}`,
    gender: GENDERS[Math.floor(rand() * GENDERS.length)],
    className: CLASS_NAMES[Math.floor(rand() * CLASS_NAMES.length)],
    imageUrl: null,
  }));
}

const mockParentsService: ParentsService = {
  async list(query) {
    let rows = [...db()];
    const { search, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.occupation.toLowerCase().includes(q),
      );
    }

    if (sortBy) {
      const dir = sortDir === "desc" ? -1 : 1;
      rows.sort((a, b) => {
        const av = a[sortBy] ?? "";
        const bv = b[sortBy] ?? "";
        return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
      });
    }

    const total = rows.length;
    const start = (page - 1) * perPage;
    return withLatency(
      {
        items: rows.slice(start, start + perPage),
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage) || 1,
      },
      450,
    );
  },

  async get(id) {
    const parent = db().find((r) => r.id === id);
    if (!parent) throw new ApiError("Parent not found.", "not_found", 404);
    const connectedStudents = mockConnectedStudents(parent);
    const detail: ParentDetail = {
      ...parent,
      childrenCount: connectedStudents.length,
      isApproved: true,
      connectedStudents,
    };
    return withLatency(detail, 450);
  },

  async stats() {
    const rows = db();
    const totalStudentsWithParent = rows.reduce((sum, r) => sum + (r.childrenCount || 0), 0);
    // No real student store to consult in mock mode — derive a stable, plausible count.
    const totalStudentsWithoutParent = Math.max(0, Math.round(totalStudentsWithParent * 0.35));
    return withLatency(
      {
        totalParents: rows.length,
        totalStudentsWithParent,
        totalStudentsWithoutParent,
      },
      350,
    );
  },

  async create(input) {
    const parent: Parent = {
      id: `par_${Date.now().toString(36)}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      occupation: input.occupation.trim(),
      address: input.address.trim(),
      childrenCount: 0,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };
    commit([parent, ...db()]);
    return withLatency(parent, 500);
  },

  async update(id, input) {
    let updated: Parent | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = {
          ...r,
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          occupation: input.occupation.trim(),
          address: input.address.trim(),
        };
        return updated;
      }),
    );
    if (!updated) throw new Error("Parent not found");
    return withLatency(updated, 500);
  },

  async remove(id) {
    commit(db().filter((r) => r.id !== id));
    return withLatency(undefined, 400);
  },

  async bulkRemove(ids) {
    const set = new Set(ids);
    commit(db().filter((r) => !set.has(r.id)));
    return withLatency(undefined, 500);
  },

  async exportUnattached() {
    // Live mode streams a backend PDF; mock mode downloads a small CSV stand-in so the
    // "Export unattached" flow is exercisable without a server.
    const { totalStudentsWithoutParent } = await this.stats();
    const header = ["Matricule", "Full name", "Class", "Gender"];
    const rows = Array.from({ length: totalStudentsWithoutParent }, (_, i) => [
      `STD-${(20000 + i).toString()}`,
      `Unattached Student ${i + 1}`,
      CLASS_NAMES[i % CLASS_NAMES.length],
      GENDERS[i % GENDERS.length],
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    if (typeof window === "undefined") return;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "unattached-students.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export const parentsService: ParentsService = pickService(
  mockParentsService,
  httpParentsService,
);
