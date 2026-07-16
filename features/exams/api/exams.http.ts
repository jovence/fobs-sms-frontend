import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type { Exam, ExamInput, Term } from "../types";
import type { ExamsService } from "./exams.service";

/**
 * Live implementation of {@link ExamsService} against the Laravel backend
 * (`/api/dashboard/exams`, tenancy via `X-School-Id`). Maps the snake_case
 * `ExamResource` payload onto the UI's camelCase {@link Exam} type.
 */

/** Shape of the backend `ExamResource` (snake_case, `id`/`school_id` numeric). */
interface ExamPayload {
  id: number | string;
  school_id: number | string | null;
  name: string;
  term: string | null;
  academic_year: string | null;
  sequence: number | null;
  mark_entry_allowed: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at?: string | null;
}

const TERMS: readonly Term[] = ["First", "Second", "Third"];

function toTerm(value: string | null): Term {
  return TERMS.includes(value as Term) ? (value as Term) : "First";
}

function mapExam(p: ExamPayload): Exam {
  return {
    id: String(p.id),
    name: p.name,
    term: toTerm(p.term),
    // Backend `store` validation does not accept `sequence`, so newly created
    // exams come back with `sequence` null → default 0.
    sequence: p.sequence ?? 0,
    academicYear: p.academic_year ?? "",
    published: p.is_published,
    markEntryAllowed: p.mark_entry_allowed,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/** Payload for POST /dashboard/exams. `academic_year`/`sequence` are not part of `ExamInput`. */
function toCreatePayload(input: ExamInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    term: input.term,
    is_published: input.published,
    mark_entry_allowed: input.markEntryAllowed,
  };
}

/** Today's date as YYYY-MM-DD, to satisfy the update endpoint's required `start_date`. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Payload for PUT /dashboard/exams/{id}. The backend requires `start_date` (a required|date
 * field the frontend does not model and the Exam model does not persist); we send today's date
 * purely to pass validation — it is dropped on the (non-fillable) mass-assignment.
 */
function toUpdatePayload(input: ExamInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    term: input.term,
    is_published: input.published,
    mark_entry_allowed: input.markEntryAllowed,
    start_date: today(),
  };
}

export const httpExamsService: ExamsService = {
  async list(query) {
    const { data, meta } = await api.list<ExamPayload>(
      `/dashboard/exams?page=${query.page}&per_page=${query.perPage}`,
    );
    const items = data.map(mapExam);
    const perPage = meta?.per_page ?? query.perPage;
    const total = meta?.total ?? items.length;
    const paginated: Paginated<Exam> = {
      items,
      page: meta?.current_page ?? query.page,
      perPage,
      total,
      totalPages: meta?.last_page ?? (Math.ceil(total / perPage) || 1),
    };
    return paginated;
  },

  async options() {
    // No dedicated options endpoint — walk the paginated index (few exams per school).
    const first = await api.list<ExamPayload>("/dashboard/exams?page=1");
    const rows: ExamPayload[] = [...first.data];
    const lastPage = first.meta?.last_page ?? 1;
    for (let page = 2; page <= lastPage; page += 1) {
      const next = await api.list<ExamPayload>(`/dashboard/exams?page=${page}`);
      rows.push(...next.data);
    }
    return rows.map((e) => ({ id: String(e.id), name: e.name }));
  },

  async get(id) {
    // `show` wraps the exam under a `exam` key alongside extra dashboard data.
    const data = await api.get<{ exam: ExamPayload }>(`/dashboard/exams/${id}`);
    return mapExam(data.exam);
  },

  async create(input) {
    const exam = await api.post<ExamPayload>("/dashboard/exams", toCreatePayload(input));
    return mapExam(exam);
  },

  async update(id, input) {
    const exam = await api.put<ExamPayload>(`/dashboard/exams/${id}`, toUpdatePayload(input));
    return mapExam(exam);
  },

  async remove(id) {
    await api.delete<null>(`/dashboard/exams/${id}`);
  },

  async bulkRemove(ids) {
    // No bulk endpoint — fan out to the single-delete route.
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/exams/${id}`)));
  },
};
