import { pickService } from "@/lib/api-client";
import { mockStore, withLatency } from "@/lib/mock";
import { isDemoSchool, scopedKey } from "@/features/auth/tenancy";
import type { Paginated } from "@/types";
import type {
  AssignClassesForm,
  AssignSubjectsForm,
  AssignedClass,
  AssignedSubject,
  ClassAssignmentInput,
  Teacher,
  TeacherInput,
  TeacherProfile,
  TeacherQuery,
  TeacherStatus,
  TeachingAssignment,
} from "../types";
import {
  seedClasses,
  seedSubjects,
  seedTeachers,
  type MockClass,
  type MockSubject,
} from "../mock-data";
import { httpTeachersService } from "./teachers.http";

export interface TeachersService {
  list(query: TeacherQuery): Promise<Paginated<Teacher>>;
  approve(id: string): Promise<Teacher>;
  update(id: string, input: TeacherInput): Promise<Teacher>;
  remove(id: string): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
  /** Full profile: teacher + counts + assigned subjects/classes + teaching assignments. */
  get(id: string): Promise<TeacherProfile>;
  /** Data for the assign-subjects page. */
  assignSubjectsForm(id: string): Promise<AssignSubjectsForm>;
  /** Replace the teacher's subject set with `subjectIds`. */
  assignSubjects(id: string, subjectIds: string[]): Promise<void>;
  /** Remove a single subject from the teacher. */
  removeSubject(id: string, subjectId: string): Promise<void>;
  /** Data for the assign-classes page. */
  assignClassesForm(id: string): Promise<AssignClassesForm>;
  /** Replace the teacher's class/teaching assignments. */
  assignClasses(id: string, assignments: ClassAssignmentInput[]): Promise<void>;
  /** Remove a single class (all its subject assignments) from the teacher. */
  removeClass(id: string, classId: string): Promise<void>;
}

function db(): Teacher[] {
  return mockStore.get<Teacher[]>(scopedKey("teachers"), isDemoSchool() ? seedTeachers : []);
}
function commit(next: Teacher[]) {
  mockStore.set(scopedKey("teachers"), next);
}

// --- Assignment mock state (persisted so assign/remove round-trips work offline) ---

type ClassSubjectRow = { subjectId: string; classId: string };

const SUBJECT_KEY = "teacher-subject-assignments";
const CLASS_SUBJECT_KEY = "teacher-class-assignments";

function subjectDb(): Record<string, string[]> {
  return mockStore.get<Record<string, string[]>>(scopedKey(SUBJECT_KEY), {});
}
function classSubjectDb(): Record<string, ClassSubjectRow[]> {
  return mockStore.get<Record<string, ClassSubjectRow[]>>(scopedKey(CLASS_SUBJECT_KEY), {});
}
function commitSubjects(next: Record<string, string[]>) {
  mockStore.set(scopedKey(SUBJECT_KEY), next);
}
function commitClassSubjects(next: Record<string, ClassSubjectRow[]>) {
  mockStore.set(scopedKey(CLASS_SUBJECT_KEY), next);
}

function findSubject(id: string): MockSubject | undefined {
  return seedSubjects.find((s) => s.id === id);
}
function findClass(id: string): MockClass | undefined {
  return seedClasses.find((c) => c.id === id);
}
function mapMockSubject(s: MockSubject): AssignedSubject {
  return { id: s.id, name: s.name, code: s.code, level: s.level, series: s.series };
}

/** Deterministic demo seed for an active teacher, derived from the numeric part of its id. */
function seedAssignmentsFor(teacherId: string): { subjects: string[]; classSubjects: ClassSubjectRow[] } {
  const n = Number.parseInt(teacherId.replace(/\D/g, ""), 10) || 1;
  const subjectCount = (n % 3) + 1;
  const subjects: string[] = [];
  for (let i = 0; i < subjectCount; i++) {
    subjects.push(seedSubjects[(n + i) % seedSubjects.length].id);
  }
  const uniqueSubjects = [...new Set(subjects)];

  const seen = new Set<string>();
  const classSubjects: ClassSubjectRow[] = [];
  uniqueSubjects.forEach((subjectId, idx) => {
    const subject = findSubject(subjectId);
    if (!subject || subject.classIds.length === 0) return;
    const count = ((n + idx) % 2) + 1;
    for (let j = 0; j < count; j++) {
      const classId = subject.classIds[(n + j) % subject.classIds.length];
      const key = `${subjectId}:${classId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      classSubjects.push({ subjectId, classId });
    }
  });
  return { subjects: uniqueSubjects, classSubjects };
}

/**
 * Read a teacher's assignments, lazily seeding demo data the first time an active teacher in a
 * demo school is opened. Non-demo schools and pending teachers start empty.
 */
function readAssignments(
  teacherId: string,
  status: TeacherStatus,
): { subjects: string[]; classSubjects: ClassSubjectRow[] } {
  const subjects = subjectDb();
  const classSubjects = classSubjectDb();
  const known = teacherId in subjects || teacherId in classSubjects;
  if (known) {
    return { subjects: subjects[teacherId] ?? [], classSubjects: classSubjects[teacherId] ?? [] };
  }
  if (!isDemoSchool() || status !== "active") {
    return { subjects: [], classSubjects: [] };
  }
  const seeded = seedAssignmentsFor(teacherId);
  subjects[teacherId] = seeded.subjects;
  classSubjects[teacherId] = seeded.classSubjects;
  commitSubjects(subjects);
  commitClassSubjects(classSubjects);
  return seeded;
}

function requireTeacher(id: string): Teacher {
  const teacher = db().find((t) => t.id === id);
  if (!teacher) throw new Error("Teacher not found");
  return teacher;
}

function classWithCount(id: string): AssignedClass | undefined {
  const c = findClass(id);
  if (!c) return undefined;
  return {
    id: c.id,
    name: c.name,
    level: c.level,
    academicYear: c.academicYear,
    section: c.section,
    studentCount: c.studentCount,
  };
}

function assignedClassIds(rows: ClassSubjectRow[]): string[] {
  return [...new Set(rows.map((r) => r.classId))];
}

const mockTeachersService: TeachersService = {
  async list(query) {
    let rows = [...db()];
    const { search, status, sortBy, sortDir, page, perPage } = query;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.specialization.toLowerCase().includes(q),
      );
    }
    if (status) rows = rows.filter((r) => r.status === status);

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

  async approve(id) {
    let updated: Teacher | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, status: "active" };
        return updated;
      }),
    );
    if (!updated) throw new Error("Teacher not found");
    return withLatency(updated, 400);
  },

  async update(id, input) {
    let updated: Teacher | undefined;
    commit(
      db().map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...input };
        return updated;
      }),
    );
    if (!updated) throw new Error("Teacher not found");
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

  async get(id) {
    const teacher = requireTeacher(id);
    const { subjects: subjectIds, classSubjects } = readAssignments(id, teacher.status);

    const subjects: AssignedSubject[] = subjectIds
      .map(findSubject)
      .filter((s): s is MockSubject => Boolean(s))
      .map(mapMockSubject);

    const classIds = assignedClassIds(classSubjects);
    const classes: AssignedClass[] = classIds
      .map(classWithCount)
      .filter((c): c is AssignedClass => Boolean(c));

    const assignments: TeachingAssignment[] = classIds
      .map((classId): TeachingAssignment | null => {
        const c = classWithCount(classId);
        if (!c) return null;
        const subjectList = classSubjects
          .filter((r) => r.classId === classId)
          .map((r) => findSubject(r.subjectId))
          .filter((s): s is MockSubject => Boolean(s))
          .map(mapMockSubject);
        return {
          classId,
          className: c.name,
          studentCount: c.studentCount,
          subjects: subjectList,
        };
      })
      .filter((a): a is TeachingAssignment => Boolean(a));

    const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

    const profile: TeacherProfile = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      address: "",
      specialization: teacher.specialization,
      qualifications: teacher.qualifications,
      experienceYears: teacher.experienceYears,
      bio:
        teacher.status === "active"
          ? `${teacher.name} is a dedicated ${teacher.specialization} teacher with ${teacher.experienceYears} years of classroom experience.`
          : "",
      avatarUrl: teacher.avatarUrl,
      status: teacher.status,
      joinedAt: teacher.joinedAt,
      approvedAt: teacher.status === "active" ? teacher.joinedAt : null,
      totalSubjects: subjects.length,
      totalClasses: classes.length,
      totalAssignments: classSubjects.length,
      totalStudents,
      subjects,
      classes,
      assignments,
    };
    return withLatency(profile, 450);
  },

  async assignSubjectsForm(id) {
    const teacher = requireTeacher(id);
    const { subjects } = readAssignments(id, teacher.status);
    return withLatency(
      {
        teacherName: teacher.name,
        assignedSubjectIds: subjects,
        availableSubjects: seedSubjects.map(mapMockSubject),
      },
      400,
    );
  },

  async assignSubjects(id, subjectIds) {
    requireTeacher(id);
    const keep = new Set(subjectIds);

    const subjects = subjectDb();
    subjects[id] = [...keep];
    commitSubjects(subjects);

    // Removing a subject cascades: drop its class/teaching assignments too (mirrors backend).
    const classSubjects = classSubjectDb();
    classSubjects[id] = (classSubjects[id] ?? []).filter((r) => keep.has(r.subjectId));
    commitClassSubjects(classSubjects);

    return withLatency(undefined, 500);
  },

  async removeSubject(id, subjectId) {
    requireTeacher(id);

    const subjects = subjectDb();
    subjects[id] = (subjects[id] ?? []).filter((s) => s !== subjectId);
    commitSubjects(subjects);

    const classSubjects = classSubjectDb();
    classSubjects[id] = (classSubjects[id] ?? []).filter((r) => r.subjectId !== subjectId);
    commitClassSubjects(classSubjects);

    return withLatency(undefined, 400);
  },

  async assignClassesForm(id) {
    const teacher = requireTeacher(id);
    const { subjects: subjectIds, classSubjects } = readAssignments(id, teacher.status);

    const groups = subjectIds
      .map(findSubject)
      .filter((s): s is MockSubject => Boolean(s))
      .map((subject) => ({
        subjectId: subject.id,
        subjectName: subject.name,
        classes: subject.classIds
          .map(findClass)
          .filter((c): c is MockClass => Boolean(c))
          .map((c) => ({
            id: c.id,
            name: c.name,
            level: c.level,
            academicYear: c.academicYear,
          })),
        assignedClassIds: classSubjects
          .filter((r) => r.subjectId === subject.id)
          .map((r) => r.classId),
      }));

    const classes = assignedClassIds(classSubjects)
      .map(classWithCount)
      .filter((c): c is AssignedClass => Boolean(c));

    return withLatency(
      { teacherName: teacher.name, assignedClasses: classes, subjects: groups },
      400,
    );
  },

  async assignClasses(id, assignments) {
    requireTeacher(id);
    const seen = new Set<string>();
    const rows: ClassSubjectRow[] = [];
    for (const a of assignments) {
      for (const classId of a.classIds) {
        const key = `${a.subjectId}:${classId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ subjectId: a.subjectId, classId });
      }
    }
    const classSubjects = classSubjectDb();
    classSubjects[id] = rows;
    commitClassSubjects(classSubjects);
    return withLatency(undefined, 500);
  },

  async removeClass(id, classId) {
    requireTeacher(id);
    const classSubjects = classSubjectDb();
    classSubjects[id] = (classSubjects[id] ?? []).filter((r) => r.classId !== classId);
    commitClassSubjects(classSubjects);
    return withLatency(undefined, 400);
  },
};

export const teachersService: TeachersService = pickService(
  mockTeachersService,
  httpTeachersService,
);
