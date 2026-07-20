import { faker } from "@faker-js/faker";
import { currentAcademicYear } from "@/lib/format";
import type {
  Exam,
  ExamClassPerformance,
  ExamDashboard,
  ExamSubjectClassBreakdown,
  ExamSubjectStat,
  Term,
} from "./types";

/** Cameroon rule: Term 1 = seq 1&2, Term 2 = seq 3&4, Term 3 = seq 5&6. */
export function termForSequence(sequence: number): Term {
  if (sequence <= 2) return "First";
  if (sequence <= 4) return "Second";
  return "Third";
}

const SEQUENCE_NAMES: Record<number, string> = {
  1: "First Sequence",
  2: "Second Sequence",
  3: "Third Sequence",
  4: "Fourth Sequence",
  5: "Fifth Sequence",
  6: "Sixth Sequence",
};

function priorYear(year: string, back: number): string {
  const start = Number(year.split("-")[0]) - back;
  return `${start}-${start + 1}`;
}

/** Deterministic seed dataset so mock mode is stable across reloads (~16 exams). */
function generate(): Exam[] {
  faker.seed(2026);
  const current = currentAcademicYear();
  const years = [current, priorYear(current, 1), priorYear(current, 2)];
  const rows: Exam[] = [];
  let n = 0;

  years.forEach((year, yi) => {
    const seqCount = yi === 2 ? 4 : 6; // 6 + 6 + 4 = 16 exams
    const isCurrent = yi === 0;
    for (let seq = 1; seq <= seqCount; seq++) {
      n += 1;
      // Past years are fully published; the current year publishes earlier sequences only.
      const published = !isCurrent || seq <= 3;
      // Mark entry stays open for the current year's later sequences; otherwise mostly closed.
      const markEntryAllowed =
        isCurrent && seq >= 4 ? true : faker.datatype.boolean(0.15);
      rows.push({
        id: `exm_${n.toString().padStart(3, "0")}`,
        name: SEQUENCE_NAMES[seq],
        term: termForSequence(seq),
        sequence: seq,
        academicYear: year,
        published,
        markEntryAllowed,
        createdAt: faker.date
          .recent({ days: 90 * (yi + 1), refDate: new Date() })
          .toISOString(),
      } satisfies Exam);
    }
  });

  return rows;
}

export const seedExams = generate();

// ---- Mock exam dashboard / analytics ------------------------------------------------------

/** Anglophone-Cameroon class roster used to synthesise per-exam analytics offline. */
const MOCK_CLASSES = [
  "Form 1",
  "Form 2",
  "Form 3",
  "Form 4 Science",
  "Form 5 Science",
] as const;

/** A representative subject spread (name + short code) for the submission-status breakdown. */
const MOCK_SUBJECTS = [
  { name: "Mathematics", code: "MATH" },
  { name: "English Language", code: "ENGL" },
  { name: "French", code: "FREN" },
  { name: "Biology", code: "BIOL" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Physics", code: "PHYS" },
  { name: "History", code: "HIST" },
  { name: "Citizenship", code: "CITZ" },
] as const;

/** Stable numeric seed from an exam id so an exam's analytics never reshuffle across reloads. */
function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % 100000;
}

/** Class average (/20) → pass rate (%), centred on the 10/20 pass mark. */
function passRateFromAverage(average: number): number {
  return Math.min(99, Math.max(3, Math.round(50 + (average - 10) * 9)));
}

/**
 * Synthesise a realistic exam dashboard from a stored {@link Exam}. The exam's lifecycle flags
 * drive completeness: a published exam is fully entered, an open mark-entry exam is mid-way, and
 * a closed/unpublished one is barely started — so the offline page mirrors the backend analytics.
 */
export function buildExamDashboard(exam: Exam): ExamDashboard {
  faker.seed(seedFromId(exam.id));

  const completion = exam.published
    ? 1
    : exam.markEntryAllowed
      ? faker.number.float({ min: 0.45, max: 0.85 })
      : faker.number.float({ min: 0, max: 0.35 });

  // Roster: a student count per class, and a submission cell per (class, subject).
  const roster = MOCK_CLASSES.map((name) => ({
    name,
    students: faker.number.int({ min: 28, max: 46 }),
  }));
  const totalStudents = roster.reduce((sum, c) => sum + c.students, 0);

  type Cell = { average: number; entered: number; passed: number };
  // cells[classIndex][subjectIndex]
  const cells: Cell[][] = roster.map((klass) =>
    MOCK_SUBJECTS.map(() => {
      const average = faker.number.float({ min: 7.5, max: 14.5 });
      // Each subject is slightly ahead/behind the exam's overall completion.
      const cellCompletion = Math.min(
        1,
        Math.max(0, completion + faker.number.float({ min: -0.18, max: 0.12 })),
      );
      const entered = Math.round(klass.students * cellCompletion);
      const passed = Math.round((entered * passRateFromAverage(average)) / 100);
      return { average, entered, passed };
    }),
  );

  // ---- Grade distribution (aggregate every entered mark) ----
  let totalMarksEntered = 0;
  let totalPassed = 0;
  let weightedSum = 0;
  cells.forEach((row) =>
    row.forEach((cell) => {
      totalMarksEntered += cell.entered;
      totalPassed += cell.passed;
      weightedSum += cell.average * cell.entered;
    }),
  );
  const totalFailed = totalMarksEntered - totalPassed;
  const averageMark = totalMarksEntered > 0 ? Number((weightedSum / totalMarksEntered).toFixed(2)) : 0;
  const passRate = totalMarksEntered > 0 ? Number(((totalPassed / totalMarksEntered) * 100).toFixed(1)) : 0;

  const gradeA = Math.round(totalPassed * 0.14);
  const gradeB = Math.round(totalPassed * 0.22);
  const gradeC = Math.round(totalPassed * 0.3);
  const gradeD = Math.max(0, totalPassed - gradeA - gradeB - gradeC);

  // ---- Class performance rows (aggregate a class across all subjects) ----
  const classes: ExamClassPerformance[] = roster
    .map((klass, ci) => {
      const row = cells[ci];
      const entered = row.reduce((sum, c) => sum + c.entered, 0);
      const passed = row.reduce((sum, c) => sum + c.passed, 0);
      const avgSum = row.reduce((sum, c) => sum + c.average * c.entered, 0);
      return {
        classId: `cls_${ci + 1}`,
        className: klass.name,
        studentsCount: klass.students,
        totalMarks: entered,
        averageMark: entered > 0 ? Number((avgSum / entered).toFixed(2)) : 0,
        passed,
        failed: entered - passed,
        passRate: entered > 0 ? Number(((passed / entered) * 100).toFixed(1)) : 0,
      } satisfies ExamClassPerformance;
    })
    .sort((a, b) => b.averageMark - a.averageMark);

  // ---- Subject submission status (aggregate a subject across all classes) ----
  const subjects: ExamSubjectStat[] = MOCK_SUBJECTS.map((subject, si) => {
    const classBreakdown: ExamSubjectClassBreakdown[] = roster.map((klass, ci) => {
      const cell = cells[ci][si];
      return {
        classId: `cls_${ci + 1}`,
        className: klass.name,
        totalStudents: klass.students,
        marksEntered: cell.entered,
        marksPending: klass.students - cell.entered,
        completionRate:
          klass.students > 0 ? Number(((cell.entered / klass.students) * 100).toFixed(1)) : 0,
        hasMarks: cell.entered > 0,
      } satisfies ExamSubjectClassBreakdown;
    });

    const entered = classBreakdown.reduce((sum, c) => sum + c.marksEntered, 0);
    const avgSum = roster.reduce((sum, _klass, ci) => sum + cells[ci][si].average * cells[ci][si].entered, 0);
    const passed = roster.reduce((sum, _klass, ci) => sum + cells[ci][si].passed, 0);
    const average = entered > 0 ? Number((avgSum / entered).toFixed(2)) : 0;

    return {
      subjectId: `sub_${si + 1}`,
      subjectName: subject.name,
      subjectCode: subject.code,
      marksEntered: entered,
      studentsAssessed: entered,
      totalExpected: totalStudents,
      averageMark: average,
      highestMark: entered > 0 ? Number(Math.min(20, average + faker.number.float({ min: 3, max: 6 })).toFixed(1)) : null,
      lowestMark: entered > 0 ? Number(Math.max(0, average - faker.number.float({ min: 4, max: 7 })).toFixed(1)) : null,
      passRate: entered > 0 ? Number(((passed / entered) * 100).toFixed(1)) : 0,
      submitted: entered >= totalStudents && totalStudents > 0,
      examDate: null,
      classBreakdown,
    } satisfies ExamSubjectStat;
  }).sort((a, b) => b.marksEntered - a.marksEntered);

  const totalSubjects = MOCK_SUBJECTS.length;
  const submittedSubjects = subjects.filter((s) => s.submitted).length;
  const totalExpectedMarks = totalStudents * totalSubjects;

  return {
    exam,
    totalSubjects,
    submittedSubjects,
    pendingSubjects: totalSubjects - submittedSubjects,
    totalMarksEntered,
    totalExpectedMarks,
    completionRate:
      totalExpectedMarks > 0 ? Number(((totalMarksEntered / totalExpectedMarks) * 100).toFixed(1)) : 0,
    averageMark,
    highestMark: totalMarksEntered > 0 ? Number(Math.min(20, averageMark + 5).toFixed(1)) : 0,
    lowestMark: totalMarksEntered > 0 ? Number(Math.max(0, averageMark - 8).toFixed(1)) : 0,
    passRate,
    gradeDistribution: { A: gradeA, B: gradeB, C: gradeC, D: gradeD, E: totalFailed },
    classes,
    subjects,
  };
}
