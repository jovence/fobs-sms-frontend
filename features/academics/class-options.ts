import type { ClassOption } from "./api/academics.service";

export type ClassSectionKey = "english" | "french";

export const CLASS_SECTIONS: ClassSectionKey[] = ["english", "french"];

export function classesBySection(classes: ClassOption[]) {
  return {
    english: classes.filter((c) => c.section === "english"),
    french: classes.filter((c) => c.section === "french"),
    other: classes.filter((c) => !c.section),
  };
}

export function classLabel(
  cls: ClassOption,
  labels: {
    lower: string;
    upper: string;
    english: string;
    french: string;
  },
) {
  const level = cls.level ? labels[cls.level] : null;
  const section = cls.section ? labels[cls.section] : null;
  const meta = [section, level].filter(Boolean).join(" · ");

  return meta ? `${cls.name} (${meta})` : cls.name;
}
