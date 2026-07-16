import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { currentAcademicYear } from "@/lib/format";
import { useAuthStore } from "@/features/auth/store";
import type { School } from "@/types";
import type { SchoolInput } from "../types";
import { seedSchools } from "../mock-data";

export interface SchoolsService {
  list(): Promise<School[]>;
  create(input: SchoolInput): Promise<School>;
  update(id: string, input: SchoolInput): Promise<School>;
  remove(id: string): Promise<void>;
}

const DEMO_OWNER_ID = "usr_owner";

/** Schools are scoped to the signed-in account. Only the demo owner starts with seed data;
 *  every other (e.g. freshly-registered) account starts empty and builds its own. */
function ownerId(): string {
  return useAuthStore.getState().session?.user?.id ?? "guest";
}
function storeKey(id: string): string {
  return `schools:${id}`;
}
function db(): School[] {
  const id = ownerId();
  return mockStore.get<School[]>(storeKey(id), id === DEMO_OWNER_ID ? seedSchools : []);
}
function commit(next: School[]) {
  mockStore.set(storeKey(ownerId()), next);
}
function code(acronym: string) {
  return `${acronym.toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.abs(hash(acronym)) % 9000)}`;
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

const mockSchoolsService: SchoolsService = {
  async list() {
    return withLatency([...db()], 400);
  },
  async create(input) {
    const school: School = {
      id: `sch_${Date.now().toString(36)}`,
      name: input.name.trim(),
      acronym: input.acronym.trim().toUpperCase(),
      code: code(input.acronym),
      ownerId: ownerId(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      academicYear: currentAcademicYear(),
      logoUrl: null,
      subscription: "free",
      isDemo: false,
      studentCount: 0,
      teacherCount: 0,
      classCount: 0,
      createdAt: new Date().toISOString(),
    };
    commit([...db(), school]);
    return withLatency(school, 550);
  },
  async update(id, input) {
    let updated: School | undefined;
    commit(
      db().map((r) =>
        r.id === id
          ? (updated = {
              ...r,
              name: input.name.trim(),
              acronym: input.acronym.trim().toUpperCase(),
              email: input.email?.trim() || null,
              phone: input.phone?.trim() || null,
              address: input.address?.trim() || null,
            })
          : r,
      ),
    );
    if (!updated) throw new Error("School not found");
    return withLatency(updated, 500);
  },
  async remove(id) {
    commit(db().filter((r) => r.id !== id));
    return withLatency(undefined, 450);
  },
};

export const schoolsService: SchoolsService =
  API_MODE === "live" ? mockSchoolsService : mockSchoolsService;
