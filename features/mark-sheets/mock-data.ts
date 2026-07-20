/**
 * Demo seed for the offline (mock) mark-sheets service. Only the seeded demo
 * schools expose this data (see {@link isDemoSchool}); a freshly-created school
 * starts with empty option lists and therefore an empty preview (the 422 path).
 */

import type { ClassOption, ExamOption, MarkSheetRow, SubjectOption } from "./types";

export const seedSubjects: SubjectOption[] = [
  { id: "subj_math", name: "Mathematics", code: "MATH" },
  { id: "subj_eng", name: "English Language", code: "ENG" },
  { id: "subj_phy", name: "Physics", code: "PHY" },
  { id: "subj_bio", name: "Biology", code: "BIO" },
];

export const seedExams: ExamOption[] = [
  { id: "exam_seq1", name: "Sequence 1", term: 1 },
  { id: "exam_seq2", name: "Sequence 2", term: 1 },
  { id: "exam_seq3", name: "Sequence 3", term: 2 },
];

export const seedClasses: ClassOption[] = [
  { id: "cls_form1", name: "Form 1" },
  { id: "cls_form2", name: "Form 2" },
  { id: "cls_form3", name: "Form 3" },
];

/** Student rosters per demo class — names only; ids are synthesized below. */
const rosters: Record<string, string[]> = {
  cls_form1: [" Awa Ndeh", "Brian Fomba", "Clarisse Mbah", "Divine Tabi", "Emile Nkeng"],
  cls_form2: ["Fadimatou Bello", "Gaston Ekwe", "Hilda Ngu", "Ivan Sona", "Josephine Ako"],
  cls_form3: ["Kevin Manga", "Laure Etonde", "Marcel Njoya", "Nadia Ful", "Olivier Bessong"],
};

/**
 * Deterministic pseudo-random in [0, 1) from a string seed, so the same selection
 * always synthesizes the SAME marks — preview and the CSV download stay in sync.
 */
function seededUnit(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Map the 32-bit hash to [0, 1).
  return ((hash >>> 0) % 1000) / 1000;
}

/**
 * Synthesize the marks table for a Subject + Exam (+ optional Class). When no class
 * is given, the sheet spans every demo class — mirroring the backend's `preview()`,
 * which returns all marks for the subject/exam when `class_id` is absent.
 */
export function synthesizeRows(
  subjectId: string,
  examId: string,
  classId?: string,
): MarkSheetRow[] {
  const classIds = classId ? [classId] : seedClasses.map((c) => c.id);
  const rows: MarkSheetRow[] = [];

  for (const cid of classIds) {
    const className = seedClasses.find((c) => c.id === cid)?.name ?? cid;
    const names = rosters[cid] ?? [];
    names.forEach((name, index) => {
      const studentId = `${cid}_stu_${index + 1}`;
      // 6..19 out of 20, in 0.5 steps — a believable spread that is stable per seed.
      const unit = seededUnit(`${studentId}|${subjectId}|${examId}`);
      const mark = Math.round((6 + unit * 13) * 2) / 2;
      rows.push({
        id: studentId,
        studentName: name,
        matricule: `${cid.slice(-1)}${String(index + 1).padStart(3, "0")}`.toUpperCase(),
        className,
        mark,
      });
    });
  }

  return rows;
}
