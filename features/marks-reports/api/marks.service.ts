import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import { downloadCsv } from "@/lib/csv";
import type {
  EntrySelection,
  EntryStudent,
  ReportDownloadParams,
  ReportGenerateResult,
  ReportIndex,
  ReportMode,
  ReportParams,
  ReportPreview,
  ReportPreviewStudent,
  SaveMarksInput,
} from "../types";
import { mockClasses, mockSubjects, seedReportRows } from "../mock-data";
import { httpMarksService } from "./marks.http";

export interface MarksService {
  /** The roster (with any previously saved marks) for a Class + Subject + Exam. */
  listEntryRoster(selection: EntrySelection): Promise<EntryStudent[]>;
  /** Persist entered marks for a Class + Subject + Exam. */
  saveMarks(input: SaveMarksInput): Promise<void>;

  // ---- Report cards (Term / Sequence / Annual) ----
  /** Filter metadata for the report cards screen (classes + academic years). */
  reportIndex(): Promise<ReportIndex>;
  /** Preview the students in scope, flagging those missing marks. */
  previewReport(mode: ReportMode, params: ReportParams): Promise<ReportPreview>;
  /** Kick off PDF generation for every student in scope. */
  generateReport(mode: ReportMode, params: ReportParams): Promise<ReportGenerateResult>;
  /** Download the consolidated ZIP / PDF of all report cards in scope. */
  downloadAllReports(mode: ReportMode, params: ReportDownloadParams): Promise<void>;
  /** Download a single student's report card PDF. */
  downloadStudentReport(mode: ReportMode, params: ReportDownloadParams): Promise<void>;
}

// ---- Mock implementation (persists saved marks to localStorage) ----

/** Saved marks, keyed by "classId|subjectId|examId" -> { studentId: mark }. */
type MarksStore = Record<string, Record<string, number>>;

function selectionKey({ classId, subjectId, examId }: EntrySelection): string {
  return `${classId}|${subjectId}|${examId}`;
}

function store(): MarksStore {
  return mockStore.get<MarksStore>(scopedKey("marks"), {});
}
function commit(next: MarksStore) {
  mockStore.set(scopedKey("marks"), next);
}

/** Stable pseudo-random small int from a seed string — deterministic across reloads. */
function stableInt(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

/** Academic years mirroring the backend `indexData` (three years, July rollover). */
function mockAcademicYears(): { years: string[]; current: string } {
  const now = new Date();
  const startYear = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const years = Array.from({ length: 3 }, (_, i) => `${startYear - i}-${startYear - i + 1}`);
  return { years, current: years[0] };
}

/** Synthesize a preview (no latency) — reused by preview + the mock downloads. */
function buildMockPreview(mode: ReportMode, params: ReportParams): ReportPreview {
  const total = mockSubjects.length; // 9 demo subjects
  const { current } = mockAcademicYears();

  let rows = isDemoSchool() ? seedReportRows : [];
  if (params.classId) rows = rows.filter((r) => r.classId === params.classId);

  const salt = `${mode}:${params.term ?? params.sequence ?? "annual"}`;
  const students: ReportPreviewStudent[] = rows.map((r) => {
    if (mode === "annual") {
      // Annual has no per-mark total; treat "no marks at all" as missing.
      const isMissing = stableInt(r.id, 7) === 0;
      return {
        id: r.id,
        fullName: r.fullName,
        matricule: r.matricule,
        className: r.className,
        subjectsCount: isMissing ? 0 : total,
        totalSubjects: null,
        missing: isMissing,
      };
    }
    const short = stableInt(r.id + salt, 4); // 0..3 subjects short (25% complete)
    const marked = Math.max(0, total - short);
    return {
      id: r.id,
      fullName: r.fullName,
      matricule: r.matricule,
      className: r.className,
      subjectsCount: marked,
      totalSubjects: total,
      missing: marked < total,
    };
  });

  const errors =
    mode === "sequence"
      ? students
          .filter((s) => s.missing)
          .map(
            (s) =>
              `${s.fullName} is missing marks for ${(s.totalSubjects ?? 0) - s.subjectsCount} subjects in sequence ${params.sequence}`,
          )
      : [];

  return {
    students,
    totalSubjects: mode === "annual" ? null : total,
    academicYear: current,
    term: params.term,
    sequence: params.sequence,
    errors,
  };
}

const mockMarksService: MarksService = {
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

  async reportIndex() {
    const { years, current } = mockAcademicYears();
    return withLatency(
      {
        academicYears: years,
        currentAcademicYear: current,
        classes: isDemoSchool() ? mockClasses : [],
      },
      350,
    );
  },

  async previewReport(mode, params) {
    return withLatency(buildMockPreview(mode, params), 500);
  },

  async generateReport(mode, params) {
    const preview = buildMockPreview(mode, params);
    return withLatency(
      { message: `${preview.students.length} report cards generated.` },
      750,
    );
  },

  async downloadAllReports(mode, params) {
    // Stand-in for the real ZIP/PDF: a CSV of the roster in scope.
    const preview = buildMockPreview(mode, params);
    await withLatency(undefined, 600);
    downloadCsv(
      `report-cards-${mode}-${params.academicYear}.csv`,
      ["Student", "Matricule", "Class", "Subjects marked", "Status"],
      preview.students.map((s) => [
        s.fullName,
        s.matricule ?? "",
        s.className,
        s.totalSubjects == null ? String(s.subjectsCount) : `${s.subjectsCount}/${s.totalSubjects}`,
        s.missing ? "Missing marks" : "Complete",
      ]),
    );
  },

  async downloadStudentReport(mode, params) {
    const preview = buildMockPreview(mode, params);
    const student = preview.students.find((s) => s.id === params.studentId);
    await withLatency(undefined, 450);
    downloadCsv(
      `report-card-${student?.matricule ?? params.studentId}.csv`,
      ["Student", "Matricule", "Class", "Subjects marked", "Status"],
      student
        ? [
            [
              student.fullName,
              student.matricule ?? "",
              student.className,
              student.totalSubjects == null
                ? String(student.subjectsCount)
                : `${student.subjectsCount}/${student.totalSubjects}`,
              student.missing ? "Missing marks" : "Complete",
            ],
          ]
        : [],
    );
  },
};

export const marksService: MarksService = pickService(
  mockMarksService,
  httpMarksService,
);
