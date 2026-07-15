import { API_MODE } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import type { Paginated } from "@/types";
import type {
  EntrySelection,
  EntryStudent,
  ReportQuery,
  ReportRow,
  SaveMarksInput,
} from "../types";
import { seedReportRows } from "../mock-data";

export interface MarksService {
  /** Aggregated per-student results for the Report Cards table. */
  listReportRows(query: ReportQuery): Promise<Paginated<ReportRow>>;
  /** The roster (with any previously saved marks) for a Class + Subject + Exam. */
  listEntryRoster(selection: EntrySelection): Promise<EntryStudent[]>;
  /** Persist entered marks for a Class + Subject + Exam. */
  saveMarks(input: SaveMarksInput): Promise<void>;
  /** Generate a single student's report card. */
  generateReportCard(id: string): Promise<void>;
  /** Generate report cards for every student matching the current filter. */
  generateAll(query: ReportQuery): Promise<void>;
}

// ---- Mock implementation (persists saved marks to localStorage) ----

/** Saved marks, keyed by "classId|subjectId|examId" -> { studentId: mark }. */
type MarksStore = Record<string, Record<string, number>>;

const STORE_KEY = "marks";

function selectionKey({ classId, subjectId, examId }: EntrySelection): string {
  return `${classId}|${subjectId}|${examId}`;
}

let cache: MarksStore | null = null;
function store(): MarksStore {
  if (!cache) cache = mockStore.get<MarksStore>(STORE_KEY, {});
  return cache;
}
function commit(next: MarksStore) {
  cache = next;
  mockStore.set(STORE_KEY, next);
}

const mockMarksService: MarksService = {
  async listReportRows(query) {
    let rows = [...seedReportRows];
    const { search, classId, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          (r.matricule ?? "").toLowerCase().includes(q),
      );
    }
    if (classId) rows = rows.filter((r) => r.classId === classId);

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
    const items = rows.slice(start, start + perPage);

    return withLatency(
      { items, page, perPage, total, totalPages: Math.ceil(total / perPage) || 1 },
      450,
    );
  },

  async listEntryRoster(selection) {
    const saved = store()[selectionKey(selection)] ?? {};
    const roster: EntryStudent[] = seedReportRows
      .filter((r) => r.classId === selection.classId)
      .map((r) => ({
        id: r.id,
        fullName: r.fullName,
        matricule: r.matricule,
        mark: r.id in saved ? saved[r.id] : null,
      }));
    return withLatency(roster, 400);
  },

  async saveMarks(input) {
    const key = selectionKey(input);
    const next: MarksStore = { ...store() };
    const bucket: Record<string, number> = { ...(next[key] ?? {}) };
    for (const { studentId, mark } of input.marks) bucket[studentId] = mark;
    next[key] = bucket;
    commit(next);
    return withLatency(undefined, 550);
  },

  async generateReportCard(_id) {
    return withLatency(undefined, 500);
  },

  async generateAll(_query) {
    return withLatency(undefined, 700);
  },
};

export const marksService: MarksService =
  API_MODE === "live" ? mockMarksService : mockMarksService;
