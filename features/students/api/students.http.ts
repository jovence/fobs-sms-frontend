import { api } from "@/lib/api-client";
import type { Paginated } from "@/types";
import type {
  Gender,
  RegistrationStatus,
  Student,
  StudentInput,
  StudentQuery,
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

  async get(id): Promise<Student> {
    const student = await api.get<StudentPayload>(`/dashboard/students/${id}`);
    return mapStudent(student);
  },

  async create(input): Promise<Student> {
    const student = await api.post<StudentPayload>("/dashboard/students", toPayload(input));
    return mapStudent(student);
  },

  async update(id, input): Promise<Student> {
    const student = await api.put<StudentPayload>(`/dashboard/students/${id}`, toPayload(input));
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
