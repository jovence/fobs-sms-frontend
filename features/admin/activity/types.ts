export type ActivityType =
  | "enrollment"
  | "marks"
  | "attendance"
  | "payment"
  | "teacher"
  | "school";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  description: string;
  actor: string;
  school: string;
  at: string;
}

export interface ActivityQuery {
  page: number;
  perPage: number;
  search?: string;
  type?: ActivityType;
  sortBy?: keyof ActivityEntry;
  sortDir?: "asc" | "desc";
}
