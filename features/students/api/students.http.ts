import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type {
  Gender,
  ParsedImportStudent,
  RegistrationStatus,
  Student,
  StudentDetail,
  StudentImportPreview,
  StudentInput,
  StudentStats,
} from "../types";
import type { StudentsService } from "./students.service";

/**
 * Live implementation of {@link StudentsService} against the Laravel backend
 * (`/api/dashboard/students`, active-school scoped). Follows the `.http` reference pattern:
 * call through `lib/api-client` (envelope-unwrapped), then map the backend's snake_case
 * `StudentResource` payload onto the UI's camelCase {@link Student} type.
 */

/** Class relation embedded in `StudentResource` (index eager-loads id/name/level). */
interface StudentClassPayload {
  id: number | string;
  name: string;
  level?: string | null;
}

/** Tutor relation (only present when loaded, e.g. on the show endpoint). */
interface StudentTutorPayload {
  id: number | string;
  contact?: string | null;
  email?: string | null;
  occupation?: string | null;
  user?: { id: number | string; name: string; email: string } | null;
}

/** Shape of the backend `StudentResource` (snake_case, `id`/`class_id` numeric). */
interface StudentPayload {
  id: number | string;
  matricule: string | null;
  code?: string | null;
  full_name: string;
  date_of_birth: string | null;
  place_of_birth: string | null;
  gender: string | null;
  registration_status: string | null;
  image: string | null;
  class_id: number | string | null;
  class?: StudentClassPayload | null;
  tutor?: StudentTutorPayload | null;
  created_at: string | null;
}

/**
 * The index endpoint nests the collection under `data.students` (with `data.classes`
 * alongside) and puts pagination in the envelope's `meta` — so `data` is an object, not the
 * flat array `api.list` types it as. We read `meta` from the helper and re-type `data`.
 */
interface StudentsIndexPayload {
  students: StudentPayload[];
  classes: { id: number | string; name: string }[];
}

/** Shape of the `GET /students/stats` payload (headline counts, active school scoped). */
interface StudentStatsPayload {
  total: number;
  active: number;
  pending: number;
  male: number;
  female: number;
}

/** One record extracted by Gemini (`POST /students/import` → `data.studentData[]`). */
interface ImportRowPayload {
  matricule: string | null;
  full_name: string;
  date_of_birth: string | null;
  place_of_birth: string | null;
  gender: string | null;
  class?: string | null;
}

/** Response of the parse step: extracted rows plus the (echoed) target class id. */
interface ImportParsePayload {
  studentData: ImportRowPayload[];
  class_id: number | string;
}

function toGender(value: string | null): Gender {
  return (value ?? "").toLowerCase() === "female" ? "Female" : "Male";
}

function toStatus(value: string | null): RegistrationStatus {
  switch ((value ?? "").toLowerCase()) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

function mapStudent(p: StudentPayload): Student {
  return {
    id: String(p.id),
    matricule: p.matricule ?? null,
    fullName: p.full_name,
    gender: toGender(p.gender),
    dateOfBirth: p.date_of_birth ?? "",
    placeOfBirth: p.place_of_birth ?? "",
    classId: p.class_id != null ? String(p.class_id) : "",
    className: p.class?.name ?? "",
    status: toStatus(p.registration_status),
    // The resource exposes no guardian field; when the tutor relation is loaded (show),
    // use its user's name, otherwise null.
    guardianName: p.tutor?.user?.name ?? null,
    photoUrl: p.image ?? null,
    // NOTE: `StudentResource` omits the model's `repeater` flag — no backend source, default false.
    isRepeater: false,
    createdAt: p.created_at ?? new Date().toISOString(),
  };
}

/** Map a Gemini-extracted row (snake_case) onto the UI preview shape (camelCase). */
function mapImportRow(p: ImportRowPayload): ParsedImportStudent {
  return {
    matricule: p.matricule ?? null,
    fullName: p.full_name,
    dateOfBirth: p.date_of_birth ?? "",
    placeOfBirth: p.place_of_birth ?? "",
    gender: toGender(p.gender),
    className: p.class ?? null,
  };
}

/**
 * Map a reviewed preview row back to the confirm payload. StudentService::storeImportedStudents
 * reads matricule / full_name / date_of_birth / place_of_birth / gender (it ucfirst()s the
 * casing) — `class` and any UI-only fields are ignored, so we don't send them.
 */
function toImportRowPayload(s: ParsedImportStudent): Record<string, unknown> {
  return {
    matricule: s.matricule,
    full_name: s.fullName,
    date_of_birth: s.dateOfBirth,
    place_of_birth: s.placeOfBirth,
    gender: s.gender,
  };
}

/**
 * Owner/admin store+update validation accepts: full_name, matricule, date_of_birth,
 * place_of_birth, gender (male|female), class_id, repeater. It does NOT accept guardianName
 * or registration_status, so those fields of {@link StudentInput} are not sent here.
 */
function toPayload(input: StudentInput): Record<string, unknown> {
  return {
    full_name: input.fullName.trim(),
    matricule: input.matricule?.trim() || null,
    date_of_birth: input.dateOfBirth,
    place_of_birth: input.placeOfBirth.trim(),
    gender: input.gender.toLowerCase(),
    class_id: input.classId,
    repeater: input.isRepeater ?? false,
  };
}

function toMultipartPayload(input: StudentInput): FormData {
  const payload = toPayload(input);
  const form = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    form.append(key, value == null ? "" : String(value));
  }

  if (input.image) form.append("image", input.image);

  return form;
}

function studentBody(input: StudentInput): Record<string, unknown> | FormData {
  return input.image ? toMultipartPayload(input) : toPayload(input);
}

export const httpStudentsService: StudentsService = {
  async list(query): Promise<Paginated<Student>> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.classId) params.set("class_id", query.classId);
    if (query.status) params.set("status", query.status);
    params.set("page", String(query.page));
    // NOTE: the backend hardcodes paginate(20); `per_page` is ignored (sent for forward-compat).
    params.set("per_page", String(query.perPage));

    const res = await api.list<StudentPayload>(`/dashboard/students?${params.toString()}`);
    // `data` is really `{ students, classes }` here (see StudentsIndexPayload) — re-type it.
    const payload = res.data as unknown as StudentsIndexPayload;
    const items = (payload?.students ?? []).map(mapStudent);

    const meta = res.meta;
    const perPage = meta?.per_page ?? query.perPage;
    const total = meta?.total ?? items.length;
    return {
      items,
      page: meta?.current_page ?? query.page,
      perPage,
      total,
      totalPages: meta?.last_page ?? (Math.ceil(total / perPage) || 1),
    };
  },

  async get(id): Promise<StudentDetail> {
    const p = await api.get<StudentPayload>(`/dashboard/students/${id}`);
    return {
      ...mapStudent(p),
      code: p.code ?? null,
      guardianContact: p.tutor?.contact ?? null,
      guardianEmail: p.tutor?.email ?? null,
    };
  },

  async stats(): Promise<StudentStats> {
    const s = await api.get<StudentStatsPayload>("/dashboard/students/stats");
    return {
      total: s.total ?? 0,
      active: s.active ?? 0,
      pending: s.pending ?? 0,
      male: s.male ?? 0,
      female: s.female ?? 0,
    };
  },

  async importParse({ file, classId }): Promise<StudentImportPreview> {
    // Multipart: the backend validates `student_file` (image/pdf/xlsx) + `class_id`, runs Gemini,
    // and returns `{ studentData, class_id }`. api-client sends FormData as multipart automatically.
    const form = new FormData();
    form.append("student_file", file);
    form.append("class_id", classId);
    const res = await api.post<ImportParsePayload>("/dashboard/students/import", form);
    return {
      students: (res.studentData ?? []).map(mapImportRow),
      classId: res.class_id != null ? String(res.class_id) : classId,
    };
  },

  async importConfirm({ students, classId }): Promise<void> {
    await api.post<null>("/dashboard/students/import/confirm", {
      students: students.map(toImportRowPayload),
      class_id: classId,
    });
  },

  async create(input): Promise<Student> {
    const student = await api.post<StudentPayload>("/dashboard/students", studentBody(input));
    return mapStudent(student);
  },

  async update(id, input): Promise<Student> {
    const student = await api.put<StudentPayload>(`/dashboard/students/${id}`, studentBody(input));
    return mapStudent(student);
  },

  async remove(id): Promise<void> {
    await api.delete<null>(`/dashboard/students/${id}`);
  },

  // No bulk-delete endpoint exists — fan out to the single DELETE for each id.
  async bulkRemove(ids): Promise<void> {
    await Promise.all(ids.map((id) => api.delete<null>(`/dashboard/students/${id}`)));
  },

  async updateStatus(id, status): Promise<Student> {
    const student = await api.patch<StudentPayload>(`/dashboard/students/${id}/status`, {
      registration_status: status,
    });
    return mapStudent(student);
  },
};
